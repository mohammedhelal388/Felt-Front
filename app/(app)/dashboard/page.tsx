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

// ─── Vine Sidebar ────────────────────────────────────────────────────────────
function VineSidebar({ active, user, onLogout }: { active: string; user: any; onLogout: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const hoveredItem = useRef(-1)
  const [hovered, setHovered] = useState(-1)

  const navItems = [
    { label: 'Moments', icon: '◎', href: '/dashboard' },
    { label: 'My Book', icon: '❧', href: '/my-story' },
    { label: 'New Moment', icon: '✦', href: '/moments/new' },
    { label: 'Settings', icon: '◈', href: '/settings' },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let t = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const W = canvas.width, H = canvas.height
      ctx.clearRect(0, 0, W, H)

      // vine stem — runs full height on left edge
      const stemX = 28
      ctx.save()
      const stemGrad = ctx.createLinearGradient(stemX, 0, stemX, H)
      stemGrad.addColorStop(0, 'rgba(90,158,111,0)')
      stemGrad.addColorStop(0.1, 'rgba(90,158,111,0.35)')
      stemGrad.addColorStop(0.9, 'rgba(90,158,111,0.35)')
      stemGrad.addColorStop(1, 'rgba(90,158,111,0)')
      ctx.strokeStyle = stemGrad
      ctx.lineWidth = 1.5
      ctx.beginPath()
      // organic vine with gentle curves
      ctx.moveTo(stemX, 0)
      for (let y = 0; y <= H; y += 40) {
        const x = stemX + Math.sin(y * 0.05 + t * 0.3) * 3
        ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.restore()

      // leaves along stem
      const leafPositions = [0.15, 0.32, 0.48, 0.65, 0.82]
      leafPositions.forEach((pos, i) => {
        const y = H * pos
        const x = stemX + Math.sin(y * 0.05 + t * 0.3) * 3
        const side = i % 2 === 0 ? 1 : -1
        const sway = Math.sin(t * 0.6 + i * 1.2) * 0.08
        const leafLen = 12 + Math.sin(t * 0.4 + i) * 2

        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(side * (0.4 + sway))
        ctx.globalAlpha = 0.45 + 0.15 * Math.sin(t * 0.5 + i)
        ctx.fillStyle = '#5a9e6f'
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.quadraticCurveTo(side * leafLen * 0.7, -leafLen * 0.4, side * leafLen, 0)
        ctx.quadraticCurveTo(side * leafLen * 0.7, leafLen * 0.3, 0, 0)
        ctx.fill()
        ctx.restore()
      })

      // nav item flowers — one per nav item
      const navStartY = 160
      const navSpacing = 64
      navItems.forEach((_, i) => {
        const y = navStartY + i * navSpacing
        const isActive = active === navItems[i].label || (i === 0 && active === 'My Story')
        const isHov = hoveredItem.current === i
        const bloom = isActive ? 1 : isHov ? (0.6 + 0.4 * Math.sin(t * 3)) : 0.2

        const fx = stemX + Math.sin(y * 0.05 + t * 0.3) * 3

        // stem to flower
        ctx.save()
        ctx.globalAlpha = 0.3 + bloom * 0.4
        ctx.strokeStyle = '#5a9e6f'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(fx, y)
        ctx.quadraticCurveTo(fx + 10, y - 8, fx + 18, y)
        ctx.stroke()
        ctx.restore()

        // flower petals
        if (bloom > 0.15) {
          const petalCount = 5
          const petalSize = 4 + bloom * 5
          const rotation = t * (isActive ? 0.15 : 0.05) + i * 0.8

          for (let p = 0; p < petalCount; p++) {
            const angle = (p / petalCount) * Math.PI * 2 + rotation
            const px = fx + 18 + Math.cos(angle) * petalSize
            const py = y + Math.sin(angle) * petalSize
            ctx.save()
            ctx.globalAlpha = bloom * 0.7
            ctx.fillStyle = isActive ? '#c8975a' : '#7cb987'
            ctx.beginPath()
            ctx.arc(px, py, petalSize * 0.55, 0, Math.PI * 2)
            ctx.fill()
            ctx.restore()
          }

          // center dot
          ctx.save()
          ctx.globalAlpha = bloom
          ctx.fillStyle = isActive ? '#ffe8a0' : '#c8975a'
          ctx.beginPath()
          ctx.arc(fx + 18, y, 2.5, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
      })

      t += 0.016
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [active])

  return (
    <div style={{
      width: '220px', flexShrink: 0,
      background: 'rgba(4,10,5,0.95)',
      borderRight: '1px solid rgba(200,151,90,0.08)',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
      height: '100vh', position: 'sticky' as any, top: 0,
    }}>
      {/* vine canvas */}
      <canvas ref={canvasRef} style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%', padding: '2rem 0' }}>
        {/* logo */}
        <Link href="/" style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.8rem', color: 'var(--gold)',
          textDecoration: 'none', padding: '0 1.5rem',
          marginBottom: '2.5rem', display: 'block',
        }}>felt.</Link>

        {/* nav */}
        <nav style={{ flex: 1 }}>
          {navItems.map((item, i) => {
            const isActive = active === item.label
            return (
              <Link key={item.label} href={item.href}
                onMouseEnter={() => { hoveredItem.current = i; setHovered(i) }}
                onMouseLeave={() => { hoveredItem.current = -1; setHovered(-1) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.85rem 1.5rem 0.85rem 3.2rem',
                  textDecoration: 'none',
                  color: isActive ? 'var(--cream)' : hovered === i ? 'var(--parchment)' : 'var(--muted)',
                  background: isActive ? 'rgba(200,151,90,0.06)' : 'transparent',
                  borderRight: isActive ? '2px solid var(--gold)' : '2px solid transparent',
                  transition: 'all 0.3s',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '1rem', fontStyle: isActive ? 'italic' : 'normal',
                  letterSpacing: '0.05em',
                }}>
                <span style={{ fontSize: '0.7rem', color: isActive ? 'var(--gold)' : 'rgba(200,151,90,0.3)', transition: 'color 0.3s' }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* user + logout */}
        <div style={{ padding: '0 1.5rem', borderTop: '1px solid rgba(200,151,90,0.08)', paddingTop: '1.5rem' }}>
          <p style={{ color: 'var(--parchment)', fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif", fontSize: '0.9rem', marginBottom: '0.75rem' }}>
            {user?.name}
          </p>
          <button onClick={onLogout} style={{
            background: 'transparent', border: 'none',
            color: 'rgba(107,138,114,0.5)', fontSize: '0.8rem',
            fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
            letterSpacing: '0.05em', transition: 'color 0.3s', cursor: 'none',
            padding: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(107,138,114,0.5)'}
          >
            sign out
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Ink Drop FAB ─────────────────────────────────────────────────────────────
function InkDropFAB() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const hov = useRef(false)
  const [isHov, setIsHov] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width = 80; canvas.height = 100
    let t = 0
    canvas.addEventListener('mouseenter', () => { hov.current = true; setIsHov(true) })
    canvas.addEventListener('mouseleave', () => { hov.current = false; setIsHov(false) })

    const draw = () => {
      ctx.clearRect(0, 0, 80, 100)
      const cx = 40, h = hov.current
      const cycle = (t * 0.18) % (Math.PI * 2)
      const dripP = Math.pow(Math.sin(cycle * 0.5), 2)
      const glow = ctx.createRadialGradient(cx, 22, 0, cx, 22, h ? 36 : 28)
      glow.addColorStop(0, `rgba(255,220,100,${h ? 0.5 : 0.22})`)
      glow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, 22, h ? 36 : 28, 0, Math.PI * 2); ctx.fill()
      const ds = h ? 16 : 12
      const bg = ctx.createRadialGradient(cx - 3, 18, 0, cx, 22, ds)
      bg.addColorStop(0, '#fff8e0'); bg.addColorStop(0.4, '#c8975a'); bg.addColorStop(1, '#7a4a15')
      ctx.fillStyle = bg
      ctx.beginPath(); ctx.moveTo(cx, 10)
      ctx.bezierCurveTo(cx + ds, 10, cx + ds, 28, cx, 32)
      ctx.bezierCurveTo(cx - ds, 28, cx - ds, 10, cx, 10); ctx.fill()
      if (!h) {
        const tl = dripP * 28
        const tg = ctx.createLinearGradient(cx, 30, cx, 30 + tl)
        tg.addColorStop(0, 'rgba(200,151,90,0.8)'); tg.addColorStop(1, 'rgba(200,151,90,0)')
        ctx.strokeStyle = tg; ctx.lineWidth = 2 - dripP * 1.5
        ctx.beginPath(); ctx.moveTo(cx, 30); ctx.lineTo(cx, 30 + tl); ctx.stroke()
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

// ─── Story Hero ───────────────────────────────────────────────────────────────
function StoryHero({ user, moments }: { user: any; moments: Moment[] }) {
  const generated = moments.filter(m => m.isGenerated).length
  const chaptersComplete = Math.floor(generated / 3)
  const nextChapterProgress = (generated % 3) / 3
  const latest = moments.find(m => m.isGenerated && m.poeticText)

  return (
    <div style={{
      background: 'rgba(8,18,10,0.8)',
      border: '1px solid rgba(200,151,90,0.12)',
      borderRadius: '20px', padding: '2.5rem 3rem',
      marginBottom: '3rem', position: 'relative', overflow: 'hidden',
    }}>
      {/* ambient glow */}
      <div style={{ position: 'absolute', top: '-30%', right: '-5%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,151,90,0.05), transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
        <div style={{ flex: 1 }}>
          <p style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: '0.85rem', marginBottom: '0.4rem', fontFamily: "'Cormorant Garamond', serif" }}>welcome back,</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 400, marginBottom: '0.5rem' }}>
            {user?.name}'s Story
          </h1>

          {chaptersComplete > 0 ? (
            <p style={{ color: 'var(--muted)', fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem' }}>
              <span style={{ color: 'var(--gold)' }}>Chapter {chaptersComplete}</span> of your legacy is written
            </p>
          ) : (
            <p style={{ color: 'var(--muted)', fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif" }}>
              Your story is just beginning
            </p>
          )}

          {/* chapter progress */}
          <div style={{ marginTop: '1.5rem', maxWidth: '320px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: 'var(--muted)', textTransform: 'uppercase', fontFamily: "'Cormorant Garamond', serif" }}>
                Next chapter
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--gold)', fontFamily: "'Cormorant Garamond', serif" }}>
                {generated % 3}/3 moments
              </span>
            </div>
            <div style={{ height: '2px', background: 'rgba(200,151,90,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${nextChapterProgress * 100}%`, background: 'linear-gradient(to right, rgba(200,151,90,0.4), var(--gold))', borderRadius: '2px', transition: 'width 1s ease', boxShadow: '0 0 8px rgba(200,151,90,0.4)' }} />
            </div>
          </div>
        </div>

        {/* latest moment preview */}
        {latest && (
          <div style={{ maxWidth: '280px', flex: '0 0 auto' }}>
            <p style={{ fontSize: '0.6rem', letterSpacing: '0.25em', color: 'rgba(200,151,90,0.4)', textTransform: 'uppercase', marginBottom: '0.6rem', fontFamily: "'Cormorant Garamond', serif" }}>
              last felt
            </p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--parchment)', lineHeight: 1.7, marginBottom: '0.5rem' }}>
              "{latest.poeticText?.split('.')[0]}."
            </p>
            {latest.location && (
              <p style={{ fontSize: '0.65rem', color: 'var(--muted)', fontFamily: "'Cormorant Garamond', serif" }}>
                📍 {latest.location}
              </p>
            )}
          </div>
        )}

        {/* stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-end' }}>
          {[
            { n: moments.length, label: 'captured' },
            { n: generated, label: 'felt' },
            { n: chaptersComplete, label: 'chapters' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: 'var(--gold)', lineHeight: 1, fontWeight: 700 }}>{s.n}</p>
              <p style={{ color: 'var(--muted)', fontSize: '0.7rem', fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* open my book CTA */}
      <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(200,151,90,0.08)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link href="/my-story" style={{ background: 'transparent', border: '1px solid rgba(200,151,90,0.25)', color: 'var(--gold)', padding: '0.6rem 1.8rem', borderRadius: '2rem', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '0.9rem', transition: 'all 0.3s', textDecoration: 'none', display: 'inline-block' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,151,90,0.08)'; e.currentTarget.style.borderColor = 'var(--gold)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(200,151,90,0.25)' }}
        >Open My Book ❧</Link>
        <p style={{ color: 'var(--muted)', fontSize: '0.8rem', fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif" }}>
          {user?.subscriptionPlan || 'FREE'} plan
        </p>
      </div>
    </div>
  )
}

// ─── Moment Card ──────────────────────────────────────────────────────────────
function MomentCard({ moment, index }: { moment: Moment; index: number }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])

  const ec: Record<string, string> = {
    nostalgic: '#7ca4c0', belonging: '#7cb987', wonder: '#c8975a', peace: '#8fa897',
    joy: '#dba96e', melancholy: '#8878a0', awe: '#c8a855', love: '#c87878',
    excited: '#dba96e', sky: '#7ca4c0', sad: '#8878a0', happy: '#dba96e',
    frustrated: '#c87878', longing: '#8878a0', nervous: '#dba96e', nervious: '#dba96e',
  }
  const color = ec[moment.emotionWord?.toLowerCase()] || '#c8975a'

  return (
    <Link href={`/moments/${moment.id}`} style={{ textDecoration: 'none' }}>
      <div ref={ref} style={{
        background: 'rgba(10,20,12,0.85)', border: '1px solid rgba(200,151,90,0.1)',
        borderRadius: '16px', overflow: 'hidden', cursor: 'none',
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.9s ease ${index * 60}ms, transform 0.9s ease ${index * 60}ms, border-color 0.3s, box-shadow 0.3s, background 0.3s`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${color}55`
        e.currentTarget.style.transform = 'translateY(-5px)'
        e.currentTarget.style.boxShadow = `0 20px 50px rgba(0,0,0,0.5), 0 0 24px ${color}15`
        e.currentTarget.style.background = 'rgba(12,25,15,0.95)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(200,151,90,0.1)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.background = 'rgba(10,20,12,0.85)'
      }}
      >
        <div style={{ height: '170px', position: 'relative', overflow: 'hidden', background: `radial-gradient(circle at 30% 40%, ${color}18, rgba(10,20,12,0.9))` }}>
          {moment.frontPhotoUrl ? (
            <>
              <img src={moment.frontPhotoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent 40%, rgba(10,20,12,0.85))`, pointerEvents: 'none' }} />
            </>
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '2rem', opacity: 0.2 }}>✦</span>
            </div>
          )}
          {moment.isGenerated && (
            <span style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', background: 'rgba(200,151,90,0.9)', color: 'var(--forest)', fontSize: '0.55rem', padding: '0.2rem 0.6rem', borderRadius: '2rem', fontWeight: 700, letterSpacing: '0.1em' }}>FELT</span>
          )}
          <div style={{ position: 'absolute', bottom: '0.6rem', left: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
            <span style={{ fontSize: '0.58rem', letterSpacing: '0.2em', color, textTransform: 'uppercase', fontFamily: "'Cormorant Garamond', serif" }}>
              {moment.emotionWord || 'moment'}{moment.location ? ` · ${moment.location}` : ''}
            </span>
          </div>
        </div>
        <div style={{ padding: '1.2rem 1.3rem' }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--parchment)', lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {moment.poeticText || 'Waiting to be felt...'}
          </p>
          <p style={{ color: 'var(--muted)', fontSize: '0.68rem', marginTop: '0.8rem', fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif" }}>
            {new Date(moment.capturedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>
    </Link>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [moments, setMoments] = useState<Moment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('felt_token')
    const userData = localStorage.getItem('felt_user')
    if (!token) { window.location.href = '/login'; return }
    if (userData) setUser(JSON.parse(userData))
    // Refetch fresh user data in case it changed in Settings
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => {
        const u = d?.data?.data || d?.data || d
        if (u && (u.id || u.email)) { setUser(u); localStorage.setItem('felt_user', JSON.stringify(u)) }
      }).catch(() => {})
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/moments`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => {
        const raw = d.data || []
        const list = Array.isArray(raw) ? raw : []
        setMoments(list.map((m: any) => ({
          ...m,
          emotionWord: m.emotionWord || m.emotion_word || '',
          location: m.location || '',
          poeticText: m.poeticText || m.poetic_text || '',
          frontPhotoUrl: m.frontPhotoUrl || m.front_photo_url || '',
          isGenerated: m.isGenerated ?? m.is_generated ?? false,
          capturedAt: m.capturedAt || m.createdAt || new Date().toISOString(),
        })))
        setLoading(false)
      }).catch(() => setLoading(false))
  }, [])

  const logout = () => {
    localStorage.removeItem('felt_token')
    localStorage.removeItem('felt_user')
    window.location.href = '/'
  }

  // group moments by month
  const grouped = moments.reduce((acc, m) => {
    const key = new Date(m.capturedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    if (!acc[key]) acc[key] = []
    acc[key].push(m)
    return acc
  }, {} as Record<string, Moment[]>)

  return (
    <>
      <Cursor />
      <ParticleCanvas />
      <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 2 }}>

        {/* vine sidebar */}
        <VineSidebar active="My Story" user={user} onLogout={logout} />

        {/* main content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '3rem 3rem 6rem' }}>

          {/* story hero */}
          <StoryHero user={user} moments={moments} />

          {/* moments section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 400 }}>Your moments</h2>
            {moments.length > 0 && (
              <p style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: '0.82rem', fontFamily: "'Cormorant Garamond', serif" }}>
                {moments.length} {moments.length === 1 ? 'memory' : 'memories'}
              </p>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '6rem' }}>
              <p style={{ color: 'var(--muted)', fontStyle: 'italic', fontFamily: "'Playfair Display', serif", animation: 'pulse 2s ease-in-out infinite' }}>Opening your book...</p>
            </div>
          ) : moments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 3rem', border: '1px dashed rgba(200,151,90,0.12)', borderRadius: '20px' }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', marginBottom: '1rem', fontWeight: 400 }}>Your story hasn't begun yet</p>
              <p style={{ color: 'var(--muted)', fontStyle: 'italic', marginBottom: '2rem', fontFamily: "'Cormorant Garamond', serif" }}>Every great story starts with a single felt moment</p>
              <Link href="/moments/new" style={{ background: 'var(--gold)', color: 'var(--forest)', padding: '0.85rem 2.5rem', borderRadius: '2rem', textDecoration: 'none', fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>Capture your first moment</Link>
            </div>
          ) : (
            // grouped by month
            Object.entries(grouped).map(([month, monthMoments]) => (
              <div key={month} style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.7rem', letterSpacing: '0.3em', color: 'rgba(200,151,90,0.45)', textTransform: 'uppercase', fontFamily: "'Cormorant Garamond', serif", whiteSpace: 'nowrap' }}>
                    {month}
                  </p>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(200,151,90,0.08)' }} />
                  <p style={{ fontSize: '0.65rem', color: 'var(--muted)', fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif", whiteSpace: 'nowrap' }}>
                    {monthMoments.length} {monthMoments.length === 1 ? 'moment' : 'moments'}
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: '1.5rem' }}>
                  {monthMoments.map((m, i) => <MomentCard key={m.id} moment={m} index={i} />)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* floating ink drop */}
        <div style={{ position: 'fixed', bottom: '2.5rem', right: '2.5rem', zIndex: 50 }}>
          <InkDropFAB />
        </div>
      </div>
    </>
  )
}