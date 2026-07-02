import { Server } from 'socket.io';

const io = new Server({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const ORDER_ROOM_PREFIX = 'order:';

io.on('connection', (socket) => {
  console.log(`[chat] connected: ${socket.id}`);

  socket.on('join-order', (orderId: string) => {
    const room = `${ORDER_ROOM_PREFIX}${orderId}`;
    socket.join(room);
  });

  socket.on('leave-order', (orderId: string) => {
    const room = `${ORDER_ROOM_PREFIX}${orderId}`;
    socket.leave(room);
  });

  socket.on('send-message', (data: { orderId: string; message: any }) => {
    if (!data.orderId || !data.message) return;
    const room = `${ORDER_ROOM_PREFIX}${data.orderId}`;
    io.to(room).emit('new-message', data.message);
  });

  socket.on('disconnect', () => {
    console.log(`[chat] disconnected: ${socket.id}`);
  });
});

const PORT = 3003;
io.listen(PORT);
console.log(`[chat-service] Socket.IO server running on port ${PORT}`);