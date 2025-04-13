export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    try {
      const { event, data } = req.body;
      
      if (!event) {
        return res.status(400).json({ error: 'Event name is required' });
      }
      
      // Verifica che il server socket sia inizializzato
      if (!res.socket.server.io) {
        // Inizializza il socket se non è già stato fatto
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/socket`);
        
        // Attendi un momento per assicurarsi che il socket sia inizializzato
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Verifica nuovamente
        if (!res.socket.server.io) {
          return res.status(500).json({ error: 'Failed to initialize socket server' });
        }
      }
      
      // Emetti l'evento a tutti i client connessi
      res.socket.server.io.emit(event, data);
      console.log(`Emitted event "${event}" with data:`, data);
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Socket emit error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }