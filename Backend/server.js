require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const socetHandle = require ('./src/socket/socketHandle')

const connectMongo = require('./src/config/mongo');
const { connectPostgres } = require('./src/config/postgres');

// 1. Init App
const app = express();
const server = http.createServer(app); // Tạo HTTP Server bọc lấy Express

// 2. Init Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Link frontend của bạn
    methods: ["GET", "POST"]
  }
});
socketHandle(io);

const cookieParser = require('cookie-parser');
const socketHandle = require('./src/socket/socketHandle');
app.use(cookieParser());

// 3. Middlewares
app.use(helmet()); // Bảo mật HTTP headers
app.use(cors()); // Cho phép Frontend gọi API
app.use(morgan('dev')); // Log request ra terminal
app.use(express.json()); // Đọc dữ liệu JSON từ body request
app.use(express.urlencoded({ extended: true }));

// 4. Connect Database
console.log('--- Connecting to Databases ---');
connectMongo();     // Kết nối MongoDB
connectPostgres();  // Kết nối PostgreSQL

// 5. Basic Route (Test Server)
app.get('/', (req, res) => {
  res.json({
    message: 'Backend đã hoạt động! 🚀',
    timestamp: new Date()
  });
});

// 6. Socket.io Events (Demo mắt xem live sau này viết tiếp ở đây)
io.on('connection', (socket) => {
  console.log('🔌 New Client Connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔌 Client Disconnected:', socket.id);
  });
});

// 7. Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Server is running on port ${PORT}`);
  console.log(`➜  Local:   http://localhost:${PORT}`);
});