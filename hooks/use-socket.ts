"use client"

import { useEffect, useState, useRef } from "react"
import io, { type Socket } from "socket.io-client"

// Mantieni una singola istanza del socket per tutta l'applicazione
let globalSocket: Socket | null = null

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const socketInitializedRef = useRef(false)

  useEffect(() => {
    // Funzione per inizializzare il socket
    const initializeSocket = async () => {
      if (globalSocket) return

      try {
        // Inizializza il socket server
        await fetch("/api/socket")

        // Crea il client socket
        globalSocket = io({
          path: "/api/socket",
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        })

        globalSocket.on("connect", () => {
          console.log("Socket connected with ID:", globalSocket?.id)
          setIsConnected(true)
        })

        globalSocket.on("disconnect", () => {
          console.log("Socket disconnected")
          setIsConnected(false)
        })

        globalSocket.on("error", (error) => {
          console.error("Socket error:", error)
        })

        // Evento di test
        globalSocket.on("welcome", (data) => {
          console.log("Received welcome message:", data)
        })

        socketInitializedRef.current = true
      } catch (error) {
        console.error("Failed to initialize socket:", error)
      }
    }

    if (!socketInitializedRef.current) {
      initializeSocket()
    }

    // Cleanup function
    return () => {
      // Non disconnettiamo il socket quando il componente viene smontato
      // per mantenere una connessione persistente
    }
  }, [])

  // Funzione per verificare la connessione
  const checkConnection = () => {
    if (globalSocket && !globalSocket.connected) {
      console.log("Socket not connected, reconnecting...")
      globalSocket.connect()
    }
  }

  return {
    socket: globalSocket,
    isConnected,
    checkConnection,
  }
}
