require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const errorHandler = require('./src/middlewares/error.middleware');
const socketHandle = require('./src/socket/socketHandle');
const connectMongo = require('./src/config/mongo');
const { connectPostgres } = require('./src/config/postgres');

const artworkRoute = require('./src/routes/artwork.route');
const statisticsRoute = require('./src/routes/statistics.route');
const authRoute = require('./src/routes/auth.route');
const collectionRoute = require('./src/routes/collection.route');
const commentRoute = require('./src/routes/comment.route');
const contentRoute = require('./src/routes/content.route');
const eventRoute = require('./src/routes/event.route');
const likeRoute = require('./src/routes/like.router');
const searchRoute = require('./src/routes/search.route');
const submissionRoute = require('./src/routes/submission.router');
const userRoute = require('./src/routes/user.route');
const aiRoute = require('./src/routes/ai.route');
const uploadArray = require('./src/routes/uploadArray.route');

require('./src/queues/ai.worker');

const app = express();
const server = http.createServer(app);

async function startServer() {
  console.log('--- Connecting to Databases ---');
  await connectMongo();
  await connectPostgres();

  app.use(cookieParser());
  app.use(morgan('dev'));
  app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true
  }));

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"]
    }
  });

  socketHandle(io);
  global.io = io;

  app.use((req, res, next) => {
    req.io = io;
    next();
  });

  app.use('/api/artwork', artworkRoute);
  app.use('/api/statistics', statisticsRoute);
  app.use('/api/auth', authRoute);
  app.use('/api/collection', collectionRoute);
  app.use('/api/comment', commentRoute);
  app.use('/api/content', contentRoute);
  app.use('/api/event', eventRoute);
  app.use('/api/like', likeRoute);
  app.use('/api/search', searchRoute);
  app.use('/api/submission', submissionRoute);
  app.use('/api/user', userRoute);
  app.use('/api/ai', aiRoute);
  app.use('/api/uploadArray', uploadArray);

  app.use(errorHandler);

  const PORT = process.env.PORT || 5000;

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n Server chạy tại cổng ${PORT}`);
    console.log(`➜  Local: http://localhost:${PORT}`);
  });

}

startServer().catch((error) => {
  console.error('Lỗi khởi chạy server:', error);
  process.exit(1);
});