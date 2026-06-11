'use client'
import { useEffect, useRef, useState } from 'react'

const lines = [
  { text: '"I showed my mother the moment I captured', gold: false, delay: 0 },
  { text: 'on that mountain in Turkey.', gold: false, delay: 800 },
  { text: 'She cried.', gold: true, delay: 1800 },
  { text: 'She said it was the first time she felt', gold: false, delay: 2700 },
  { text: 'like she was actually there with me."', gold: true, delay: 3600 },
]

const ORBS = [
  { phrase: 'she was actually there', x: 12, y: 18 },
  { phrase: 'the mountain remembered you', x: 82, y: 14 },
  { phrase: 'some feelings never leave', x: 22, y: 65 },
  { phrase: 'time stopped here once', x: 78, y: 72 },
  { phrase: 'this is where you felt it', x: 48, y: 82 },
  { phrase: 'you were alive in this moment', x: 65, y: 28 },
  { phrase: 'a feeling no camera could hold', x: 35, y: 38 },
  { phrase: 'the heart remembers everything', x: 88, y: 48 },
]

function SparkStar({ phrase, x, y, delay, index }: { phrase: string; x: number; y: number; delay: number; index: number }) {
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [phraseVisible, setPhraseVisible] = useState(false)
  const [phraseMount, setPhraseMount] = useState(false)
  const fadeTimer = useRef<NodeJS.Timeout>()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  const handleEnter = () => {
    setHovered(true)
    clearTimeout(fadeTimer.current)
    setPhraseMount(true)
    setTimeout(() => setPhraseVisible(true), 20)
  }

  const handleLeave = () => {
    setHovered(false)
    setPhraseVisible(false)
    fadeTimer.current = setTimeout(() => setPhraseMount(false), 1200)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width = 60
    const H = canvas.height = 60
    let t = 0
    const colors = ['#c8975a','#dba96e','#7cb987','#f5f0e8','#b87333']
    const color = colors[index % colors.length]

    const loop = () => {
      ctx.clearRect(0, 0, W, H)
      const cx = W / 2, cy = H / 2
      const pulse = 0.6 + 0.4 * Math.sin(t * 2.2 + index)
      const hov = hovered
      const size = (hov ? 12 : 7) * pulse

      // outer glow
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 3.5)
      glow.addColorStop(0, `rgba(255,240,160,${0.35 * pulse + (hov ? 0.2 : 0)})`)
      glow.addColorStop(0.4, `rgba(200,151,90,${0.1 * pulse})`)
      glow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(cx, cy, size * 3.5, 0, Math.PI * 2)
      ctx.fill()

      // 4-point star
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(t * (hov ? 0.8 : 0.25))
      ctx.strokeStyle = color
      ctx.lineWidth = hov ? 1.2 : 0.9
      ctx.globalAlpha = 0.8 + 0.2 * pulse
      const arms: [number,number,number,number][] = [
        [0, -size, 0, size],
        [-size, 0, size, 0],
        [-size*0.6, -size*0.6, size*0.6, size*0.6],
        [size*0.6, -size*0.6, -size*0.6, size*0.6],
      ]
      arms.forEach(([x1,y1,x2,y2]) => {
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke()
      })
      // center dot
      ctx.globalAlpha = pulse
      ctx.fillStyle = '#ffffff'
      ctx.beginPath(); ctx.arc(0, 0, hov ? 2.5 : 1.5, 0, Math.PI * 2); ctx.fill()
      ctx.restore()

      // small floating sparkles around the star
      if (hov) {
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2 + t * 1.5
          const r = size * 2 + Math.sin(t * 3 + i) * 3
          const sx = cx + Math.cos(a) * r
          const sy = cy + Math.sin(a) * r
          const sa = 0.4 + 0.4 * Math.sin(t * 4 + i)
          ctx.save()
          ctx.globalAlpha = sa
          ctx.fillStyle = color
          ctx.beginPath(); ctx.arc(sx, sy, 1.2, 0, Math.PI * 2); ctx.fill()
          ctx.restore()
        }
      }

      t += 0.016
      rafRef.current = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(rafRef.current)
  }, [hovered, index])

  return (
    <div style={{
      position: 'absolute',
      left: `${x}%`, top: `${y}%`,
      transform: 'translate(-50%,-50%)',
      zIndex: 12,
      opacity: visible ? 1 : 0,
      transition: 'opacity 2s ease',
    }}>
      <div
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        style={{ position: 'relative', cursor: 'none' }}
      >
        <canvas ref={canvasRef} style={{ width: '60px', height: '60px', display: 'block' }} />
        {phraseMount && (
          <div style={{
            position: 'absolute',
            bottom: '56px', left: '50%',
            transform: `translateX(-50%) translateY(${phraseVisible ? '0px' : '8px'})`,
            background: 'rgba(6,13,8,0.93)',
            border: '1px solid rgba(200,151,90,0.3)',
            borderRadius: '8px',
            padding: '0.45rem 0.9rem',
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic', fontSize: '0.8rem',
            color: 'var(--cream)', lineHeight: 1.6,
            whiteSpace: 'nowrap',
            pointerEvents: 'none', zIndex: 20,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            opacity: phraseVisible ? 1 : 0,
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}>
            "{phrase}"
          </div>
        )}
      </div>
    </div>
  )
}

export default function QuoteSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const [triggered, setTriggered] = useState(false)
  const [linesVisible, setLinesVisible] = useState(lines.map(() => false))
  const [authorVisible, setAuthorVisible] = useState(false)
  const [eyebrowVisible, setEyebrowVisible] = useState(false)
  const starHovered = useRef(false)
  const mouseRef = useRef({ x: -999, y: -999 })
  const triggeredRef = useRef(false)
  const timers = useRef<NodeJS.Timeout[]>([])

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

    // background stars
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random(), y: Math.random(),
      size: Math.random() * 1.4 + 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 1.0,
      bright: Math.random(),
      isIdea: Math.random() > 0.9,
      streaking: false,
      streakProgress: 0,
      streakAngle: 0,
      streakLen: 0,
      nextStreak: Math.random() * 10 + 5,
    }))

    const getCenter = () => ({ x: canvas.width * 0.5, y: canvas.height * 0.5 })

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top }
      const c = getCenter()
      starHovered.current = Math.hypot(mouseRef.current.x - c.x, mouseRef.current.y - c.y) < 30
    }

    const onClick = () => {
      if (starHovered.current && !triggeredRef.current) {
        triggeredRef.current = true
        setTriggered(true)
        timers.current.push(setTimeout(() => setEyebrowVisible(true), 300))
        lines.forEach((line, i) => {
          timers.current.push(setTimeout(() => {
            setLinesVisible(prev => { const n = [...prev]; n[i] = true; return n })
          }, 600 + i * 450))
        })
        timers.current.push(setTimeout(() => setAuthorVisible(true), 600 + lines.length * 450 + 600))
      }
    }

    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('click', onClick)

    const draw = () => {
      const W = canvas.width, H = canvas.height
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#060d08'
      ctx.fillRect(0, 0, W, H)

      // deep center glow
      const cg = ctx.createRadialGradient(W*.5, H*.5, 0, W*.5, H*.5, W*.55)
      cg.addColorStop(0, 'rgba(12,28,16,0.9)')
      cg.addColorStop(1, 'rgba(6,13,8,0)')
      ctx.fillStyle = cg
      ctx.fillRect(0, 0, W, H)

      // background stars
      stars.forEach(s => {
        const x = s.x * W, y = s.y * H
        const pulse = 0.35 + 0.65 * Math.abs(Math.sin(t * s.speed * 0.45 + s.phase))
        const alpha = (0.18 + s.bright * 0.55) * pulse

        if (s.isIdea) {
          s.nextStreak -= 0.016
          if (s.nextStreak <= 0 && !s.streaking) {
            s.streaking = true; s.streakProgress = 0
            s.streakAngle = Math.random() * Math.PI * 2
            s.streakLen = 50 + Math.random() * 90
            s.nextStreak = Math.random() * 14 + 7
          }
          if (s.streaking) {
            s.streakProgress += 0.022
            const sa = Math.sin(s.streakProgress * Math.PI) * 0.55
            const ex = x + Math.cos(s.streakAngle) * s.streakLen * s.streakProgress
            const ey = y + Math.sin(s.streakAngle) * s.streakLen * s.streakProgress
            ctx.save()
            const sg = ctx.createLinearGradient(x, y, ex, ey)
            sg.addColorStop(0, `rgba(255,248,220,${sa})`)
            sg.addColorStop(1, 'rgba(200,151,90,0)')
            ctx.strokeStyle = sg; ctx.lineWidth = 0.9
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, ey); ctx.stroke()
            ctx.restore()
            if (s.streakProgress >= 1) { s.streaking = false; s.streakProgress = 0 }
          }
        }

        ctx.save()
        ctx.globalAlpha = alpha
        ctx.fillStyle = s.bright > 0.75 ? '#fffef0' : '#d0d8f8'
        ctx.beginPath()
        ctx.arc(x, y, s.size * pulse, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      // vignette
      const vig = ctx.createRadialGradient(W*.5, H*.5, H*.08, W*.5, H*.5, H*.85)
      vig.addColorStop(0, 'rgba(0,0,0,0)')
      vig.addColorStop(1, 'rgba(0,0,0,0.52)')
      ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H)

      // CENTER STAR — only when not triggered
      if (!triggeredRef.current) {
        const c = getCenter()
        const hov = starHovered.current
        const pulse = 0.65 + 0.35 * Math.sin(t * 2.2)
        const size = (hov ? 16 : 11) * pulse

        // large breathing aura
        const aura = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, size * 10)
        aura.addColorStop(0, `rgba(200,151,90,${0.28 + (hov ? 0.2 : 0) * pulse})`)
        aura.addColorStop(0.3, `rgba(200,151,90,${0.08 * pulse})`)
        aura.addColorStop(0.6, `rgba(90,158,111,${0.04 * pulse})`)
        aura.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = aura
        ctx.beginPath(); ctx.arc(c.x, c.y, size * 10, 0, Math.PI * 2); ctx.fill()

        // medium glow
        const mglow = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, size * 4)
        mglow.addColorStop(0, `rgba(255,240,160,${0.7 * pulse})`)
        mglow.addColorStop(0.4, `rgba(200,151,90,${0.35 * pulse})`)
        mglow.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = mglow
        ctx.beginPath(); ctx.arc(c.x, c.y, size * 4, 0, Math.PI * 2); ctx.fill()

        // star shape — 8 pointed
        ctx.save()
        ctx.translate(c.x, c.y)
        ctx.rotate(t * 0.4)
        ctx.globalAlpha = 0.9 * pulse
        ctx.strokeStyle = '#ffe8a0'
        ctx.lineWidth = hov ? 1.4 : 1.0
        const arms: [number,number,number,number][] = [
          [0,-size,0,size],[-size,0,size,0],
          [-size*0.7,-size*0.7,size*0.7,size*0.7],
          [size*0.7,-size*0.7,-size*0.7,size*0.7],
        ]
        arms.forEach(([x1,y1,x2,y2]) => {
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke()
        })
        ctx.globalAlpha = pulse
        ctx.fillStyle = '#ffffff'
        ctx.beginPath(); ctx.arc(0, 0, hov ? 3 : 2, 0, Math.PI * 2); ctx.fill()
        ctx.restore()

        // "reach me" text — bigger and more visible
        ctx.save()
        ctx.globalAlpha = 0.55 + 0.35 * Math.sin(t * 1.3)
        ctx.fillStyle = '#c8975a'
        ctx.font = `italic 14px 'Playfair Display', Georgia, serif`
        ctx.textAlign = 'center'
        ctx.fillText('reach me', c.x, c.y + size * 4 + 22)
        ctx.restore()
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
      timers.current.forEach(clearTimeout)
    }
  }, [])

  return (
    <section ref={sectionRef} style={{
      position: 'relative', width: '100%',
      height: '88vh', minHeight: '520px',
      overflow: 'hidden', zIndex: 2,
    }}>
      <canvas ref={canvasRef} style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%', display: 'block',
      }} />

      {/* fades */}
      <div style={{ position:'absolute',top:0,left:0,right:0,height:'80px',background:'linear-gradient(to top,transparent,var(--forest))',zIndex:3,pointerEvents:'none' }} />
      <div style={{ position:'absolute',bottom:0,left:0,right:0,height:'100px',background:'linear-gradient(to bottom,transparent,var(--forest))',zIndex:3,pointerEvents:'none' }} />

      {/* small header above star — always visible */}
      {!triggered && (
        <div style={{
          position:'absolute',top:'15%',left:'50%',
          transform:'translateX(-50%)',
          textAlign:'center',zIndex:10,pointerEvents:'none',
        }}>
          <p style={{
            fontFamily:"'Cormorant Garamond',serif",
            fontStyle:'italic',fontSize:'0.78rem',
            color:'rgba(200,151,90,0.5)',letterSpacing:'0.42em',
            textTransform:'uppercase',marginBottom:'0.5rem',
          }}>
            a felt moment
          </p>
          <p style={{
            fontFamily:"'Playfair Display',serif",
            fontStyle:'italic',fontSize:'0.85rem',
            color:'rgba(200,151,90,0.3)',letterSpacing:'0.15em',
            animation:'pulse 2.5s ease-in-out infinite',
          }}>
            reach the star
          </p>
        </div>
      )}

      {/* sparkly stars scattered everywhere — appear after triggered */}
      {triggered && ORBS.map((orb, i) => (
        <SparkStar
          key={i}
          phrase={orb.phrase}
          x={orb.x}
          y={orb.y}
          delay={4000 + i * 400}
          index={i}
        />
      ))}

      {/* quote — only renders after triggered */}
      {triggered && (
        <div style={{
          position:'absolute', inset:0,
          display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
          padding:'3rem', zIndex:10, pointerEvents:'none',
        }}>
          <p style={{
            fontFamily:"'Cormorant Garamond',serif",
            fontStyle:'italic', fontSize:'0.78rem',
            color:'rgba(200,151,90,0.7)', letterSpacing:'0.42em',
            textTransform:'uppercase', marginBottom:'2rem',
            opacity: eyebrowVisible ? 1 : 0,
            transform: eyebrowVisible ? 'translateY(0)' : 'translateY(14px)',
            transition:'opacity 1.2s ease, transform 1.2s ease',
          }}>
            ✦ &nbsp; a felt moment &nbsp; ✦
          </p>

          {lines.map((line, i) => (
            <span key={i} style={{
              fontFamily:"'Playfair Display',serif",
              fontStyle:'italic',
              fontSize:'clamp(1.2rem,2.8vw,2rem)',
              color: line.gold ? 'rgba(200,151,90,0.95)' : 'rgba(245,240,232,0.95)',
              lineHeight:1.82, textAlign:'center',
              maxWidth:'720px', display:'block',
              textShadow:'0 0 40px rgba(0,0,0,0.8), 0 2px 12px rgba(0,0,0,0.6)',
              opacity: linesVisible[i] ? 1 : 0,
              transform: linesVisible[i] ? 'translateY(0)' : 'translateY(18px)',
              transition:'opacity 1.4s ease, transform 1.4s ease',
            }}>
              {line.text}
            </span>
          ))}

          <div style={{
            width: authorVisible ? '36px' : '0px', height:'1px',
            background:'rgba(200,151,90,0.45)',
            margin:'1.8rem 0 1.2rem',
            transition:'width 2s ease',
          }} />

          <p style={{
            fontSize:'0.76rem', letterSpacing:'0.22em',
            color:'rgba(200,190,168,0.6)', textTransform:'uppercase',
            fontFamily:"'Cormorant Garamond',serif",
            opacity: authorVisible ? 1 : 0,
            transform: authorVisible ? 'translateY(0)' : 'translateY(10px)',
            transition:'opacity 1.2s ease, transform 1.2s ease',
          }}>
            — Mohammed, San Francisco
          </p>
        </div>
      )}
    </section>
  )
}