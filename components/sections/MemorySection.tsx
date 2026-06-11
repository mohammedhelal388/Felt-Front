'use client'
import { useEffect, useRef, useState } from 'react'

const cards = [
  { emotion: 'nostalgic', text: '"You dissolved into blue, and found you were never small."', loc: 'Turkey · Mountain', pos: { top: '10%', left: '6%' } },
  { emotion: 'belonging', text: '"The city didn\'t welcome me. I welcomed myself."', loc: 'San Francisco · Dawn', pos: { top: '14%', right: '6%' } },
  { emotion: 'wonder', text: '"The sun refused to set. You understood why."', loc: 'Iceland · Midnight', pos: { bottom: '18%', left: '16%' } },
  { emotion: 'peace', text: '"Some places make you miss people you haven\'t lost yet."', loc: 'Ölüdeniz · Sunset', pos: { bottom: '14%', right: '6%' } },
]

const finalLines = [
  'Felt captures meaning.',
  'The way your chest tightened',
  'when you saw that view.',
  'The exact shade of peace',
  'you felt that afternoon.',
]

export default function MemorySection() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const [cardLit, setCardLit] = useState(-1)
  const [cardFlash, setCardFlash] = useState(-1)
  const [linesShown, setLinesShown] = useState(0)
  const triggered = useRef(false)
  const progressRef = useRef(0)
  const heartBeat = useRef(1)
  const heartHovered = useRef(false)
  const mouseRef = useRef({ x: -999, y: -999 })
  const cardLitRef = useRef(-1)

  useEffect(() => {
    const canvas = canvasRef.current
    const section = sectionRef.current
    if (!canvas || !section) return
    const ctx = canvas.getContext('2d')!
    let t = 0

    const resize = () => {
      canvas.width = section.offsetWidth
      canvas.height = section.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const getHeart = () => ({ x: canvas.width * 0.5, y: canvas.height * 0.5 })

    const getCardCenters = () => {
      const W = canvas.width, H = canvas.height
      return [
        { x: W * 0.19, y: H * 0.20 },
        { x: W * 0.81, y: H * 0.24 },
        { x: W * 0.27, y: H * 0.76 },
        { x: W * 0.82, y: H * 0.76 },
      ]
    }

    // final destination: just above the text block
    const getFinalDest = () => ({ x: canvas.width * 0.5, y: canvas.height * 0.82 })

    const getWaypoints = () => [getHeart(), ...getCardCenters(), getFinalDest()]

    const getSegLengths = () => {
      const pts = getWaypoints()
      return pts.slice(0, -1).map((p, i) => {
        const q = pts[i + 1]
        return Math.hypot(q.x - p.x, q.y - p.y)
      })
    }

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top }
      const h = getHeart()
      heartHovered.current = Math.hypot(mouseRef.current.x - h.x, mouseRef.current.y - h.y) < 26
    }
    const onClick = () => {
      if (heartHovered.current && !triggered.current) triggered.current = true
    }
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('click', onClick)

    // card flash — bright burst then settle
    const triggerFlash = (idx: number) => {
      setCardFlash(idx)
      setTimeout(() => setCardFlash(-1), 900)
    }

    // line reveal lines one by one
    const revealLines = () => {
      for (let i = 0; i < finalLines.length; i++) {
        setTimeout(() => setLinesShown(i + 1), i * 600)
      }
    }

    const draw = () => {
      const W = canvas.width, H = canvas.height
      ctx.clearRect(0, 0, W, H)

      const heart = getHeart()
      const waypoints = getWaypoints()
      const segLengths = getSegLengths()
      const totalLen = segLengths.reduce((a, b) => a + b, 0)

      // beating heart — systole/diastole rhythm
      const beat = Math.pow(Math.max(0, Math.sin(t * 2.2)), 8) * 0.35
      const hScale = 1 + beat + (heartHovered.current ? 0.1 : 0)
      heartBeat.current = hScale

      // heart glow
      const glowR = 50 * hScale
      const glow = ctx.createRadialGradient(heart.x, heart.y, 0, heart.x, heart.y, glowR * 2)
      glow.addColorStop(0, `rgba(200,151,90,${0.22 + beat * 0.4})`)
      glow.addColorStop(0.4, `rgba(200,151,90,${0.06 + beat * 0.1})`)
      glow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(heart.x, heart.y, glowR * 2, 0, Math.PI * 2)
      ctx.fill()

      // heart shape
      ctx.save()
      ctx.translate(heart.x, heart.y)
      ctx.scale(hScale, hScale)
      const s = 12
      ctx.fillStyle = triggered.current ? 'rgba(200,151,90,0.55)' : 'rgba(200,151,90,0.92)'
      ctx.beginPath()
      for (let a = 0; a <= Math.PI * 2; a += 0.01) {
        const hx = s * 16 * Math.pow(Math.sin(a), 3) / 16
        const hy = -s * (13*Math.cos(a) - 5*Math.cos(2*a) - 2*Math.cos(3*a) - Math.cos(4*a)) / 16
        a < 0.01 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy)
      }
      ctx.closePath()
      ctx.fill()
      ctx.globalAlpha = 0.5
      ctx.fillStyle = '#fff5cc'
      const ss = s * 0.4
      ctx.beginPath()
      for (let a = 0; a <= Math.PI * 2; a += 0.01) {
        const hx = ss * 16 * Math.pow(Math.sin(a), 3) / 16
        const hy = -ss * (13*Math.cos(a) - 5*Math.cos(2*a) - 2*Math.cos(3*a) - Math.cos(4*a)) / 16
        a < 0.01 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy)
      }
      ctx.closePath()
      ctx.fill()
      ctx.restore()

      // "touch me" text
      if (!triggered.current) {
        ctx.save()
        ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * 1.4)
        ctx.fillStyle = '#c8975a'
        ctx.font = 'italic 13px Georgia, serif'
        ctx.textAlign = 'center'
        ctx.fillText('touch me', heart.x, heart.y + 32)
        ctx.restore()
      }

      // travelling line
      if (triggered.current) {
        progressRef.current = Math.min(1, progressRef.current + 0.0018) // slower
        const currentDist = progressRef.current * totalLen
        let dist = 0
        let lineEnd = { ...waypoints[0] }
        let currentSeg = 0

        for (let i = 0; i < segLengths.length; i++) {
          if (dist + segLengths[i] >= currentDist) {
            const frac = (currentDist - dist) / segLengths[i]
            lineEnd = {
              x: waypoints[i].x + (waypoints[i+1].x - waypoints[i].x) * frac,
              y: waypoints[i].y + (waypoints[i+1].y - waypoints[i].y) * frac,
            }
            currentSeg = i
            break
          }
          dist += segLengths[i]
        }

        // check card arrivals
        let cumDist = 0
        for (let i = 0; i < 4; i++) {
          cumDist += segLengths[i]
          const thresh = cumDist / totalLen
          if (progressRef.current >= thresh - 0.008 && cardLitRef.current < i) {
            cardLitRef.current = i
            setCardLit(i)
            triggerFlash(i)
          }
        }
        // final destination
        if (progressRef.current >= 0.97) revealLines()

        // SOLID glowing line — draw all completed segments + current partial
        ctx.save()
        ctx.lineWidth = 1.5
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        // draw each completed segment with solid gold line
        let dd = 0
        for (let i = 0; i <= currentSeg; i++) {
          const isLast = i === currentSeg
          const p1 = waypoints[i]
          const p2 = isLast ? lineEnd : waypoints[i + 1]
          // gradient along segment
          const lg = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y)
          lg.addColorStop(0, 'rgba(200,151,90,0.35)')
          lg.addColorStop(1, 'rgba(200,151,90,0.65)')
          ctx.strokeStyle = lg
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.stroke()
          if (!isLast) dd += segLengths[i]
        }
        ctx.restore()

        // sparkly head
        const sparkle = 0.7 + 0.3 * Math.sin(t * 12)
        const hg = ctx.createRadialGradient(lineEnd.x, lineEnd.y, 0, lineEnd.x, lineEnd.y, 20)
        hg.addColorStop(0, `rgba(255,245,180,${0.95 * sparkle})`)
        hg.addColorStop(0.3, `rgba(200,151,90,${0.5 * sparkle})`)
        hg.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = hg
        ctx.beginPath()
        ctx.arc(lineEnd.x, lineEnd.y, 20, 0, Math.PI * 2)
        ctx.fill()
        // sparkle cross
        ctx.save()
        ctx.globalAlpha = 0.6 * sparkle
        ctx.strokeStyle = '#ffe8a0'
        ctx.lineWidth = 0.8
        const sl = 7
        ;[[0,-sl,0,sl],[-sl,0,sl,0],[- sl*0.7,-sl*0.7,sl*0.7,sl*0.7],[sl*0.7,-sl*0.7,-sl*0.7,sl*0.7]].forEach(([x1,y1,x2,y2]) => {
          ctx.beginPath()
          ctx.moveTo(lineEnd.x+x1, lineEnd.y+y1)
          ctx.lineTo(lineEnd.x+x2, lineEnd.y+y2)
          ctx.stroke()
        })
        ctx.restore()
        // bright core dot
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(lineEnd.x, lineEnd.y, 2, 0, Math.PI * 2)
        ctx.fill()

        // soft trail
        for (let j = 1; j <= 22; j++) {
          const td = Math.max(0, currentDist - j * 16)
          let dd2 = 0, tx = waypoints[0].x, ty = waypoints[0].y
          for (let i = 0; i < segLengths.length; i++) {
            if (dd2 + segLengths[i] >= td) {
              const f2 = (td - dd2) / segLengths[i]
              tx = waypoints[i].x + (waypoints[i+1].x - waypoints[i].x) * f2
              ty = waypoints[i].y + (waypoints[i+1].y - waypoints[i].y) * f2
              break
            }
            dd2 += segLengths[i]
          }
          ctx.save()
          ctx.globalAlpha = (1 - j/22) * 0.4
          ctx.fillStyle = '#c8975a'
          ctx.beginPath()
          ctx.arc(tx, ty, 1.4, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
      }

      t += 0.016
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('click', onClick)
    }
  }, [])

  return (
    <section ref={sectionRef} style={{
      position: 'relative', zIndex: 2,
      minHeight: '620px', overflow: 'hidden',
    }}>
      <canvas ref={canvasRef} style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'auto', zIndex: 1,
      }} />

      {/* floating memory cards */}
      {cards.map((card, i) => (
        <div key={i} style={{
          position: 'absolute',
          ...card.pos,
          width: '205px',
          background: cardLit >= i ? 'rgba(12,24,15,0.96)' : 'rgba(6,13,8,0.3)',
          border: `1px solid rgba(200,151,90,${cardFlash === i ? 0.9 : cardLit >= i ? 0.22 : 0.04})`,
          borderRadius: '12px',
          padding: '1.1rem 1.35rem',
          backdropFilter: 'blur(6px)',
          zIndex: 4,
          opacity: cardLit >= i ? 1 : 0.18,
          transform: cardLit >= i
            ? cardFlash === i ? 'translateY(-4px) scale(1.04)' : 'translateY(0) scale(1)'
            : 'translateY(6px) scale(0.97)',
          transition: cardFlash === i
            ? 'all 0.15s ease'
            : 'all 1.2s cubic-bezier(0.16,1,0.3,1)',
          boxShadow: cardFlash === i
            ? '0 0 40px rgba(200,151,90,0.5), 0 12px 40px rgba(0,0,0,0.4)'
            : cardLit >= i
              ? '0 6px 28px rgba(0,0,0,0.35)'
              : 'none',
          animation: cardLit >= i && cardFlash !== i ? `float ${5+i}s ${i*0.6}s ease-in-out infinite` : 'none',
        }}>
          <p style={{
            fontSize: '0.6rem', letterSpacing: '0.28em',
            color: cardLit >= i ? 'var(--gold)' : 'rgba(200,151,90,0.15)',
            textTransform: 'uppercase', marginBottom: '0.5rem',
            fontFamily: "'Cormorant Garamond', serif",
            transition: 'color 0.8s ease',
          }}>
            {card.emotion}
          </p>
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic', fontSize: '0.83rem',
            color: cardLit >= i ? 'var(--parchment)' : 'rgba(200,190,168,0.1)',
            lineHeight: 1.6,
            transition: 'color 1s ease',
          }}>
            {card.text}
          </p>
          <p style={{
            fontSize: '0.63rem',
            color: cardLit >= i ? 'var(--muted)' : 'rgba(107,138,114,0.1)',
            marginTop: '0.55rem',
            transition: 'color 0.8s ease',
          }}>
            📍 {card.loc}
          </p>
        </div>
      ))}

      {/* final destination — lines appear one by one */}
      <div style={{
        position: 'absolute',
        top: '82%',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        zIndex: 4,
        pointerEvents: 'none',
        paddingTop: '0.5rem',
      }}>
        {finalLines.map((line, i) => (
          <p key={i} style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic',
            fontSize: '0.88rem',
            color: 'rgba(200,190,168,0.7)',
            lineHeight: 1.9,
            letterSpacing: '0.03em',
            opacity: linesShown > i ? 1 : 0,
            transform: linesShown > i ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 1.2s ease, transform 1.2s ease',
          }}>
            {line}
          </p>
        ))}
      </div>

      <div style={{ height: '620px' }} />
    </section>
  )
}