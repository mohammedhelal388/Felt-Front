'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const Cursor = dynamic(() => import('@/components/ui/Cursor'), { ssr: false })
const ParticleCanvas = dynamic(() => import('@/components/ui/ParticleCanvas'), { ssr: false })

interface Moment {
  id: string; emotionWord: string; location: string
  poeticText: string; frontPhotoUrl: string
  isGenerated: boolean; capturedAt: string
}

function InkDropButton() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const hovered = useRef(false)
  const [isHov, setIsHov] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width = 80; canvas.height = 100
    let t = 0
    canvas.addEventListener('mouseenter', () => { hovered.current = true; setIsHov(true) })
    canvas.addEventListener('mouseleave', () => { hovered.current = false; setIsHov(false) })

    const draw = () => {
      ctx.clearRect(0, 0, 80, 100)
      const hov = hovered.current
      const cx = 40
      const cycle = (t * 0.18) % (Math.PI * 2)
      const dripP = Math.pow(Math.sin(cycle * 0.5), 2)

      // glow
      const glow = ctx.createRadialGradient(cx, 22, 0, cx, 22, hov ? 36 : 28)
      glow.addColorStop(0, `rgba(255,220,100,${hov ? 0.5 : 0.22})`)
      glow.addColorStop(0.4, `rgba(200,151,90,${hov ? 0.22 : 0.08})`)
      glow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, 22, hov ? 36 : 28, 0, Math.PI * 2); ctx.fill()

      // drop body
      const ds = hov ? 16 : 12
      const bg = ctx.createRadialGradient(cx - 3, 18, 0, cx, 22, ds)
      bg.addColorStop(0, '#fff8e0'); bg.addColorStop(0.4, '#c8975a'); bg.addColorStop(1, '#7a4a15')
      ctx.fillStyle = bg
      ctx.beginPath()
      ctx.moveTo(cx, 10)
      ctx.bezierCurveTo(cx + ds, 10, cx + ds, 28, cx, 32)
      ctx.bezierCurveTo(cx - ds, 28, cx - ds, 10, cx, 10)
      ctx.fill()

      // drip tail
      if (!hov) {
        const tl = dripP * 28
        const tg = ctx.createLinearGradient(cx, 30, cx, 30 + tl)
        tg.addColorStop(0, 'rgba(200,151,90,0.8)'); tg.addColorStop(1, 'rgba(200,151,90,0)')
        ctx.strokeStyle = tg; ctx.lineWidth = 2 - dripP * 1.5
        ctx.beginPath(); ctx.moveTo(cx, 30); ctx.lineTo(cx, 30 + tl); ctx.stroke()
        if (dripP > 0.4) {
          const fa = (dripP - 0.4) / 0.6
          ctx.save(); ctx.globalAlpha = fa * (1 - fa * 0.5); ctx.fillStyle = '#c8975a'
          ctx.beginPath(); ctx.arc(cx, 30 + tl, 3 * (1 - fa * 0.5), 0, Math.PI * 2); ctx.fill(); ctx.restore()
        }
      }

      // hover ripples
      if (hov) {
        for (let i = 0; i < 2; i++) {
          const rp = ((t * 0.8 + i * 1.2) % 2) / 2
          ctx.save(); ctx.globalAlpha = (1 - rp) * 0.3; ctx.strokeStyle = '#c8975a'; ctx.lineWidth = 0.8
          ctx.beginPath(); ctx.arc(cx, 24, 6 + rp * 22, 0, Math.PI * 2); ctx.stroke(); ctx.restore()
        }
      }

      t += 0.016; rafRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <Link href="/moments/new" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
      <canvas ref={canvasRef} style={{ width: '80px', height: '100px', display: 'block', cursor: 'none' }} />
      <span style={{
        fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '0.72rem',
        color: `rgba(200,151,90,${isHov ? 0.95 : 0.45})`, letterSpacing: '0.05em',
        transition: 'all 0.3s', whiteSpace: 'nowrap',
        textShadow: isHov ? '0 0 14px rgba(200,151,90,0.6)' : 'none',
      }}>capture a moment</span>
    </Link>
  )
}

function MomentCard({ moment, index }: { moment: Moment; index: number }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])

  const emotionColors: Record<string, string> = {
    nostalgic: '#7ca4c0', belonging: '#7cb987', wonder: '#c8975a', peace: '#8fa897',
    joy: '#dba96e', melancholy: '#8878a0', awe: '#c8a855', love: '#c87878',
    excited: '#dba96e', sky: '#7ca4c0', happy: '#dba96e', sad: '#7ca4c0',
  }
  const ec = emotionColors[moment.emotionWord?.toLowerCase()] || '#c8975a'

  return (
    <Link href={`/moments/${moment.id}`} style={{ textDecoration: 'none' }}>
      <div ref={ref} style={{
        background: 'rgba(10,20,12,0.85)', border: '1px solid rgba(200,151,90,0.1)',
        borderRadius: '16px', overflow: 'hidden', cursor: 'none',
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.9s ease ${index * 80}ms, transform 0.9s ease ${index * 80}ms, border-color 0.3s, box-shadow 0.3s, background 0.3s`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${ec}55`
        e.currentTarget.style.transform = 'translateY(-6px)'
        e.currentTarget.style.boxShadow = `0 24px 60px rgba(0,0,0,0.5), 0 0 30px ${ec}18`
        e.currentTarget.style.background = 'rgba(12,25,15,0.95)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(200,151,90,0.1)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.background = 'rgba(10,20,12,0.85)'
      }}
      >
        <div style={{ height: '180px', position: 'relative', overflow: 'hidden', background: 'rgba(15,31,18,0.8)' }}>
          {moment.frontPhotoUrl ? (
            <>
              <img src={moment.frontPhotoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent 40%, rgba(10,20,12,0.85))`, pointerEvents: 'none' }} />
            </>
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `radial-gradient(circle at center, ${ec}15, rgba(10,20,12,0.9))` }}>
              <span style={{ fontSize: '2.5rem', opacity: 0.25 }}>✦</span>
            </div>
          )}
          {moment.isGenerated && (
            <span style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(200,151,90,0.92)', color: 'var(--forest)', fontSize: '0.58rem', padding: '0.22rem 0.65rem', borderRadius: '2rem', fontWeight: 700, letterSpacing: '0.1em' }}>FELT</span>
          )}
          <div style={{ position: 'absolute', bottom: '0.6rem', left: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: ec, boxShadow: `0 0 6px ${ec}` }} />
            <span style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: ec, textTransform: 'uppercase', fontFamily: "'Cormorant Garamond', serif" }}>
              {moment.emotionWord || 'untitled'}{moment.location ? ` · ${moment.location}` : ''}
            </span>
          </div>
        </div>
        <div style={{ padding: '1.4rem' }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '0.88rem', color: 'var(--parchment)', lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {moment.poeticText || 'Waiting to be felt...'}
          </p>
          <p style={{ color: 'var(--muted)', fontSize: '0.7rem', marginTop: '0.85rem', fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif" }}>
            {new Date(moment.capturedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [moments, setMoments] = useState<Moment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('felt_token')
    const userData = localStorage.getItem('felt_user')
    if (!token) { window.location.href = '/login'; return }
    if (userData) setUser(JSON.parse(userData))
    fetch('http://localhost:3000/api/v1/moments', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => {
        console.log('Moments API:', JSON.stringify(d, null, 2))
        const raw = d.data || d || []
        const list = Array.isArray(raw) ? raw : []
        const normalized = list.map((m: any) => ({
          ...m,
          emotionWord: m.emotionWord || m.emotion_word || m.emotion || m.emotionLabel || '',
          location: m.location || m.locationName || m.place || '',
          poeticText: m.poeticText || m.poetic_text || m.generatedText || m.generated_text || m.text || '',
          frontPhotoUrl: m.frontPhotoUrl || m.front_photo_url || m.photoUrl || m.photo_url || m.imageUrl || m.image_url || '',
          isGenerated: m.isGenerated ?? m.is_generated ?? false,
          capturedAt: m.capturedAt || m.captured_at || m.createdAt || m.created_at || new Date().toISOString(),
        }))
        setMoments(normalized); setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const logout = () => { localStorage.removeItem('felt_token'); localStorage.removeItem('felt_user'); window.location.href = '/' }

  return (
    <>
      <Cursor /><ParticleCanvas />
      <div style={{ minHeight: '100vh', position: 'relative', zIndex: 2 }}>
        <nav style={{ padding: '1.2rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(200,151,90,0.08)', background: 'rgba(6,13,8,0.92)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100 }}>
          <Link href="/" style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.8rem', color: 'var(--gold)', textDecoration: 'none' }}>felt.</Link>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <span style={{ color: 'var(--parchment)', fontStyle: 'italic', fontFamily: "'Cormorant Garamond',serif" }}>{user?.name}</span>
            <button onClick={logout} style={{ background: 'transparent', border: '1px solid rgba(200,151,90,0.2)', color: 'var(--muted)', padding: '0.4rem 1.1rem', borderRadius: '2rem', fontFamily: "'Cormorant Garamond',serif", fontSize: '0.9rem', transition: 'all 0.3s', cursor: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(200,151,90,0.2)'; e.currentTarget.style.color = 'var(--muted)' }}
            >sign out</button>
          </div>
        </nav>

        <div style={{ padding: '4rem 3rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '3.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
              <p style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: '0.95rem', marginBottom: '0.4rem', fontFamily: "'Cormorant Garamond',serif" }}>welcome back,</p>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 400 }}>{user?.name}'s Story</h1>
            </div>
            <InkDropButton />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem', marginBottom: '4rem' }}>
            {[{ label:'Moments felt', value:moments.length, icon:'◎' }, { label:'Generated', value:moments.filter(m=>m.isGenerated).length, icon:'✦' }, { label:'Plan', value:user?.subscriptionPlan||'FREE', icon:'❧' }].map(s => (
              <div key={s.label} style={{ background:'rgba(10,20,12,0.7)', border:'1px solid rgba(200,151,90,0.1)', borderRadius:'16px', padding:'2rem', transition:'border-color 0.3s' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(200,151,90,0.3)'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(200,151,90,0.1)'}
              >
                <span style={{ fontSize:'0.85rem', color:'rgba(200,151,90,0.3)', display:'block', marginBottom:'0.75rem' }}>{s.icon}</span>
                <p style={{ fontFamily:"'Playfair Display',serif", fontSize:'2.2rem', color:'var(--gold)', fontWeight:700, lineHeight:1 }}>{s.value}</p>
                <p style={{ color:'var(--muted)', fontStyle:'italic', fontSize:'0.82rem', marginTop:'0.4rem', fontFamily:"'Cormorant Garamond',serif" }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem' }}>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', fontWeight:400 }}>Your moments</h2>
            {moments.length > 0 && <p style={{ color:'var(--muted)', fontStyle:'italic', fontSize:'0.82rem', fontFamily:"'Cormorant Garamond',serif" }}>{moments.length} {moments.length===1?'memory':'memories'} captured</p>}
          </div>

          {loading ? (
            <div style={{ textAlign:'center', padding:'6rem' }}>
              <p style={{ color:'var(--muted)', fontStyle:'italic', fontFamily:"'Playfair Display',serif", fontSize:'1.1rem', animation:'pulse 2s ease-in-out infinite' }}>Opening your book...</p>
            </div>
          ) : moments.length === 0 ? (
            <div style={{ textAlign:'center', padding:'6rem 3rem', border:'1px dashed rgba(200,151,90,0.15)', borderRadius:'20px' }}>
              <p style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.5rem', marginBottom:'1rem', fontWeight:400 }}>Your story hasn't begun yet</p>
              <p style={{ color:'var(--muted)', fontStyle:'italic', marginBottom:'2.5rem', fontFamily:"'Cormorant Garamond',serif" }}>Every great story starts with a single felt moment</p>
              <Link href="/moments/new" style={{ background:'var(--gold)', color:'var(--forest)', padding:'0.9rem 2.5rem', borderRadius:'2rem', textDecoration:'none', fontFamily:"'Playfair Display',serif", fontWeight:700 }}>Capture your first moment</Link>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1.75rem' }}>
              {moments.map((m, i) => <MomentCard key={m.id} moment={m} index={i} />)}
            </div>
          )}
        </div>

        {/* Floating FAB */}
        <div style={{ position:'fixed', bottom:'2.5rem', right:'2.5rem', zIndex:50 }}>
          <InkDropButton />
        </div>
      </div>
    </>
  )
}