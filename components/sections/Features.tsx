'use client'
import { useEffect, useRef, useState } from 'react'

const features = [
  { num: '01', symbol: '◎', title: 'Capture the feeling', desc: 'Point both cameras — at the world and at your face. Speak what you feel. Felt listens and understands the emotion behind your words, not just the pixels.' },
  { num: '02', symbol: '✦', title: 'Watch it come alive', desc: 'AI reads your exact emotion and transforms your photo into a living, breathing moment. Colors shift. Light moves. Music rises. Generated from what you actually felt.' },
  { num: '03', symbol: '◈', title: 'Touch your memories', desc: 'Touch the mountain — feel it rumble. Touch the ocean — feel the waves. Your phone becomes a window you can actually reach through.' },
  { num: '04', symbol: '❧', title: 'Your Legacy builds itself', desc: 'Every moment becomes a chapter. Every chapter becomes your story. One day you open My Book and your entire life is written there — beautifully.' },
]

function FeatureCard({ f, index }: { f: typeof features[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouse = useRef({ x: 0.5, y: 0.5 })
  const hoverStr = useRef(0)
  const rafRef = useRef<number>(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.15 })
    if (cardRef.current) io.observe(cardRef.current)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const card = cardRef.current
    if (!canvas || !card) return
    const ctx = canvas.getContext('2d')!
    let isHovered = false, t = 0

    const onEnter = () => { isHovered = true }
    const onLeave = () => { isHovered = false }
    const onMove = (e: MouseEvent) => {
      const r = card.getBoundingClientRect()
      mouse.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }
    }
    card.addEventListener('mouseenter', onEnter)
    card.addEventListener('mouseleave', onLeave)
    card.addEventListener('mousemove', onMove)

    const loop = () => {
      const W = canvas.width = card.offsetWidth
      const H = canvas.height = card.offsetHeight
      hoverStr.current += ((isHovered ? 1 : 0) - hoverStr.current) * 0.06
      ctx.clearRect(0, 0, W, H)
      const h = hoverStr.current
      if (h < 0.005) { t += 0.016; rafRef.current = requestAnimationFrame(loop); return }
      const lx = mouse.current.x * W
      const ly = mouse.current.y * H
      const flicker = 1 + 0.04 * Math.sin(t * 8.7) * Math.sin(t * 13.3)
      const inner = ctx.createRadialGradient(lx, ly, 0, lx, ly, Math.max(W, H) * 0.55)
      inner.addColorStop(0, `rgba(255,200,100,${0.11 * h * flicker})`)
      inner.addColorStop(0.4, `rgba(200,130,50,${0.06 * h})`)
      inner.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = inner; ctx.fillRect(0, 0, W, H)
      const outer = ctx.createRadialGradient(lx, ly, 0, lx, ly, Math.max(W, H) * 1.2)
      outer.addColorStop(0, `rgba(180,100,30,${0.04 * h})`)
      outer.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = outer; ctx.fillRect(0, 0, W, H)
      t += 0.016; rafRef.current = requestAnimationFrame(loop)
    }
    loop()
    return () => {
      cancelAnimationFrame(rafRef.current)
      card.removeEventListener('mouseenter', onEnter)
      card.removeEventListener('mouseleave', onLeave)
      card.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <div ref={cardRef} style={{
      position: 'relative',
      background: 'rgba(4,10,5,0.92)',
      border: '1px solid rgba(200,151,90,0.07)',
      borderRadius: '14px', padding: '2.5rem 2.25rem',
      overflow: 'hidden',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 1s ease ${index * 110}ms, transform 1s ease ${index * 110}ms`,
    }}>
      <canvas ref={canvasRef} style={{ position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',borderRadius:'14px' }} />
      <div style={{ position:'relative',zIndex:2 }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'2.2rem' }}>
          <span style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:'0.72rem',letterSpacing:'0.38em',color:'rgba(200,151,90,0.35)',textTransform:'uppercase' }}>{f.num}</span>
          <span style={{ fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',color:'rgba(200,151,90,0.2)',lineHeight:1 }}>{f.symbol}</span>
        </div>
        <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:'clamp(1.1rem,1.8vw,1.35rem)',fontWeight:400,color:'var(--cream)',marginBottom:'1rem',lineHeight:1.25 }}>{f.title}</h3>
        <div style={{ width:'28px',height:'1px',background:'rgba(200,151,90,0.2)',marginBottom:'1.1rem' }} />
        <p style={{ color:'rgba(200,190,168,0.7)',lineHeight:1.85,fontSize:'0.9rem',fontStyle:'italic',fontWeight:300,fontFamily:"'Cormorant Garamond',serif" }}>{f.desc}</p>
      </div>
    </div>
  )
}

function Feather({ onTouch }: { onTouch: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const [touched, setTouched] = useState(false)
  const [hint, setHint] = useState(false)
  const hovered = useRef(false)
  const touchedRef = useRef(false)

  useEffect(() => {
    // show hint after 1.5s
    const t = setTimeout(() => setHint(true), 1500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width = 80
    const H = canvas.height = 160
    let t = 0

    const loop = () => {
      ctx.clearRect(0, 0, W, H)
      if (touchedRef.current) { rafRef.current = requestAnimationFrame(loop); return }

      const cx = W / 2
      const hov = hovered.current
      const sway = Math.sin(t * 0.8) * 6
      const float = Math.sin(t * 0.5) * 4
      const glow = 0.5 + 0.5 * Math.sin(t * 1.8)
      const scale = hov ? 1.15 : 1.0

      ctx.save()
      ctx.translate(cx + sway * 0.3, H * 0.5 + float)
      ctx.scale(scale, scale)
      ctx.rotate(sway * 0.015)

      // feather glow
      const aura = ctx.createRadialGradient(0, 0, 0, 0, 0, 45)
      aura.addColorStop(0, `rgba(200,151,90,${0.18 * glow + (hov ? 0.15 : 0)})`)
      aura.addColorStop(0.5, `rgba(200,151,90,${0.05 * glow})`)
      aura.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = aura
      ctx.beginPath(); ctx.arc(0, 0, 45, 0, Math.PI * 2); ctx.fill()

      // quill shaft
      ctx.strokeStyle = `rgba(200,151,90,${0.7 + glow * 0.3})`
      ctx.lineWidth = 1.2
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(0, -55)
      ctx.quadraticCurveTo(sway * 0.5, 0, 0, 55)
      ctx.stroke()

      // feather barbs — left side
      const color = `rgba(200,151,90,${0.55 + glow * 0.2})`
      const colorLight = `rgba(220,180,120,${0.35 + glow * 0.15})`
      for (let i = -10; i <= 10; i++) {
        const y = i * 5
        const len = (40 - Math.abs(i) * 2.5) * (i < 0 ? 0.9 : 1.1)
        const curveY = y + 3
        ctx.save()
        ctx.strokeStyle = i % 2 === 0 ? color : colorLight
        ctx.lineWidth = 0.8
        ctx.globalAlpha = 0.8 - Math.abs(i) * 0.025
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.quadraticCurveTo(-len * 0.5, curveY + 2, -len, curveY + 5)
        ctx.stroke()
        // right side
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.quadraticCurveTo(len * 0.4, curveY + 1, len * 0.85, curveY + 3)
        ctx.stroke()
        ctx.restore()
      }

      // tip glow
      ctx.save()
      ctx.globalAlpha = 0.6 + glow * 0.4
      const tipGlow = ctx.createRadialGradient(0, -55, 0, 0, -55, 8)
      tipGlow.addColorStop(0, 'rgba(255,240,160,0.9)')
      tipGlow.addColorStop(1, 'rgba(200,151,90,0)')
      ctx.fillStyle = tipGlow
      ctx.beginPath(); ctx.arc(0, -55, 8, 0, Math.PI * 2); ctx.fill()
      ctx.restore()

      ctx.restore()

      t += 0.016
      rafRef.current = requestAnimationFrame(loop)
    }
    loop()

    const onEnter = () => { hovered.current = true }
    const onLeave = () => { hovered.current = false }
    const onClick = () => {
      if (touchedRef.current) return
      touchedRef.current = true
      setTouched(true)
      setHint(false)
      // burst sparks
      for (let i = 0; i < 16; i++) {
        const spark = document.createElement('div')
        const angle = (i / 16) * Math.PI * 2
        const speed = 50 + Math.random() * 70
        const tx = Math.cos(angle) * speed
        const ty = Math.sin(angle) * speed - 20
        const dur = 0.6 + Math.random() * 0.5
        const sz = 2 + Math.random() * 4
        const col = ['#c8975a','#dba96e','#f5f0e8','#7cb987'][Math.floor(Math.random()*4)]
        const r = canvas.getBoundingClientRect()
        spark.style.cssText = `
          position:fixed;border-radius:50%;pointer-events:none;z-index:9997;
          left:${r.left+r.width/2}px;top:${r.top+r.height/2}px;
          width:${sz}px;height:${sz}px;background:${col};
          transform:translate(-50%,-50%);opacity:0.95;
          transition:transform ${dur}s ease-out,opacity ${dur}s ease-out;
        `
        document.body.appendChild(spark)
        requestAnimationFrame(()=>requestAnimationFrame(()=>{
          spark.style.transform=`translate(calc(-50% + ${tx}px),calc(-50% + ${ty}px))`
          spark.style.opacity='0'
        }))
        setTimeout(()=>spark.remove(), dur*1000+100)
      }
      onTouch()
    }

    canvas.addEventListener('mouseenter', onEnter)
    canvas.addEventListener('mouseleave', onLeave)
    canvas.addEventListener('click', onClick)
    return () => {
      cancelAnimationFrame(rafRef.current)
      canvas.removeEventListener('mouseenter', onEnter)
      canvas.removeEventListener('mouseleave', onLeave)
      canvas.removeEventListener('click', onClick)
    }
  }, [onTouch])

  if (touched) return null

  return (
    <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:'0.75rem' }}>
      <canvas ref={canvasRef} style={{ width:'80px',height:'160px',display:'block',cursor:'none' }} />
      <p style={{
        fontFamily:"'Playfair Display',serif",
        fontStyle:'italic',fontSize:'1rem',
        color:'rgba(200,151,90,0.85)',letterSpacing:'0.1em',
        textShadow:'0 0 16px rgba(200,151,90,0.6)',
        opacity: hint ? 1 : 0,
        transition:'opacity 1.5s ease',
        animation: hint ? 'pulse 2s ease-in-out infinite' : 'none',
      }}>
        touch me
      </p>
    </div>
  )
}

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null)
  const [titleVisible, setTitleVisible] = useState(false)
  const [cardsVisible, setCardsVisible] = useState(false)

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setTitleVisible(true) }, { threshold: 0.1 })
    if (sectionRef.current) io.observe(sectionRef.current)
    return () => io.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="how-it-works" style={{ padding:'10rem 4rem',position:'relative',zIndex:2,maxWidth:'1200px',margin:'0 auto' }}>
      <p style={{
        textAlign:'center',fontFamily:"'Cormorant Garamond',serif",fontStyle:'italic',fontSize:'0.82rem',
        color:'var(--muted)',letterSpacing:'0.42em',textTransform:'uppercase',marginBottom:'1rem',
        opacity:titleVisible?1:0,transform:titleVisible?'translateY(0)':'translateY(20px)',
        transition:'opacity 1.2s ease,transform 1.2s ease',
      }}>
        how felt works
      </p>
      <h2 style={{
        fontFamily:"'Playfair Display',serif",fontSize:'clamp(2rem,3.5vw,3rem)',
        textAlign:'center',maxWidth:'560px',margin:'0.5rem auto 0',lineHeight:1.2,
        opacity:titleVisible?1:0,transform:titleVisible?'translateY(0)':'translateY(20px)',
        transition:'opacity 1.2s ease 200ms,transform 1.2s ease 200ms',
      }}>
        Three gestures.{' '}
        <em style={{color:'var(--gold)',fontStyle:'italic'}}>A lifetime of meaning.</em>
      </h2>

      {/* feather or cards */}
      {!cardsVisible ? (
        <div style={{ display:'flex',justifyContent:'center',alignItems:'center',minHeight:'340px',marginTop:'3rem' }}>
          <Feather onTouch={() => setCardsVisible(true)} />
        </div>
      ) : (
        <div style={{ marginTop:'4rem',display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'1.25rem' }}>
          {features.map((f, i) => <FeatureCard key={f.num} f={f} index={i} />)}
        </div>
      )}
    </section>
  )
}