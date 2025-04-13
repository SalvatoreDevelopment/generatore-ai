"use client"

import { useSocket } from "@/hooks/use-socket"
import { useEffect, useState } from "react"

export default function SocketDebug() {
  const { socket, isConnected, checkConnection } = useSocket()
  const [messages, setMessages] = useState<string[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!socket) return

    const handleAnyEvent = (...args: any[]) => {
      const eventName = args[0]
      const data = args.slice(1)
      setMessages((prev) => [...prev, `Event: ${eventName}, Data: ${JSON.stringify(data)}`])
    }

    socket.onAny(handleAnyEvent)

    return () => {
      socket.offAny(handleAnyEvent)
    }
  }, [socket])

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`p-2 rounded-md ${isConnected ? "bg-green-500" : "bg-red-500"} text-white`}
      >
        Socket: {isConnected ? "Connected" : "Disconnected"}
      </button>

      {isVisible && (
        <div className="absolute bottom-10 left-0 w-80 max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-xs">
          <div className="flex justify-between mb-2">
            <span>Socket Debug</span>
            <button onClick={checkConnection} className="text-blue-500 hover:text-blue-700">
              Reconnect
            </button>
          </div>
          {messages.length === 0 ? (
            <p>No events received yet</p>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className="mb-1 pb-1 border-b border-gray-200 dark:border-gray-700">
                {msg}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
