import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const ADMIN_PASSWORD = "admin123" // Usa la stessa password dell'admin panel

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    // Verifica la password
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ success: false, message: "Password non valida" }, { status: 401 })
    }

    // Imposta il cookie globale
    const timestamp = Date.now().toString()
    cookies().set("global_reset_timestamp", timestamp, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 settimana
    })

    // Emetti un evento per notificare i client
    try {
      // Usa l'URL del sottodominio
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

      const response = await fetch(`${baseUrl}/api/socket-emit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "limits-reset",
          data: { timestamp },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Socket emit response error:", errorData)
      }
    } catch (socketError) {
      console.error("Failed to emit socket event:", socketError)
      // Continua anche se l'emissione dell'evento fallisce
    }

    return NextResponse.json({
      success: true,
      message: "Limiti resettati per tutti gli utenti in tempo reale.",
    })
  } catch (error) {
    console.error("Error in reset-all-limits:", error)
    return NextResponse.json({ success: false, message: "Errore interno del server" }, { status: 500 })
  }
}
