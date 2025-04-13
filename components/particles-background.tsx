"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "@/contexts/theme-context"

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  color: string
  baseX: number
  baseY: number
}

interface MousePosition {
  x: number | null
  y: number | null
  radius: number
}

export default function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>(0)
  const mouseRef = useRef<MousePosition>({ x: null, y: null, radius: 100 })

  // Inizializza le dimensioni del canvas
  useEffect(() => {
    const updateDimensions = () => {
      if (typeof window !== "undefined") {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)

    return () => {
      window.removeEventListener("resize", updateDimensions)
    }
  }, [])

  // Gestisci il movimento del mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
        radius: 100,
      }
    }

    const handleMouseLeave = () => {
      mouseRef.current = {
        x: null,
        y: null,
        radius: 100,
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  // Inizializza le particelle
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return

    const particles: Particle[] = []
    const particleCount = Math.min(Math.floor((dimensions.width * dimensions.height) / 8000), 150)

    for (let i = 0; i < particleCount; i++) {
      const size = Math.random() * 2 + 0.5
      const opacity = Math.random() * 0.5 + 0.2
      const color = theme === "dark" ? `rgba(255, 255, 255, ${opacity})` : `rgba(107, 114, 128, ${opacity})`
      const x = Math.random() * dimensions.width
      const y = Math.random() * dimensions.height

      particles.push({
        x,
        y,
        baseX: x,
        baseY: y,
        size,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity,
        color,
      })
    }

    particlesRef.current = particles
  }, [dimensions, theme])

  // Anima le particelle
  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0 || dimensions.height === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Imposta le dimensioni del canvas
    canvas.width = dimensions.width
    canvas.height = dimensions.height

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Disegna e aggiorna le particelle
      particlesRef.current.forEach((particle) => {
        // Interazione con il mouse
        let dx = 0
        let dy = 0

        if (mouseRef.current.x !== null && mouseRef.current.y !== null) {
          const mouseX = mouseRef.current.x
          const mouseY = mouseRef.current.y
          const distance = Math.sqrt(Math.pow(mouseX - particle.x, 2) + Math.pow(mouseY - particle.y, 2))

          if (distance < mouseRef.current.radius) {
            const force = (mouseRef.current.radius - distance) / mouseRef.current.radius
            const angle = Math.atan2(particle.y - mouseY, particle.x - mouseX)
            dx = force * Math.cos(angle) * 2
            dy = force * Math.sin(angle) * 2
          }
        }

        // Disegna la particella
        ctx.fillStyle = particle.color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()

        // Aggiorna la posizione
        particle.x += particle.speedX + dx
        particle.y += particle.speedY + dy

        // Ritorna lentamente alla posizione base quando non c'è interazione
        if (dx === 0 && dy === 0) {
          particle.x += (particle.baseX - particle.x) * 0.01
          particle.y += (particle.baseY - particle.y) * 0.01
        }

        // Gestisci il rimbalzo ai bordi
        if (particle.x < 0 || particle.x > dimensions.width) {
          particle.speedX *= -1
          particle.x = particle.x < 0 ? 0 : dimensions.width
        }
        if (particle.y < 0 || particle.y > dimensions.height) {
          particle.speedY *= -1
          particle.y = particle.y < 0 ? 0 : dimensions.height
        }
      })

      // Disegna le connessioni tra particelle vicine
      ctx.strokeStyle = theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(107, 114, 128, 0.05)"
      ctx.lineWidth = 0.5

      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i]
          const p2 = particlesRef.current[j]
          const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
          const maxDistance = 100

          if (distance < maxDistance) {
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [dimensions, theme])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.8 }}
    />
  )
}
