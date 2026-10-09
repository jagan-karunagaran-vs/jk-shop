/**
 * Idempotent seed script for JK Shop demo products + demo reviews.
 *
 * SAFETY GUARANTEES (per requirements):
 *  - Never calls dropDatabase() or a blanket deleteMany().
 *  - Preserves all existing users, orders, and products.
 *  - Safe to run multiple times: products are upserted by unique `name`
 *    (skipped if already present), and reviews are only added from demo
 *    users who haven't already reviewed that specific product.
 *
 * DEMO REVIEWERS:
 *  Two fixed demo user accounts are created (if not already present) with
 *  clearly-labeled names and a random unusable password (they're not
 *  meant to be logged into). Their reviews are prefixed with a "[Demo review]"
 *  tag inside the stored comment text and rendered distinctly in the UI
 *  (see ProductDetail.jsx changes) so they are never mistaken for real
 *  customer feedback.
 *
 * USAGE:
 *   From the ecommerce-backend/ folder:
 *     node seed/seedProducts.js
 *
 * Requires the same .env / MONGO_URI used by the main server.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/dbConnection');
const Product = require('../models/product');
const User = require('../models/user');
const productsData = require('./productsData');

const DEMO_REVIEWERS = [
  { name: 'JK Shop Demo Reviewer 1', email: 'demo.reviewer1@jkshop.internal' },
  { name: 'JK Shop Demo Reviewer 2', email: 'demo.reviewer2@jkshop.internal' },
  { name: 'JK Shop Demo Reviewer 3', email: 'demo.reviewer3@jkshop.internal' },
  { name: 'JK Shop Demo Reviewer 4', email: 'demo.reviewer4@jkshop.internal' },
];

// Fixed, varied review templates so ratings feel realistic but the run is
// deterministic (no Math.random) — same result every time you re-run it.
const REVIEW_TEMPLATES = [
  { rating: 5, comment: '[Demo review] Excellent quality, exceeded my expectations. Would buy again.' },
  { rating: 4, comment: '[Demo review] Good product overall, works as described. Minor room for improvement.' },
  { rating: 4, comment: '[Demo review] Solid value for the price. Delivery was quick too.' },
  { rating: 3, comment: '[Demo review] Decent, but not outstanding. Does the job for everyday use.' },
  { rating: 5, comment: '[Demo review] Very happy with this purchase, highly recommend to others.' },
];

const getOrCreateDemoUsers = async () => {
  const crypto = require('crypto');
  const users = [];

  for (const reviewer of DEMO_REVIEWERS) {
    let user = await User.findOne({ email: reviewer.email });

    if (!user) {
      // Random, unusable password — these accounts are never meant to log in.
      const unusablePassword = crypto.randomBytes(24).toString('hex');
      user = await User.create({
        name: reviewer.name,
        email: reviewer.email,
        password: unusablePassword, // hashed automatically by the User model's pre-save hook
        role: 'user',
        isActive: true,
      });
      console.log(`  Created demo reviewer user: ${reviewer.name}`);
    }

    users.push(user);
  }

  return users;
};

const buildReviewsForProduct = (product, demoUsers, reviewCountForThisProduct) => {
  const reviews = [];

  for (let i = 0; i < reviewCountForThisProduct; i++) {
    const reviewer = demoUsers[i % demoUsers.length];
    const template = REVIEW_TEMPLATES[(product.name.length + i) % REVIEW_TEMPLATES.length];

    reviews.push({
      user: reviewer._id,
      name: reviewer.name,
      rating: template.rating,
      comment: template.comment,
    });
  }

  return reviews;
};

const seed = async () => {
  await connectDB();
  console.log('Connected. Starting seed...\n');

  const demoUsers = await getOrCreateDemoUsers();

  let createdCount = 0;
  let skippedCount = 0;
  let reviewsAddedCount = 0;

  for (let idx = 0; idx < productsData.length; idx++) {
    const data = productsData[idx];

    const existing = await Product.findOne({ name: data.name });

    if (existing) {
      // Product already seeded previously — never re-insert or duplicate it.
      // Still check if it's missing demo reviews (e.g. script was interrupted
      // partway through a previous run) and top them up idempotently.
      const alreadyReviewedUserIds = new Set(
        existing.reviews.map((r) => r.user.toString())
      );
      const missingReviewers = demoUsers.filter(
        (u) => !alreadyReviewedUserIds.has(u._id.toString())
      );

      const targetReviewCount = 2 + (idx % 3); // 2, 3, or 4 reviews per product
      const stillNeeded = Math.max(0, targetReviewCount - existing.reviews.length);
      const reviewersToAdd = missingReviewers.slice(0, stillNeeded);

      if (reviewersToAdd.length > 0) {
        const newReviews = buildReviewsForProduct(existing, reviewersToAdd, reviewersToAdd.length);
        existing.reviews.push(...newReviews);
        existing.ratings.count = existing.reviews.length;
        existing.ratings.average =
          existing.reviews.reduce((acc, r) => acc + r.rating, 0) / existing.reviews.length;
        await existing.save();
        reviewsAddedCount += newReviews.length;
        console.log(`  Topped up reviews for existing product: ${data.name}`);
      }

      skippedCount++;
      continue;
    }

    const targetReviewCount = 2 + (idx % 3); // cycles 2, 3, 4
    const reviews = buildReviewsForProduct(data, demoUsers, targetReviewCount);

    const ratingsAverage =
      reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    const product = await Product.create({
      ...data,
      reviews,
      ratings: {
        average: Math.round(ratingsAverage * 10) / 10,
        count: reviews.length,
      },
    });

    createdCount++;
    reviewsAddedCount += reviews.length;
    console.log(`  Created: ${product.name} (${reviews.length} demo reviews)`);
  }

  console.log('\n--- Seed Summary ---');
  console.log(`New products created: ${createdCount}`);
  console.log(`Existing products skipped/topped up: ${skippedCount}`);
  console.log(`Total demo reviews added this run: ${reviewsAddedCount}`);
  console.log(`Demo reviewer accounts in use: ${demoUsers.length}`);
  console.log('Existing users, orders, and non-matching products were left untouched.\n');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((error) => {
  console.error('Seed script failed:', error);
  mongoose.connection.close();
  process.exit(1);
});