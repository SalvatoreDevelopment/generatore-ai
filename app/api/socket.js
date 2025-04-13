import { Server } from 'socket.io';

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const io = new Server(res.socket.server, {
      // Configurazione specifica per il sottodominio
      cors: {
        origin: process.env.NEXT_PUBLIC_BASE_URL || 'https://generator.tuodominio.com',
        methods: ["GET", "POST"],
        credentials: true
      }
    });
    
    res.socket.server.io = io;

    io.on('connection', socket => {
      console.log(`Client connected: ${socket.id}`);
      
      // Evento di test per verificare la connessione
      socket.emit('welcome', { message: 'WebSocket connection established!' });
      
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }
  res.end();
};

export default SocketHandler;