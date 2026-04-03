import { io } from "socket.io-client";

let socket;

export const connectSocket = (userId) => {
  socket = io("http://localhost:5000");

  socket.emit("setup", userId);
};

export default {
  on: (...args) => socket.on(...args),
  emit: (...args) => socket.emit(...args),
  off: (...args) => socket.off(...args),
};
 