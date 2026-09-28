const redis = require('../config/redis');

module.exports = (io) => {
  io.on('connection', (socket) => {
    socket.on('watch_event', async ({ eventId, sessionId }) => {
      if (!eventId || !sessionId) return;
      socket.join(`event_${eventId}`);
      await redis.hset(`socket_info:${socket.id}`, 'eventId', eventId, 'sessionId', sessionId);
      await redis.expire(`socket_info:${socket.id}`, 86400);
      const oldSocketId = await redis.get(`active_session:${sessionId}`);
      let count;
      if (oldSocketId) {
        const currentCount = await redis.get(`event_watchers:${eventId}`);
        count = currentCount ? parseInt(currentCount, 10) : 1;
      } else {
        count = await redis.incr(`event_watchers:${eventId}`);
      }
      await redis.set(`active_session:${sessionId}`, socket.id, 'EX', 86400);
      io.to(`event_${eventId}`).emit('update_viewer_count', { eventId, count });
    });

    socket.on('listen_event', (eventId) => {
      if (!eventId) return;
      socket.join(`event_${eventId}`);
    });

    socket.on('unlisten_event', (eventId) => {
      if (!eventId) return;
      socket.leave(`event_${eventId}`);
    });

    socket.on('join_event', async ({ eventId, sessionId }) => {
      if (!eventId || !sessionId) return;
      socket.join(`event_${eventId}`);
      await redis.hset(`socket_info:${socket.id}`, 'eventId', eventId, 'sessionId', sessionId);
      await redis.expire(`socket_info:${socket.id}`, 86400);
      const oldSocketId = await redis.get(`active_session:${sessionId}`);
      let count;
      if (oldSocketId) {
        const currentCount = await redis.get(`event_watchers:${eventId}`);
        count = currentCount ? parseInt(currentCount, 10) : 1;
      } else {
        count = await redis.incr(`event_watchers:${eventId}`);
      }
      await redis.set(`active_session:${sessionId}`, socket.id, 'EX', 86400);
      io.to(`event_${eventId}`).emit('update_viewer_count', { eventId, count });
    });

    socket.on('join_artwork', (artworkId) => {
      socket.join(`artwork_${artworkId}`);
    });

    socket.on('leave_artwork', (artworkId) => {
      socket.leave(`artwork_${artworkId}`);
    });

    socket.on('leave_event', async (eventId) => {
      await handleLeave(socket, io, eventId);
    });

    socket.on('disconnect', async () => {
      const socketInfo = await redis.hgetall(`socket_info:${socket.id}`);
      if (socketInfo && socketInfo.eventId && socketInfo.sessionId) {
        const { eventId, sessionId } = socketInfo;
        const currentActiveSocketId = await redis.get(`active_session:${sessionId}`);
        if (currentActiveSocketId === socket.id) {
          let count = await redis.decr(`event_watchers:${eventId}`);
          if (count < 0) {
            count = 0;
            await redis.set(`event_watchers:${eventId}`, 0);
          }
          await redis.del(`active_session:${sessionId}`);
          io.to(`event_${eventId}`).emit('update_viewer_count', { eventId, count });
        } else {
          console.log(`[Socket] Bỏ qua kết nối ma từ lượt F5 của session: ${sessionId}`);
        }
        await redis.del(`socket_info:${socket.id}`);
      }
    });
  });
};

async function handleLeave(socket, io, eventId) {
  if (!eventId) return;
  socket.leave(`event_${eventId}`);
  let count = await redis.decr(`event_watchers:${eventId}`);
  if (count < 0) {
    count = 0;
    await redis.set(`event_watchers:${eventId}`, 0);
  }
  io.to(`event_${eventId}`).emit('update_viewer_count', { eventId, count });
}