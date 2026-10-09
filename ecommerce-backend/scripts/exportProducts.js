const path = require('path');
const fs = require('fs/promises');
const mongoose = require('mongoose');

require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
});

const connectDB = require('../config/dbConnection');
const Product = require('../models/product');

const escapeCSV = (value) => {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
};

const exportProducts = async () => {
  try {
    await connectDB();

    const products = await Product.find({ isActive: true })
      .select('_id name category brand price discountPrice ratings stock')
      .sort({ _id: 1 })
      .lean();

    if (products.length === 0) {
      throw new Error('No active products found. Check your database.');
    }

    const headers = [
      'productId',
      'name',
      'category',
      'brand',
      'price',
      'rating',
      'reviewCount',
      'stock',
    ];

    const rows = products.map((product) => {
      const originalPrice = Number(product.price);
      const discountPrice = Number(product.discountPrice);

      const effectivePrice =
        discountPrice > 0 && discountPrice < originalPrice
          ? discountPrice
          : originalPrice;

      if (!Number.isFinite(effectivePrice) || effectivePrice < 0) {
        throw new Error(`Invalid price for product: ${product._id}`);
      }

      return [
        product._id.toString(),
        product.name,
        product.category,
        product.brand || 'Generic',
        effectivePrice,
        product.ratings?.average ?? 0,
        product.ratings?.count ?? 0,
        product.stock ?? 0,
      ];
    });

    const outputDirectory = path.resolve(__dirname, '../rapidminer');
    await fs.mkdir(outputDirectory, { recursive: true });

    const outputPath = path.join(outputDirectory, 'products.csv');

    const csv = [
      headers.map(escapeCSV).join(','),
      ...rows.map((row) => row.map(escapeCSV).join(',')),
    ].join('\r\n');

    await fs.writeFile(outputPath, `${csv}\r\n`, 'utf8');

    console.log(`Exported ${products.length} products.`);
    console.log(`CSV file: ${outputPath}`);
    console.log('Existing database records were not changed.');
  } catch (error) {
    console.error(`Export failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

exportProducts();