"use client"

import { useEffect, useRef } from "react"

export function GlobeVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (parent) {
        canvas.width = parent.clientWidth
        canvas.height = parent.clientHeight
      }
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Animation variables
    let animationId: number
    let rotation = 0

    // Points for network visualization
    const points: { lat: number; lng: number; size: number; pulse: number }[] = []
    
    // Generate random points
    for (let i = 0; i < 100; i++) {
      points.push({
        lat: Math.random() * 180 - 90,
        lng: Math.random() * 360 - 180,
        size: Math.random() * 2 + 1,
        pulse: Math.random() * Math.PI * 2,
      })
    }

    // Convert lat/lng to 3D coordinates
    const latLngTo3D = (lat: number, lng: number, radius: number) => {
      const phi = ((90 - lat) * Math.PI) / 180
      const theta = ((lng + rotation) * Math.PI) / 180

      return {
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.cos(phi),
        z: radius * Math.sin(phi) * Math.sin(theta),
      }
    }

    // Draw function
    const draw = () => {
      const width = canvas.width
      const height = canvas.height
      const centerX = width / 2
      const centerY = height / 2
      const radius = Math.min(width, height) * 0.35

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw outer glow
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.8,
        centerX,
        centerY,
        radius * 1.5
      )
      gradient.addColorStop(0, "rgba(34, 197, 94, 0.1)")
      gradient.addColorStop(1, "rgba(34, 197, 94, 0)")
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2)
      ctx.fill()

      // Draw globe outline
      ctx.strokeStyle = "rgba(34, 197, 94, 0.3)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.stroke()

      // Draw latitude lines
      ctx.strokeStyle = "rgba(34, 197, 94, 0.1)"
      ctx.lineWidth = 1
      for (let lat = -60; lat <= 60; lat += 30) {
        const y = centerY - (radius * lat) / 90
        const xRadius = radius * Math.cos((lat * Math.PI) / 180)
        ctx.beginPath()
        ctx.ellipse(centerX, y, xRadius, xRadius * 0.3, 0, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Draw longitude lines
      for (let lng = 0; lng < 360; lng += 30) {
        ctx.beginPath()
        for (let lat = -90; lat <= 90; lat += 5) {
          const point = latLngTo3D(lat, lng, radius)
          const screenX = centerX + point.x
          const screenY = centerY - point.y

          if (point.z > 0) {
            if (lat === -90) {
              ctx.moveTo(screenX, screenY)
            } else {
              ctx.lineTo(screenX, screenY)
            }
          }
        }
        ctx.stroke()
      }

      // Draw network points
      const time = Date.now() / 1000
      points.forEach((point) => {
        const pos = latLngTo3D(point.lat, point.lng, radius)

        if (pos.z > 0) {
          const screenX = centerX + pos.x
          const screenY = centerY - pos.y
          const depth = (pos.z + radius) / (2 * radius)
          const pulseSize = point.size + Math.sin(time * 2 + point.pulse) * 0.5

          // Point glow
          const pointGradient = ctx.createRadialGradient(
            screenX,
            screenY,
            0,
            screenX,
            screenY,
            pulseSize * 4
          )
          pointGradient.addColorStop(0, `rgba(34, 197, 94, ${depth * 0.8})`)
          pointGradient.addColorStop(1, "rgba(34, 197, 94, 0)")
          ctx.fillStyle = pointGradient
          ctx.beginPath()
          ctx.arc(screenX, screenY, pulseSize * 4, 0, Math.PI * 2)
          ctx.fill()

          // Point core
          ctx.fillStyle = `rgba(34, 197, 94, ${depth})`
          ctx.beginPath()
          ctx.arc(screenX, screenY, pulseSize, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      // Draw connections between nearby points
      ctx.strokeStyle = "rgba(34, 197, 94, 0.15)"
      ctx.lineWidth = 0.5
      points.forEach((point1, i) => {
        const pos1 = latLngTo3D(point1.lat, point1.lng, radius)
        if (pos1.z < 0) return

        points.slice(i + 1).forEach((point2) => {
          const pos2 = latLngTo3D(point2.lat, point2.lng, radius)
          if (pos2.z < 0) return

          const dist = Math.sqrt(
            Math.pow(pos1.x - pos2.x, 2) +
              Math.pow(pos1.y - pos2.y, 2) +
              Math.pow(pos1.z - pos2.z, 2)
          )

          if (dist < radius * 0.5) {
            const opacity = (1 - dist / (radius * 0.5)) * 0.3
            ctx.strokeStyle = `rgba(34, 197, 94, ${opacity})`
            ctx.beginPath()
            ctx.moveTo(centerX + pos1.x, centerY - pos1.y)
            ctx.lineTo(centerX + pos2.x, centerY - pos2.y)
            ctx.stroke()
          }
        })
      })

      rotation += 0.2
      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <div className="absolute inset-0">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}
