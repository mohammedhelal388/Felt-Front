'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/ month',
    whisper: 'begin here',
    cta: 'Start free',
    href: '/register',
    features: ['3 Felt moments per month', 'My Book — basic view', 'Share one moment at a time', '30-day memory history'],
    candleHeight: 80,
    candleColor: '#8fa897',
    flameColor: '#c8975a',
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/ month',
    whisper: 'your legacy',
    cta: 'Begin your Legacy',
    href: '/register',
    features: ['Unlimited Felt moments', 'Full Legacy book + film mode', 'Touch your memories — haptics', 'Unlimited sharing', 'Lifetime memory storage', 'Priority AI generation', 'Spatial audio memories'],
    candleHeight: 130,
    candleColor: '#c8975a',
    flameColor: '#ffe8a0',
    featured: true,
  },
]

function Candle({ plan, index, onChoose }: { plan: typeof plans[0]; index: number; onChoose: (i: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const hovered = useRef(false)
  const chosen = useRef(false)
  const hoverStr = useRef(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isChosen, setIsChosen] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = 260, H = 340
    canvas.width = W; canvas.height = H
    let t = 0

    const ch = plan.candleHeight
    const cx = W / 2
    const baseY = H - 50  // fixed ground line — same for both candles
    const candleTop = baseY - ch

    // free candle is cream/white, pro is gold
    const bodyLight = plan.featured ? '200,160,80' : '240,230,210'
    const bodyMid = plan.featured ? '170,130,50' : '210,200,180'
    const bodyDark = plan.featured ? '130,95,30' : '170,155,135'
    const baseLight = plan.featured ? '160,120,40' : '190,175,155'

    const loop = () => {
      ctx.clearRect(0, 0, W, H)
      const h = hoverStr.current
      hoverStr.current += ((hovered.current ? 1 : 0) - hoverStr.current) * 0.07

      // free-roaming glow — no clipping, large radius
      const glowR = plan.featured
        ? (100 + h * 120)
        : (70 + h * 90)
      const glow = ctx.createRadialGradient(cx, candleTop - 10, 0, cx, candleTop - 10, glowR * 2)
      glow.addColorStop(0, `rgba(${plan.featured ? '255,220,100' : '255,240,200'},${(plan.featured ? 0.22 : 0.14) + h * 0.28})`)
      glow.addColorStop(0.25, `rgba(200,151,90,${(plan.featured ? 0.12 : 0.07) + h * 0.14})`)
      glow.addColorStop(0.6, `rgba(200,100,30,${0.03 + h * 0.04})`)
      glow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, W, H)

      // wax drips
      ctx.save()
      ctx.fillStyle = `rgba(${plan.featured ? '180,130,60' : '220,210,190'},0.35)`
      for (let i = 0; i < 3; i++) {
        const dx = (i - 1) * 6
        const dripH = 6 + i * 4 + Math.sin(t * 0.3 + i) * 2
        ctx.beginPath()
        ctx.ellipse(cx + dx, candleTop + dripH, 4, dripH * 0.5, 0, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()

      // candle body
      const bodyGrad = ctx.createLinearGradient(cx - 14, 0, cx + 14, 0)
      bodyGrad.addColorStop(0, `rgba(${bodyDark},0.95)`)
      bodyGrad.addColorStop(0.4, `rgba(${bodyLight},0.92)`)
      bodyGrad.addColorStop(1, `rgba(${bodyDark},0.95)`)
      ctx.fillStyle = bodyGrad
      ctx.beginPath()
      ctx.roundRect(cx - 13, candleTop, 26, ch, [2, 2, 4, 4])
      ctx.fill()

      // highlight
      ctx.save()
      ctx.globalAlpha = 0.18
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.roundRect(cx - 10, candleTop + 4, 6, ch - 8, 2)
      ctx.fill()
      ctx.restore()

      // wick
      ctx.strokeStyle = 'rgba(60,40,20,0.9)'
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(cx, candleTop)
      ctx.lineTo(cx + Math.sin(t * 3) * 1.5, candleTop - 8)
      ctx.stroke()

      // flame
      const flicker = 1 + 0.08 * Math.sin(t * 8.5) * Math.sin(t * 13.2)
      const flameH = (plan.featured ? 22 : 16) * (1 + h * 0.3) * flicker
      const flameW = (plan.featured ? 10 : 7) * flicker
      const flameSway = Math.sin(t * 2.8) * 2

      // outer flame
      const flameGrad = ctx.createRadialGradient(cx + flameSway, candleTop - flameH * 0.4, 0, cx + flameSway, candleTop - flameH * 0.2, flameH)
      flameGrad.addColorStop(0, `rgba(255,255,200,${0.95 * flicker})`)
      flameGrad.addColorStop(0.3, `rgba(255,200,80,${0.85 * flicker})`)
      flameGrad.addColorStop(0.7, `rgba(200,120,30,${0.5 * flicker})`)
      flameGrad.addColorStop(1, 'rgba(200,80,0,0)')
      ctx.fillStyle = flameGrad
      ctx.beginPath()
      ctx.moveTo(cx + flameSway, candleTop - flameH)
      ctx.bezierCurveTo(cx + flameSway + flameW, candleTop - flameH * 0.6, cx + flameSway + flameW * 0.8, candleTop, cx + flameSway, candleTop)
      ctx.bezierCurveTo(cx + flameSway - flameW * 0.8, candleTop, cx + flameSway - flameW, candleTop - flameH * 0.6, cx + flameSway, candleTop - flameH)
      ctx.fill()

      // inner flame core
      const coreGrad = ctx.createRadialGradient(cx + flameSway, candleTop - flameH * 0.35, 0, cx + flameSway, candleTop - flameH * 0.3, flameH * 0.4)
      coreGrad.addColorStop(0, `rgba(255,255,255,${0.9 * flicker})`)
      coreGrad.addColorStop(0.5, `rgba(255,240,180,${0.6 * flicker})`)
      coreGrad.addColorStop(1, 'rgba(255,200,80,0)')
      ctx.fillStyle = coreGrad
      ctx.beginPath()
      ctx.ellipse(cx + flameSway, candleTop - flameH * 0.35, flameW * 0.4, flameH * 0.4, 0, 0, Math.PI * 2)
      ctx.fill()

      // floating embers on hover
      if (h > 0.3) {
        for (let i = 0; i < 3; i++) {
          const ep = ((t * 0.6 + i * 0.5) % 1.5) / 1.5
          if (ep > 0.9) continue
          const ex = cx + Math.sin(t * 2 + i * 2.1) * 15 * ep
          const ey = candleTop - flameH - ep * 35
          ctx.save()
          ctx.globalAlpha = (1 - ep) * h * 0.7
          ctx.fillStyle = plan.featured ? '#ffe8a0' : '#c8975a'
          ctx.beginPath(); ctx.arc(ex, ey, 1.5, 0, Math.PI * 2); ctx.fill()
          ctx.restore()
        }
      }

      // candle base
      const baseGrad = ctx.createLinearGradient(cx - 18, baseY, cx + 18, baseY)
      baseGrad.addColorStop(0, `rgba(${bodyDark},0.9)`)
      baseGrad.addColorStop(0.5, `rgba(${baseLight},0.85)`)
      baseGrad.addColorStop(1, `rgba(${bodyDark},0.9)`)
      ctx.fillStyle = baseGrad
      ctx.beginPath()
      ctx.roundRect(cx - 17, baseY, 34, 14, 3)
      ctx.fill()

      t += 0.016
      rafRef.current = requestAnimationFrame(loop)
    }
    loop()

    canvas.addEventListener('mouseenter', () => { hovered.current = true; setIsHovered(true) })
    canvas.addEventListener('mouseleave', () => { hovered.current = false; setIsHovered(false) })
    canvas.addEventListener('click', () => {
      if (chosen.current) return
      chosen.current = true; setIsChosen(true)
      // burst sparks
      const rect = canvas.getBoundingClientRect()
      for (let i = 0; i < 18; i++) {
        const spark = document.createElement('div')
        const angle = (i / 18) * Math.PI * 2
        const speed = 50 + Math.random() * 80
        const tx = Math.cos(angle) * speed
        const ty = Math.sin(angle) * speed - 30
        const dur = 0.7 + Math.random() * 0.5
        const col = ['#ffe8a0','#c8975a','#f5f0e8','#dba96e'][Math.floor(Math.random()*4)]
        spark.style.cssText = `
          position:fixed;border-radius:50%;pointer-events:none;z-index:9997;
          left:${rect.left + rect.width/2}px;top:${rect.top + 60}px;
          width:${2+Math.random()*4}px;height:${2+Math.random()*4}px;background:${col};
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
      onChoose(index)
    })

    return () => cancelAnimationFrame(rafRef.current)
  }, [index, onChoose, plan])

  return (
    <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:'0',position:'relative',justifyContent:'flex-end' }}>
      <canvas ref={canvasRef} style={{ width:'260px',height:'340px',display:'block',cursor:'none' }} />

      {/* whisper */}
      <p style={{
        fontFamily:"'Playfair Display',serif",fontStyle:'italic',
        fontSize:'1rem',color:`rgba(200,151,90,${isHovered ? 0.95 : 0.4})`,
        letterSpacing:'0.1em',transition:'color 0.8s ease',
        textShadow: isHovered ? '0 0 16px rgba(200,151,90,0.6)' : 'none',
        animation: 'pulse 2.5s ease-in-out infinite',
      }}>
        {plan.whisper}
      </p>

      {/* plan details — emerge on hover */}
      <div style={{
        textAlign:'center',
        opacity: isHovered || isChosen ? 1 : 0,
        transform: isHovered || isChosen ? 'translateY(0)' : 'translateY(12px)',
        transition:'opacity 0.8s ease,transform 0.8s ease',
        pointerEvents: isHovered || isChosen ? 'auto' : 'none',
      }}>
        <p style={{ fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',color:'var(--cream)',marginBottom:'0.3rem' }}>{plan.name}</p>
        <p style={{ marginBottom:'1.2rem' }}>
          <span style={{ fontFamily:"'Playfair Display',serif",fontSize:'2.2rem',color:'var(--gold)',fontWeight:700 }}>{plan.price}</span>
          <span style={{ color:'var(--muted)',fontSize:'0.85rem' }}> {plan.period}</span>
        </p>
        <ul style={{ listStyle:'none',marginBottom:'1.5rem',display:'flex',flexDirection:'column',gap:'0.55rem',textAlign:'left' }}>
          {plan.features.map(f => (
            <li key={f} style={{ display:'flex',gap:'0.6rem',alignItems:'flex-start',color:'var(--parchment)',fontSize:'0.82rem',fontStyle:'italic',fontFamily:"'Cormorant Garamond',serif" }}>
              <span style={{ color:'var(--gold)',fontSize:'0.6rem',marginTop:'0.28rem',flexShrink:0 }}>✦</span>{f}
            </li>
          ))}
        </ul>
        <Link href={plan.href} style={{
          display:'block',textAlign:'center',
          background: plan.featured ? 'var(--gold)' : 'transparent',
          color: plan.featured ? 'var(--forest)' : 'var(--gold)',
          border: plan.featured ? 'none' : '1px solid var(--gold)',
          padding:'0.85rem 2rem',borderRadius:'2rem',
          fontFamily:"'Playfair Display',serif",fontSize:'0.95rem',
          fontWeight: plan.featured ? 700 : 400,
          textDecoration:'none',transition:'all 0.3s',
          opacity: isChosen ? 1 : 0.9,
          boxShadow: isChosen ? '0 0 30px rgba(200,151,90,0.4)' : 'none',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; if(plan.featured) e.currentTarget.style.background='var(--copper)' }}
        onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; if(plan.featured) e.currentTarget.style.background='var(--gold)' }}
        >
          {plan.cta}
        </Link>
      </div>
    </div>
  )
}

export default function Pricing() {
  const sectionRef = useRef<HTMLElement>(null)
  const [titleVisible, setTitleVisible] = useState(false)
  const [chosen, setChosen] = useState<number | null>(null)

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setTitleVisible(true) }, { threshold: 0.1 })
    if (sectionRef.current) io.observe(sectionRef.current)
    return () => io.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="pricing" style={{
      padding:'10rem 4rem',position:'relative',zIndex:2,
      maxWidth:'900px',margin:'0 auto',textAlign:'center',
    }}>
      <p style={{
        fontFamily:"'Cormorant Garamond',serif",fontStyle:'italic',fontSize:'0.82rem',
        color:'var(--muted)',letterSpacing:'0.42em',textTransform:'uppercase',marginBottom:'1rem',
        opacity:titleVisible?1:0,transform:titleVisible?'translateY(0)':'translateY(20px)',
        transition:'opacity 1.2s ease,transform 1.2s ease',
      }}>
        simple, honest pricing
      </p>
      <h2 style={{
        fontFamily:"'Playfair Display',serif",fontSize:'clamp(2rem,3.5vw,3rem)',
        maxWidth:'500px',margin:'0.5rem auto 5rem',lineHeight:1.2,
        opacity:titleVisible?1:0,transform:titleVisible?'translateY(0)':'translateY(20px)',
        transition:'opacity 1.2s ease 200ms,transform 1.2s ease 200ms',
      }}>
        Your story deserves{' '}
        <em style={{color:'var(--gold)',fontStyle:'italic'}}>to last forever.</em>
      </h2>

      {/* two candles */}
      <div style={{
        display:'flex',justifyContent:'center',
        gap:'clamp(2rem,6vw,6rem)',
        alignItems:'flex-end',
        flexWrap:'wrap',
      }}>
        {plans.map((plan, i) => (
          <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
            <Candle plan={plan} index={i} onChoose={setChosen} />
          </div>
        ))}
      </div>

      {/* bottom note */}
      <p style={{
        marginTop:'4rem',
        fontFamily:"'Playfair Display',serif",
        fontStyle:'italic',
        fontSize:'1.1rem',
        color:'rgba(200,190,168,0.85)',
        letterSpacing:'0.04em',
        lineHeight:1.8,
        opacity:titleVisible?1:0,
        transition:'opacity 1.5s ease 1s',
      }}>
        No contracts.{' '}
        <span style={{color:'var(--gold)'}}>Cancel any time.</span>{' '}
        Your memories are always yours.
      </p>
    </section>
  )
}