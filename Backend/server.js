require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const errorHandler = require('./src/middlewares/error.middleware');

const socketHandle = require('./src/socket/socketHandle');
const connectMongo = require('./src/config/mongo');
const { connectPostgres } = require('./src/config/postgres');
const { sequelize } = require('./src/models/postgres/index');
const setupAdmin = require('./admin/index');

const artworkRoute = require('./src/routes/artwork.route');
const authRoute = require('./src/routes/auth.route');
const categoryRoute = require('./src/routes/categoty.route');
const collectionRoute = require('./src/routes/collection.route');
const commentRoute = require('./src/routes/comment.route');
const contentRoute = require('./src/routes/content.route');
const eventRoute = require('./src/routes/event.route');
const likeRoute = require('./src/routes/like.router');
const searchRoute = require('./src/routes/search.route');
const submissionRoute = require('./src/routes/submission.router');
const userRoute = require('./src/routes/user.route');

const app = express();
const server = http.createServer(app);

console.log('--- Connecting to Databases ---');
connectMongo();
connectPostgres();

app.use(cookieParser());
app.use(morgan('dev'));
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174"
  ],
  credentials: true
}));

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
(async () => {
  try {
    await sequelize.authenticate();
    setupAdmin(app); 
    console.log('✅ AdminJS setup success');
  } catch (error) {
    console.error('❌ AdminJS setup failed:', error);
  }
})();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});
socketHandle(io);

app.use('/api/artwork', artworkRoute);
app.use('/api/auth', authRoute);
app.use('/api/category', categoryRoute);
app.use('/api/collection', collectionRoute);
app.use('/api/comment', commentRoute);
app.use('/api/content', contentRoute);
app.use('/api/event', eventRoute);
app.use('/api/like', likeRoute);
app.use('/api/search', searchRoute);
app.use('/api/submission', submissionRoute);
app.use('/api/user', userRoute);
app.use(errorHandler);

// 8. START SERVER
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Server is running on port ${PORT}`);
  console.log(`➜  Local:   http://localhost:${PORT}`);
  console.log(`➜  Admin:   http://localhost:${PORT}/admin`);
});