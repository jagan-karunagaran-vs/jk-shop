require('dotenv').config();
const mongoose = require('mongoose');
const prompts = require('prompts');
const connectDB = require('../config/dbConnection');
const User = require('../models/user');

const ADMIN_USERNAMES = ['jkadmin1', 'jkadmin2', 'jkadmin3', 'jkadmin4'];
const ADMIN_EMAIL_DOMAIN = 'admin.jkshop.internal';

const usernameToEmail = (username) => `${username}@${ADMIN_EMAIL_DOMAIN}`;

const run = async () => {
  await connectDB();
  console.log('Connected. Starting admin account setup...\n');

  for (const username of ADMIN_USERNAMES) {
    const email = usernameToEmail(username);
    const existing = await User.findOne({ email });

    if (existing) {
      if (existing.role !== 'admin') {
        console.log(`"${username}" exists but is not role=admin. Skipping password change — no silent role escalation performed.`);
        console.log(`  -> Resolve manually if this account should become admin.\n`);
        continue;
      }

      const response = await prompts({
        type: 'confirm',
        name: 'reset',
        message: `Admin account "${username}" already exists. Reset its password?`,
        initial: false,
      });

      if (!response.reset) {
        console.log(`  Skipping "${username}" — existing password preserved.\n`);
        continue;
      }

      const pwResponse = await prompts({
        type: 'password',
        name: 'password',
        message: `Enter new password for "${username}" (min 6 chars):`,
      });

      if (!pwResponse.password || pwResponse.password.length < 6) {
        console.log(`  Invalid password entered. Skipping "${username}".\n`);
        continue;
      }

      existing.password = pwResponse.password;
      await existing.save();
      console.log(`  Password updated for "${username}".\n`);
      continue;
    }

    console.log(`Creating new admin account: "${username}"`);
    const pwResponse = await prompts({
      type: 'password',
      name: 'password',
      message: `Enter password for "${username}" (min 6 chars):`,
    });

    if (!pwResponse.password || pwResponse.password.length < 6) {
      console.log(`  Invalid password entered. Skipping "${username}".\n`);
      continue;
    }

    await User.create({
      name: username,
      email,
      password: pwResponse.password,
      role: 'admin',
      isActive: true,
    });

    console.log(`  Admin account "${username}" created.\n`);
  }

  console.log('Admin setup complete.');
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((error) => {
  console.error('Admin setup failed:', error);
  mongoose.connection.close();
  process.exit(1);
});