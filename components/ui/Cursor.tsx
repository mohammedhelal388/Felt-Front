'use client'
import { useEffect, useRef, useState } from 'react'

export default function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const haloRef = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: -100, y: -100 })
  const ring = useRef({ x: -100, y: -100 })
  const [isHovering, setIsHovering] = useState(false)
  const sparksRef = useRef<HTMLDivElement>(null)
  const lastSpark = useRef(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const colors = ['#c8975a', '#7cb987', '#b87333', '#c8bfa8', '#5a9e6f', '#f5f0e8', '#dba96e']

    const spawnSpark = (x: number, y: number, count = 2) => {
      if (!sparksRef.current) return
      for (let i = 0; i < count; i++) {
        const s = document.createElement('div')
        const sz = Math.random() * 5 + 1
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 60 + 15
        const tx = Math.cos(angle) * speed
        const ty = Math.sin(angle) * speed - 25
        const dur = 0.5 + Math.random() * 0.5
        const col = colors[Math.floor(Math.random() * colors.length)]
        s.style.cssText = `
          position:fixed;border-radius:50%;pointer-events:none;z-index:9996;
          left:${x}px;top:${y}px;
          width:${sz}px;height:${sz}px;
          background:${col};
          transform:translate(-50%,-50%);
          transition:transform ${dur}s ease-out, opacity ${dur}s ease-out;
          opacity:0.9;
        `
        sparksRef.current.appendChild(s)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            s.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`
            s.style.opacity = '0'
          })
        })
        setTimeout(() => s.remove(), dur * 1000 + 100)
      }
    }

    const onMouseMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + 'px'
        cursorRef.current.style.top = e.clientY + 'px'
      }
      if (haloRef.current) {
        haloRef.current.style.left = e.clientX + 'px'
        haloRef.current.style.top = e.clientY + 'px'
      }
      const now = Date.now()
      if (now - lastSpark.current > 40) {
        lastSpark.current = now
        spawnSpark(e.clientX, e.clientY, 2)
      }
    }

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a')) {
        setIsHovering(true)
        spawnSpark(pos.current.x, pos.current.y, 6)
      } else {
        setIsHovering(false)
      }
    }

    function animateRing() {
      ring.current.x += (pos.current.x - ring.current.x) * 0.1
      ring.current.y += (pos.current.y - ring.current.y) * 0.1
      if (ringRef.current) {
        ringRef.current.style.left = ring.current.x + 'px'
        ringRef.current.style.top = ring.current.y + 'px'
      }
      rafRef.current = requestAnimationFrame(animateRing)
    }
    rafRef.current = requestAnimationFrame(animateRing)

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseover', onMouseOver)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseover', onMouseOver)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <>
      <div ref={sparksRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9996 }} />

      {/* Main dot */}
      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          width: isHovering ? '14px' : '8px',
          height: isHovering ? '14px' : '8px',
          borderRadius: '50%',
          background: 'var(--gold)',
          pointerEvents: 'none',
          zIndex: 9999,
          transform: 'translate(-50%, -50%)',
          transition: 'width 0.2s, height 0.2s',
          mixBlendMode: 'screen',
          boxShadow: '0 0 10px rgba(200,151,90,0.8)',
        }}
      />

      {/* Trailing ring */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          width: isHovering ? '52px' : '32px',
          height: isHovering ? '52px' : '32px',
          borderRadius: '50%',
          border: '1px solid rgba(200,151,90,0.5)',
          pointerEvents: 'none',
          zIndex: 9998,
          transform: 'translate(-50%, -50%)',
          transition: 'width 0.3s, height 0.3s, border-color 0.3s',
          boxShadow: isHovering ? '0 0 20px rgba(200,151,90,0.3), inset 0 0 20px rgba(200,151,90,0.1)' : 'none',
        }}
      />

      {/* Glow halo — illuminates everything it passes over */}
      <div
        ref={haloRef}
        style={{
          position: 'fixed',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200,151,90,0.08) 0%, rgba(90,158,111,0.04) 40%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 9995,
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'screen',
          transition: 'opacity 0.3s',
        }}
      />
    </>
  )
}
