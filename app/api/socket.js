// Modifica in pages/api/socket.js
import { Server } from 'socket.io';

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const io = new Server(res.socket.server, {
      cors: {
        origin: "*", // Permetti tutte le origini temporaneamente per debug
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling'], // Supporta entrambi i metodi
      allowEIO3: true // Compatibilità con client più vecchi
    });
    
    res.socket.server.io = io;

    io.on('connection', socket => {
      console.log(`Client connected: ${socket.id}`);
      
      // Invia un evento di test immediatamente dopo la connessione
      socket.emit('welcome', { message: 'WebSocket connection established!' });
      
      // Broadcast a tutti quando un nuovo client si connette
      socket.broadcast.emit('user-connected', { id: socket.id });
      
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }
  res.end();
};

export default SocketHandler;