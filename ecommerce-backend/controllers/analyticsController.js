const fs = require('node:fs/promises');
const path = require('node:path');
const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');
const { AppError } = require('../middleware/errorHandler');
const { getDiscountPercent, getEffectivePrice } = require('../utils/pricing');

const BEST_SELLER_MIN_ORDERS =
  parseInt(process.env.BEST_SELLER_MIN_ORDERS, 10) || 10;

const LOW_STOCK_THRESHOLD =
  parseInt(process.env.LOW_STOCK_THRESHOLD, 10) || 10;

const SIMILARITY_FILE = path.join(
  __dirname,
  '..',
  'rapidminer',
  'product_similarity.csv'
);

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

let similarityCache = {
  signature: null,
  scores: null,
  exportedAt: null,
};

const attachPricingInfo = (productDoc) => {
  const product = productDoc.toObject
    ? productDoc.toObject()
    : productDoc;

  const discountInfo = getDiscountPercent(product);

  return {
    ...product,
    effectivePrice: getEffectivePrice(product),
    discountPercent: discountInfo.roundedPercent,
    hasDiscount: discountInfo.hasDiscount,
  };
};

const getLimit = (value, fallback, maximum = 30) => {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0
    ? Math.min(parsed, maximum)
    : fallback;
};

const toPercent = (score) =>
  Math.round(score * 10000) / 100;

// These labels describe similarity strength, not statistical confidence.
const getSimilarityLabel = (score) => {
  if (score === null) return null;
  return score > 70 ? 'high' : score > 40 ? 'medium' : 'low';
};

// This parser is intentionally restricted to this export's three fields:
// request ObjectId, document ObjectId, numeric cosine similarity.
const readSimilarityData = async () => {
  let stat;
  let content;

  try {
    stat = await fs.stat(SIMILARITY_FILE);
    const signature = `${stat.mtimeMs}:${stat.size}`;

    if (
      similarityCache.scores &&
      similarityCache.signature === signature
    ) {
      return similarityCache;
    }

    content = await fs.readFile(SIMILARITY_FILE, 'utf8');
  } catch (error) {
    console.error('Cannot read RapidMiner CSV:', error.message);
    throw new AppError('Recommendation data is unavailable', 503);
  }

  const lines = content
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim() !== '');

  const header = (lines[0] || '')
    .split(',')
    .map((field) => field.trim().replace(/^"|"$/g, ''));

  if (
    header.length !== 3 ||
    header[0] !== 'request' ||
    header[1] !== 'document' ||
    header[2] !== 'distance'
  ) {
    throw new AppError('Invalid recommendation CSV header', 503);
  }

  const scores = new Map();

  for (let index = 1; index < lines.length; index += 1) {
    const fields = lines[index]
      .split(',')
      .map((field) => field.trim().replace(/^"|"$/g, ''));

    const [requestId, documentId, rawScore] = fields;
    const score = Number(rawScore);

    if (
      fields.length !== 3 ||
      !OBJECT_ID_PATTERN.test(requestId || '') ||
      !OBJECT_ID_PATTERN.test(documentId || '') ||
      !rawScore ||
      !Number.isFinite(score) ||
      score < -0.000001 ||
      score > 1.000001
    ) {
      throw new AppError(
        `Invalid recommendation CSV data at line ${index + 1}`,
        503
      );
    }

    const from = requestId.toLowerCase();
    const to = documentId.toLowerCase();

    if (!scores.has(from)) scores.set(from, new Map());

    // Exclude self-recommendations.
    if (from === to) continue;

    // Cross Distances retains the "distance" column name.
    // This export uses CosineSimilarity + compute similarities enabled:
    // larger values mean greater similarity. Do not invert the score.
    const normalizedScore = Math.max(0, Math.min(1, score));
    const existingScore = scores.get(from).get(to);

    if (
      existingScore === undefined ||
      normalizedScore > existingScore
    ) {
      scores.get(from).set(to, normalizedScore);
    }
  }

  if (scores.size === 0) {
    throw new AppError('Recommendation CSV contains no products', 503);
  }

  similarityCache = {
    signature: `${stat.mtimeMs}:${stat.size}`,
    scores,
    exportedAt: stat.mtime.toISOString(),
  };

  return similarityCache;
};

const getPurchasedProductIds = async (userId) => {
  const ids = await Order.distinct('orderItems.product', {
    user: userId,
    orderStatus: { $ne: 'Cancelled' },
  });

  return [...new Set(
    ids.filter(Boolean).map((id) => String(id).toLowerCase())
  )];
};

const getPersonalizedScores = (scores, purchasedIds) => {
  const purchased = new Set(purchasedIds);
  const candidates = new Map();

  for (const purchasedId of purchasedIds) {
    const related = scores.get(purchasedId);
    if (!related) continue;

    for (const [productId, score] of related) {
      if (purchased.has(productId) || score <= 0) continue;

      // Match each candidate to the most similar previously purchased item.
      const existing = candidates.get(productId);

      if (existing === undefined || score > existing) {
        candidates.set(productId, score);
      }
    }
  }

  return candidates;
};

const getRankedProducts = async (scores, limit) => {
  const ranked = [...scores.entries()]
    .filter(([, score]) => score > 0)
    .sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
    );

  if (ranked.length === 0) return [];

  // Filter unavailable products before applying the display limit.
  const products = await Product.find({
    _id: { $in: ranked.map(([id]) => id) },
    isActive: true,
    stock: { $gt: 0 },
  });

  const productMap = new Map(
    products.map((product) => [String(product._id), product])
  );

  return ranked
    .filter(([id]) => productMap.has(id))
    .slice(0, limit)
    .map(([id, score]) => ({
      product: attachPricingInfo(productMap.get(id)),
      score: toPercent(score),
    }));
};

const getProductRecommendationScore = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!OBJECT_ID_PATTERN.test(productId)) {
      return next(new AppError('Invalid product ID', 400));
    }

    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    });

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    const data = await readSimilarityData();
    const purchasedIds = await getPurchasedProductIds(req.user._id);
    const candidates = getPersonalizedScores(
      data.scores,
      purchasedIds
    );

    const rawScore = candidates.get(productId.toLowerCase());
    const score = rawScore === undefined ? null : toPercent(rawScore);

    res.status(200).json({
      success: true,
      source: 'rapidminer-csv',
      method: 'cosine-similarity',
      productId,
      userId: req.user._id,
      recommendationScore: score,
      confidence: getSimilarityLabel(score),
      confidenceMeaning: 'Similarity strength, not a probability',
      reason:
        score === null
          ? 'No positive match to an unpurchased product from purchase history'
          : 'Similarity to previously purchased products',
      exportedAt: data.exportedAt,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

const getPersonalizedRecommendations = async (req, res, next) => {
  try {
    const limit = getLimit(req.query.limit, 6);
    const data = await readSimilarityData();
    const purchasedIds = await getPurchasedProductIds(req.user._id);

    const candidates = getPersonalizedScores(
      data.scores,
      purchasedIds
    );

    const ranked = await getRankedProducts(candidates, limit);

    if (ranked.length > 0) {
      return res.status(200).json({
        success: true,
        source: 'rapidminer-csv',
        method: 'cosine-similarity',
        mode: 'purchase-history',
        userId: req.user._id,
        count: ranked.length,
        recommendations: ranked.map(({ product, score }) => ({
          product,
          recommendationScore: score,
          confidence: getSimilarityLabel(score),
        })),
        confidenceMeaning: 'Similarity strength, not a probability',
        exportedAt: data.exportedAt,
        generatedAt: new Date().toISOString(),
      });
    }

    // Honest cold-start fallback: no invented personalized scores.
    const fallbackProducts = await Product.find({
      isActive: true,
      stock: { $gt: 0 },
      _id: { $nin: purchasedIds },
    })
      .sort({
        'ratings.average': -1,
        'ratings.count': -1,
        _id: 1,
      })
      .limit(limit);

    res.status(200).json({
      success: true,
      source: 'catalog-fallback',
      mode: 'top-rated',
      reason:
        purchasedIds.length === 0
          ? 'No purchase history yet'
          : 'No available matching products in the current export',
      userId: req.user._id,
      count: fallbackProducts.length,
      recommendations: fallbackProducts.map((product) => ({
        product: attachPricingInfo(product),
        recommendationScore: null,
        confidence: null,
      })),
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

const getRelatedProducts = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!OBJECT_ID_PATTERN.test(productId)) {
      return next(new AppError('Invalid product ID', 400));
    }

    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    });

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    const data = await readSimilarityData();
    const scores =
      data.scores.get(productId.toLowerCase()) || new Map();

    const ranked = await getRankedProducts(
      scores,
      getLimit(req.query.limit, 4, 12)
    );

    res.status(200).json({
      success: true,
      source: 'rapidminer-csv',
      method: 'cosine-similarity',
      baseProductId: productId,
      related: ranked.map(({ product: relatedProduct, score }) => ({
        product: relatedProduct,
        affinityScore: score,
      })),
      exportedAt: data.exportedAt,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

const getBestSellers = async (req, res, next) => {
  try {
    const limit = getLimit(req.query.limit, 10);

    const distinctNonCancelledOrders = await Order.countDocuments({
      orderStatus: { $ne: 'Cancelled' },
    });

    if (distinctNonCancelledOrders >= BEST_SELLER_MIN_ORDERS) {
      const salesAgg = await Order.aggregate([
        { $match: { orderStatus: { $ne: 'Cancelled' } } },
        { $unwind: '$orderItems' },
        {
          $group: {
            _id: '$orderItems.product',
            totalQuantitySold: { $sum: '$orderItems.quantity' },
          },
        },
        { $sort: { totalQuantitySold: -1 } },
        { $limit: limit },
      ]);

      const productIds = salesAgg.map((item) => item._id);

      const products = await Product.find({
        _id: { $in: productIds },
        isActive: true,
      });

      const productMap = new Map(
        products.map((p) => [p._id.toString(), p])
      );

      const bestSellers = salesAgg
        .filter((item) => productMap.has(item._id.toString()))
        .map((item) => ({
          product: attachPricingInfo(
            productMap.get(item._id.toString())
          ),
          totalQuantitySold: item.totalQuantitySold,
        }));

      return res.status(200).json({
        success: true,
        mode: 'sales-based',
        minOrdersRequired: BEST_SELLER_MIN_ORDERS,
        nonCancelledOrderCount: distinctNonCancelledOrders,
        bestSellers,
      });
    }

    const curated = await Product.find({
      isBestSeller: true,
      isActive: true,
    }).limit(limit);

    res.status(200).json({
      success: true,
      mode: 'curated',
      minOrdersRequired: BEST_SELLER_MIN_ORDERS,
      nonCancelledOrderCount: distinctNonCancelledOrders,
      bestSellers: curated.map((product) => ({
        product: attachPricingInfo(product),
        totalQuantitySold: null,
      })),
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments({
      isActive: true,
    });

    const totalCustomers = await User.countDocuments({
      role: 'user',
    });

    const totalOrders = await Order.countDocuments();

    const lowStockCount = await Product.countDocuments({
      isActive: true,
      stock: { $lte: LOW_STOCK_THRESHOLD },
    });

    const paidRevenueAgg = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          orderStatus: { $ne: 'Cancelled' },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' },
        },
      },
    ]);

    const pendingCodRevenueAgg = await Order.aggregate([
      {
        $match: {
          isPaid: false,
          paymentMethod: 'CashOnDelivery',
          orderStatus: { $ne: 'Cancelled' },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' },
        },
      },
    ]);

    const paidRevenue =
      paidRevenueAgg.length > 0 ? paidRevenueAgg[0].total : 0;

    const pendingCodRevenue =
      pendingCodRevenueAgg.length > 0
        ? pendingCodRevenueAgg[0].total
        : 0;

    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalCustomers,
        totalOrders,
        lowStockCount,
        lowStockThreshold: LOW_STOCK_THRESHOLD,
        paidRevenue,
        pendingCodRevenue,
        ordersByStatus,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductRecommendationScore,
  getPersonalizedRecommendations,
  getRelatedProducts,
  getBestSellers,
  getDashboardStats,
};