const redis = require('../config/redis');

module.exports = (io) => {
  io.on('connection', (socket) => {
    socket.on('join_event', async (eventSlug) => {
      socket.join(eventSlug);
      await redis.set(`socket_view:${socket.id}`, eventSlug, 'EX', 86400); // 1 ngày tự xóa cho chắc
      const count = await redis.incr(`event_watchers:${eventSlug}`);
      io.to(eventSlug).emit('update_viewer_count', count);
    });
    socket.on('leave_event', async (eventSlug) => {
       await handleLeave(socket, io, eventSlug);
    });
    socket.on('disconnect', async () => {
      const eventSlug = await redis.get(`socket_view:${socket.id}`);
      if (eventSlug) {
        await handleLeave(socket, io, eventSlug);
        await redis.del(`socket_view:${socket.id}`);
      }
    });
  });
};

async function handleLeave(socket, io, eventSlug) {
    if (!eventSlug) return;
    socket.leave(eventSlug);
    let count = await redis.decr(`event_watchers:${eventSlug}`);
    if (count < 0) {
        count = 0; 
        await redis.set(`event_watchers:${eventSlug}`, 0); 
    }
    io.to(eventSlug).emit('update_viewer_count', count);
}