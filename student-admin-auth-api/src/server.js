require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { logger, httpLoggerStream } = require('./config/logger');
const { connectDB } = require('./config/db');
const { env } = require('./config/env');
const studentAuthRoutes = require('./routes/auth/student.routes');
const adminAuthRoutes = require('./routes/auth/admin.routes');
const courseContentRoutes = require('./routes/courseContent.routes');
const studentCourseRoutes = require('./routes/studentCourse.routes');
const filesUploadRoutes = require('./routes/files.upload.routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security and basic middleware
app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP logging
app.use(morgan('combined', { stream: httpLoggerStream }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Routes
app.use('/api/v1/auth/student', studentAuthRoutes);
app.use('/api/v1/auth/admin', adminAuthRoutes);
app.use('/api/v1', courseContentRoutes);
app.use('/api/v1', studentCourseRoutes);
app.use('/api/v1/files', filesUploadRoutes);

// 404 & error handling
app.use(notFoundHandler);
app.use(errorHandler);

const server = http.createServer(app);

async function start() {
  try {
    await connectDB();

    server.listen(env.PORT, () => {
      logger.info(`Auth API listening on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (err) {
    logger.error('Failed to start server', { error: err.message });
    process.exit(1);
  }
}

start();

module.exports = { app, server };
