const mongoose = require('mongoose');
const { env } = require('./env');
const { logger } = require('./logger');

mongoose.set('strictQuery', true);

async function connectDB() {
  try {
    await mongoose.connect(env.MONGO_URI, {
      autoIndex: true,
    });
    logger.info('Connected to MongoDB');
  } catch (err) {
    logger.error('Error connecting to MongoDB', { error: err.message });
    throw err;
  }
}

module.exports = { connectDB };
