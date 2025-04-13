import { NextResponse, type NextRequest } from "next/server"

// Array per tenere traccia delle richieste per implementare rate limiting
interface RateLimitTracker {
  ip: string
  timestamp: number
  count: number
}

// Manteniamo un array in memoria per il rate limiting
// In produzione, sarebbe meglio usare Redis o un altro store distribuito
const rateLimitTrackers: RateLimitTracker[] = []

// Configurazione del rate limiting
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minuto in millisecondi
const MAX_REQUESTS_PER_WINDOW = 10 // Numero massimo di richieste per finestra

export async function middleware(request: NextRequest) {
  // Ottieni l'IP del client
  const ip = request.ip || "unknown"

  // Implementa rate limiting solo per le route API
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Pulisci i tracker vecchi
    const now = Date.now()
    while (rateLimitTrackers.length > 0 && rateLimitTrackers[0].timestamp < now - RATE_LIMIT_WINDOW) {
      rateLimitTrackers.shift()
    }

    // Cerca il tracker per questo IP
    let tracker = rateLimitTrackers.find((t) => t.ip === ip)

    if (!tracker) {
      // Crea un nuovo tracker se non esiste
      tracker = { ip, timestamp: now, count: 1 }
      rateLimitTrackers.push(tracker)
    } else {
      // Incrementa il contatore per questo IP
      tracker.count++

      // Verifica se ha superato il limite
      if (tracker.count > MAX_REQUESTS_PER_WINDOW) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: "Rate limit exceeded. Please try again later.",
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": "60",
            },
          },
        )
      }
    }

    // Aggiungi header di sicurezza
    const response = NextResponse.next()
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-XSS-Protection", "1; mode=block")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Applica il middleware solo alle route API
    "/api/:path*",
  ],
}
