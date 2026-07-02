'use client';

import { io as socketIOClient, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = socketIOClient('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function joinOrderRoom(orderId: string) {
  const s = getSocket();
  s.emit('join-order', orderId);
}

export function leaveOrderRoom(orderId: string) {
  const s = getSocket();
  s.emit('leave-order', orderId);
}

export function sendMessage(orderId: string, message: any) {
  const s = getSocket();
  s.emit('send-message', { orderId, message });
}

export function onNewMessage(cb: (message: any) => void) {
  const s = getSocket();
  s.on('new-message', cb);
  return () => { s.off('new-message', cb); };
}