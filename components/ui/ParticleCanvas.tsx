'use client'
import { useEffect, useRef } from 'react'

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const particlesRef = useRef<any[]>([])
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const COLORS = ['#c8975a', '#7cb987', '#b87333', '#c8bfa8', '#5a9e6f', '#f5f0e8', '#8fa897', '#dba96e']

    let W = canvas.width = window.innerWidth
    let H = canvas.height = window.innerHeight

    const resize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', resize)

    class Particle {
      x: number; y: number; size: number; color: string
      alpha: number; vx: number; vy: number
      life: number; maxLife: number; twinkle: number; currentAlpha: number

      constructor(init = false) {
        this.x = Math.random() * W
        this.y = init ? Math.random() * H : H + 10
        this.size = Math.random() * 2.5 + 0.3
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)]
        this.alpha = Math.random() * 0.7 + 0.1
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = -(Math.random() * 0.6 + 0.15)
        this.life = 0
        this.maxLife = Math.random() * 400 + 200
        this.twinkle = Math.random() * Math.PI * 2
        this.currentAlpha = 0
      }

      reset() {
        this.x = Math.random() * W
        this.y = H + 10
        this.size = Math.random() * 2.5 + 0.3
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)]
        this.alpha = Math.random() * 0.7 + 0.1
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = -(Math.random() * 0.6 + 0.15)
        this.life = 0
        this.maxLife = Math.random() * 400 + 200
        this.twinkle = Math.random() * Math.PI * 2
      }

      update() {
        const dx = this.x - mouseRef.current.x
        const dy = this.y - mouseRef.current.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 130) {
          const force = (130 - dist) / 130
          this.vx += (dx / dist) * force * 0.6
          this.vy += (dy / dist) * force * 0.6
        }
        this.vx *= 0.97
        this.vy *= 0.97
        this.vy -= 0.004
        this.x += this.vx
        this.y += this.vy
        this.life++
        this.twinkle += 0.04
        const lifeFrac = this.life / this.maxLife
        this.currentAlpha = this.alpha * Math.sin(lifeFrac * Math.PI) * (0.6 + 0.4 * Math.sin(this.twinkle))
        if (this.life > this.maxLife || this.y < -20) this.reset()
      }

      draw() {
        const alpha = Math.max(0, Math.min(1, this.currentAlpha))
        const hex = Math.floor(alpha * 255).toString(16).padStart(2, '0')
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = this.color + hex
        ctx.fill()
        if (this.size > 1.2) {
          ctx.beginPath()
          ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2)
          ctx.fillStyle = this.color + '12'
          ctx.fill()
        }
      }
    }

    particlesRef.current = Array.from({ length: 220 }, () => new Particle(true))

    const animate = () => {
      ctx.clearRect(0, 0, W, H)
      particlesRef.current.forEach(p => { p.update(); p.draw() })
      rafRef.current = requestAnimationFrame(animate)
    }
    animate()

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', onMove)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 1,
      }}
    />
  )
}
