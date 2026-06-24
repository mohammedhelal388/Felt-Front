'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const Cursor = dynamic(() => import('@/components/ui/Cursor'), { ssr: false })
const ParticleCanvas = dynamic(() => import('@/components/ui/ParticleCanvas'), { ssr: false })

function spawnGlitter(x: number, y: number) {
  const colors = ['#c8975a','#dba96e','#f5f0e8','#7cb987','#ffe8a0','#b87333']
  for (let i = 0; i < 7; i++) {
    const el = document.createElement('div')
    const angle = Math.random() * Math.PI * 2
    const dist = 18 + Math.random() * 38
    const tx = Math.cos(angle) * dist
    const ty = Math.sin(angle) * dist - 18
    const size = 2 + Math.random() * 4
    const dur = 0.5 + Math.random() * 0.5
    const col = colors[Math.floor(Math.random() * colors.length)]
    el.style.cssText = `
      position:fixed;border-radius:50%;pointer-events:none;z-index:9999;
      left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${col};
      transform:translate(-50%,-50%);opacity:0.95;
      box-shadow:0 0 ${size*2}px ${col};
      transition:transform ${dur}s ease-out,opacity ${dur}s ease-out;
    `
    document.body.appendChild(el)
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.transform = `translate(calc(-50% + ${tx}px),calc(-50% + ${ty}px))`
      el.style.opacity = '0'
    }))
    setTimeout(() => el.remove(), dur * 1000 + 100)
  }
}

function MagicInput({ label, type, value, onChange, placeholder, required, minLength, lit }: {
  label: string; type: string; value: string
  onChange: (v: string) => void; placeholder: string
  required?: boolean; minLength?: number; lit: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)

  const handleKey = () => {
    const el = inputRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    spawnGlitter(r.left + Math.random() * r.width, r.top + r.height * 0.5)
  }

  return (
    <div style={{ position:'relative' }}>
      <label style={{
        display:'block', fontSize:'0.72rem', letterSpacing:'0.2em',
        color: focused ? 'var(--gold)' : lit ? 'var(--muted)' : 'rgba(107,138,114,0.3)',
        textTransform:'uppercase', marginBottom:'0.5rem',
        fontFamily:"'Cormorant Garamond',serif",
        transition:'color 0.8s ease',
      }}>{label}</label>
      <input ref={inputRef} type={type} value={value}
        onChange={e => { onChange(e.target.value); handleKey() }}
        placeholder={placeholder} required={required} minLength={minLength}
        disabled={!lit}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width:'100%', padding:'1rem 1.5rem',
          background: lit ? (focused ? 'rgba(10,24,14,0.8)' : 'rgba(6,13,8,0.6)') : 'rgba(4,8,5,0.3)',
          border: `1px solid ${focused ? 'rgba(200,151,90,0.6)' : lit ? 'rgba(200,151,90,0.2)' : 'rgba(200,151,90,0.06)'}`,
          borderRadius:'10px', color: lit ? 'var(--cream)' : 'rgba(245,240,232,0.15)',
          fontFamily:"'Cormorant Garamond',serif", fontSize:'1.1rem', outline:'none',
          transition:'all 0.8s ease',
          boxShadow: focused ? '0 0 20px rgba(200,151,90,0.12)' : 'none',
        }}
      />
      <div style={{
        position:'absolute', bottom:0, left:'10%', right:'10%', height:'1px',
        background:'linear-gradient(to right,transparent,var(--gold),transparent)',
        opacity: focused ? 0.6 : 0, transition:'opacity 0.4s',
      }} />
    </div>
  )
}

function Lamp({ onPull }: { onPull: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const pulled = useRef(false)
  const pullProgress = useRef(0)
  const swayAngle = useRef(0)
  const swayVel = useRef(0)
  const cordPulled = useRef(0)
  const hoveringRing = useRef(false)
  const lit = useRef(false)
  const [isPulled, setIsPulled] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width = 120
    const H = canvas.height = 320
    let t = 0

    const lampX = W * 0.5
    const lampY = 60
    const cordLen = 160
    const ringY = lampY + cordLen

    canvas.addEventListener('click', (e) => {
      const r = canvas.getBoundingClientRect()
      const my = e.clientY - r.top
      const mx = e.clientX - r.left
      const dist = Math.hypot(mx - lampX, my - ringY)
      if (dist < 22 && !pulled.current) {
        pulled.current = true
        swayVel.current = 0.08
        cordPulled.current = 1
        setTimeout(() => {
          lit.current = true
          setIsPulled(true)
          onPull()
          // spawn lamp sparks
          const cr = canvas.getBoundingClientRect()
          for (let i = 0; i < 12; i++) {
            setTimeout(() => spawnGlitter(
              cr.left + lampX + (Math.random()-0.5)*30,
              cr.top + lampY + (Math.random()-0.5)*20
            ), i * 60)
          }
        }, 400)
      }
    })

    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect()
      const my = e.clientY - r.top
      const mx = e.clientX - r.left
      hoveringRing.current = Math.hypot(mx - lampX, my - ringY) < 22
    })

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      const sway = swayAngle.current

      // spring physics
      swayVel.current += (-swayAngle.current * 0.12 - swayVel.current * 0.18)
      swayAngle.current += swayVel.current
      if (!pulled.current) {
        swayAngle.current += Math.sin(t * 0.4) * 0.003
      }

      // cord pull animation
      if (pulled.current && cordPulled.current > 0) {
        cordPulled.current = Math.max(0, cordPulled.current - 0.04)
      }

      const swayOffsetX = Math.sin(sway) * 20
      const cordStretch = cordPulled.current * 35
      const ringCY = ringY + cordStretch

      ctx.save()
      ctx.translate(lampX + swayOffsetX * 0.3, 0)

      // lamp wire from top
      ctx.strokeStyle = 'rgba(180,140,80,0.6)'
      ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, lampY - 12); ctx.stroke()

      // lamp shade
      const beat = Math.pow(Math.sin(t * 1.4), 2)
      const beatGlow = !lit.current ? (0.35 + 0.45 * beat) : 0
      const lampGlow = lit.current ? (0.6 + 0.3 * Math.sin(t * 1.5)) : beatGlow
      if (lampGlow > 0) {
        const aura = ctx.createRadialGradient(0, lampY + 15, 0, 0, lampY + 15, 40 + lampGlow * 80)
        aura.addColorStop(0, `rgba(255,200,80,${0.7 * lampGlow})`)
        aura.addColorStop(0.3, `rgba(200,130,40,${0.4 * lampGlow})`)
        aura.addColorStop(0.7, `rgba(160,80,20,${0.15 * lampGlow})`)
        aura.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = aura; ctx.beginPath(); ctx.arc(0, lampY + 15, 120, 0, Math.PI * 2); ctx.fill()
      }

      // shade body
      ctx.save()
      const shadeGrad = ctx.createLinearGradient(-20, lampY - 12, 20, lampY + 30)
      shadeGrad.addColorStop(0, lit.current ? 'rgba(220,160,60,0.95)' : 'rgba(80,55,25,0.9)')
      shadeGrad.addColorStop(0.5, lit.current ? 'rgba(200,140,50,0.9)' : 'rgba(60,42,18,0.85)')
      shadeGrad.addColorStop(1, lit.current ? 'rgba(160,110,35,0.85)' : 'rgba(45,30,12,0.9)')
      ctx.fillStyle = shadeGrad
      ctx.beginPath()
      ctx.moveTo(-6, lampY - 12)
      ctx.lineTo(-22, lampY + 28)
      ctx.lineTo(22, lampY + 28)
      ctx.lineTo(6, lampY - 12)
      ctx.closePath(); ctx.fill()

      // shade rim
      ctx.strokeStyle = lit.current ? 'rgba(255,200,80,0.5)' : 'rgba(120,90,40,0.6)'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(-22, lampY + 28); ctx.lineTo(22, lampY + 28); ctx.stroke()
      ctx.restore()

      // bulb glow when lit
      if (lit.current) {
        ctx.save()
        ctx.globalAlpha = 0.7 + 0.3 * Math.sin(t * 2.1)
        const bulb = ctx.createRadialGradient(0, lampY + 16, 0, 0, lampY + 16, 10)
        bulb.addColorStop(0, 'rgba(255,255,200,0.95)')
        bulb.addColorStop(0.5, 'rgba(255,220,100,0.6)')
        bulb.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = bulb
        ctx.beginPath(); ctx.arc(0, lampY + 16, 10, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
      }

      ctx.restore()

      // cord — hangs with sway
      ctx.save()
      ctx.strokeStyle = 'rgba(180,140,80,0.5)'
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(lampX + swayOffsetX * 0.3, lampY + 28)
      ctx.quadraticCurveTo(
        lampX + swayOffsetX * 0.6,
        lampY + 28 + (cordLen - cordStretch) * 0.5,
        lampX + swayOffsetX,
        ringCY
      )
      ctx.stroke()
      ctx.restore()

      // pull ring
      const hov = hoveringRing.current && !pulled.current
      const ringPulse = !pulled.current ? (1.5 + 1.0 * Math.pow(Math.sin(t * 1.4), 2)) : 1
      ctx.save()
      ctx.translate(lampX + swayOffsetX, ringCY)
      const rg = ctx.createRadialGradient(-1, -1, 0, 0, 0, 8)
      rg.addColorStop(0, hov ? '#ffe8a0' : '#c8975a')
      rg.addColorStop(0.6, hov ? '#c8975a' : '#8a5a20')
      rg.addColorStop(1, '#5a3a10')
      ctx.strokeStyle = rg
      ctx.lineWidth = ringPulse * (hov ? 2.5 : 2)
      ctx.shadowColor = 'rgba(200,151,90,0.9)'
      ctx.shadowBlur = 6 + 14 * Math.pow(Math.sin(t * 1.4), 2)
      ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.stroke()
      ctx.restore()

      // "pull me" hint
      if (!pulled.current) {
        ctx.save()
        ctx.globalAlpha = 0.35 + 0.2 * Math.sin(t * 1.6)
        ctx.fillStyle = '#c8975a'
        ctx.font = `italic 11px 'Playfair Display',Georgia,serif`
        ctx.textAlign = 'center'
        ctx.fillText('pull me', lampX + swayOffsetX, ringCY + 22)
        ctx.restore()
      }

      t += 0.016
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => cancelAnimationFrame(rafRef.current)
  }, [onPull])

  return (
    <canvas ref={canvasRef} style={{
      width: '120px', height: '320px',
      display: 'block', cursor: 'none',
      flexShrink: 0,
    }} />
  )
}

export default function RegisterPage() {
  const [lit, setLit] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lit) return
    setLoading(true); setError('')
    try {
      const res = await fetch('http://localhost:3000/api/v1/auth/register', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({name,email,password}),
      })
      const data = await res.json()
      if(!res.ok) throw new Error(data.message?.message||'Registration failed')
      localStorage.setItem('felt_token',data.data.accessToken)
      localStorage.setItem('felt_user',JSON.stringify(data.data.user))
      window.location.href='/dashboard'
    } catch(err:any){setError(err.message)} finally{setLoading(false)}
  }

  return (
    <>
      <Cursor /><ParticleCanvas />
      <style>{`
        @keyframes cardLight {
          from { box-shadow: 0 30px 80px rgba(0,0,0,0.7), inset 0 0 0px rgba(255,200,80,0); }
          to { box-shadow: 0 30px 80px rgba(0,0,0,0.5), 0 0 60px rgba(200,151,90,0.12), inset 0 0 80px rgba(255,200,80,0.03); }
        }
        @keyframes fieldLit {
          from { opacity:0; transform:translateY(8px); }
          to { opacity:1; transform:translateY(0); }
        }
      `}</style>

      <div style={{
        minHeight:'100vh', display:'flex',
        alignItems:'center', justifyContent:'center',
        padding:'2rem', position:'relative', zIndex:2,
      }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:'0', position:'relative' }}>

          {/* The card */}
          <div style={{
            width:'380px',
            background: lit ? 'rgba(12,24,14,0.92)' : 'rgba(5,10,6,0.95)',
            border: `1px solid rgba(200,151,90,${lit ? 0.22 : 0.06})`,
            borderRadius:'20px 0 0 20px', padding:'3rem',
            backdropFilter:'blur(20px)',
            transition:'all 1.2s ease',
            animation: lit ? 'cardLight 1.2s ease forwards' : 'none',
            boxShadow: lit
              ? '0 30px 80px rgba(0,0,0,0.5), 0 0 60px rgba(200,151,90,0.1)'
              : '0 30px 80px rgba(0,0,0,0.8)',
            position:'relative', overflow:'hidden',
          }}>
            {/* warm light overlay */}
            <div style={{
              position:'absolute', top:'-20%', right:'-10%',
              width:'300px', height:'300px',
              borderRadius:'50%',
              background:'radial-gradient(circle,rgba(255,200,80,0.08) 0%,transparent 70%)',
              opacity: lit ? 1 : 0,
              transition:'opacity 1.4s ease',
              pointerEvents:'none',
            }} />

            <div style={{ position:'relative', zIndex:1 }}>
              <Link href="/" style={{
                display:'block', textAlign:'center',
                fontFamily:"'Playfair Display',serif", fontSize:'2rem',
                color: lit ? 'var(--gold)' : 'rgba(200,151,90,0.25)',
                textDecoration:'none', marginBottom:'0.5rem',
                transition:'color 1s ease',
              }}>felt.</Link>
              <h1 style={{
                fontFamily:"'Playfair Display',serif", fontSize:'1.5rem',
                textAlign:'center', marginBottom:'0.4rem', fontWeight:400,
                color: lit ? 'var(--cream)' : 'rgba(245,240,232,0.15)',
                transition:'color 1s ease',
              }}>Begin your story</h1>
              <p style={{
                textAlign:'center', fontStyle:'italic', fontSize:'0.95rem',
                marginBottom:'2.5rem',
                color: lit ? 'var(--muted)' : 'rgba(107,138,114,0.2)',
                transition:'color 1s ease',
              }}>every memory deserves to be felt</p>

              {!lit && (
                <p style={{
                  textAlign:'center', fontFamily:"'Playfair Display',serif",
                  fontStyle:'italic', fontSize:'1rem',
                  color:'rgba(200,151,90,0.3)',
                  letterSpacing:'0.05em',
                }}>
                  pull the lamp to begin
                </p>
              )}

              {error && lit && (
                <div style={{background:'rgba(180,60,60,0.15)',border:'1px solid rgba(180,60,60,0.3)',borderRadius:'8px',padding:'0.75rem 1rem',color:'#f08080',fontSize:'0.9rem',marginBottom:'1.5rem',textAlign:'center'}}>{error}</div>
              )}

              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
                {[
                  { label:'Your name', type:'text', value:name, onChange:setName, placeholder:'your name', delay:'0.2s' },
                  { label:'Email', type:'email', value:email, onChange:setEmail, placeholder:'your@email.com', delay:'0.4s' },
                  { label:'Password', type:'password', value:password, onChange:setPassword, placeholder:'••••••••', delay:'0.6s', minLength:8 },
                ].map(f => (
                  <div key={f.label} style={{
                    animation: lit ? `fieldLit 0.8s ease ${f.delay} both` : 'none',
                  }}>
                    <MagicInput {...f} required lit={lit} />
                  </div>
                ))}

                <div style={{ animation: lit ? 'fieldLit 0.8s ease 0.8s both' : 'none', marginTop:'0.5rem' }}>
                  <button type="submit" disabled={loading || !lit} style={{
                    width:'100%', padding:'1rem',
                    background: !lit ? 'rgba(200,151,90,0.1)' : loading ? 'rgba(200,151,90,0.5)' : 'var(--gold)',
                    color: lit ? 'var(--forest)' : 'rgba(200,151,90,0.2)',
                    border:'none', borderRadius:'12px',
                    fontFamily:"'Playfair Display',serif", fontSize:'1.05rem', fontWeight:700,
                    transition:'all 0.8s ease', letterSpacing:'0.05em',
                  }}
                  onMouseEnter={e=>{if(lit&&!loading){e.currentTarget.style.background='var(--copper)';e.currentTarget.style.transform='translateY(-2px)'}}}
                  onMouseLeave={e=>{if(lit&&!loading){e.currentTarget.style.background='var(--gold)';e.currentTarget.style.transform='translateY(0)'}}}
                  >
                    {loading ? 'Opening your book...' : 'Start for free'}
                  </button>
                </div>
              </form>

              {lit && (
                <p style={{textAlign:'center',marginTop:'2rem',color:'var(--muted)',fontSize:'0.9rem',fontStyle:'italic',fontFamily:"'Cormorant Garamond',serif",animation:'fieldLit 0.8s ease 1s both'}}>
                  Already have a story?{' '}
                  <Link href="/login" style={{color:'var(--gold)',textDecoration:'none'}}>Open your book</Link>
                </p>
              )}
            </div>
          </div>

          {/* Lamp column */}
          <div style={{
            display:'flex', flexDirection:'column', alignItems:'center',
            paddingTop:'0',
            background: lit ? 'rgba(12,22,14,0.6)' : 'rgba(5,10,6,0.8)',
            borderTop: `1px solid rgba(200,151,90,${lit?0.15:0.04})`,
            borderRight: `1px solid rgba(200,151,90,${lit?0.15:0.04})`,
            borderBottom: `1px solid rgba(200,151,90,${lit?0.15:0.04})`,
            borderLeft: 'none',
            borderRadius:'0 20px 20px 0',
            transition:'all 1.2s ease',
          }}>
            <Lamp onPull={() => setLit(true)} />
          </div>

        </div>
      </div>
    </>
  )
}