'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const Cursor = dynamic(() => import('@/components/ui/Cursor'), { ssr: false })

// ─── Vine Sidebar (same pattern as other pages) ──────────────────────────────
function VineSidebar({ user, onLogout }: { user: any; onLogout: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const hoveredItem = useRef(-1)
  const [hov, setHov] = useState(-1)
  const navItems = [
    { label:'Moments', icon:'◎', href:'/dashboard' },
    { label:'My Book', icon:'❧', href:'/my-story' },
    { label:'New Moment', icon:'✦', href:'/moments/new' },
    { label:'Settings', icon:'◈', href:'/settings' },
  ]
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!; let t = 0
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize(); window.addEventListener('resize', resize)
    const draw = () => {
      const W=canvas.width,H=canvas.height; ctx.clearRect(0,0,W,H)
      const sx=28, sg=ctx.createLinearGradient(sx,0,sx,H)
      sg.addColorStop(0,'rgba(90,158,111,0)');sg.addColorStop(0.1,'rgba(90,158,111,0.35)');sg.addColorStop(0.9,'rgba(90,158,111,0.35)');sg.addColorStop(1,'rgba(90,158,111,0)')
      ctx.save();ctx.strokeStyle=sg;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(sx,0)
      for(let y=0;y<=H;y+=40)ctx.lineTo(sx+Math.sin(y*0.05+t*0.3)*3,y)
      ctx.stroke();ctx.restore()
      ;[0.15,0.32,0.48,0.65,0.82].forEach((pos,i)=>{
        const y=H*pos,x=sx+Math.sin(y*0.05+t*0.3)*3,side=i%2===0?1:-1,ll=12+Math.sin(t*0.4+i)*2
        ctx.save();ctx.translate(x,y);ctx.rotate(side*(0.4+Math.sin(t*0.6+i*1.2)*0.08))
        ctx.globalAlpha=0.45+0.15*Math.sin(t*0.5+i);ctx.fillStyle='#5a9e6f'
        ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(side*ll*0.7,-ll*0.4,side*ll,0);ctx.quadraticCurveTo(side*ll*0.7,ll*0.3,0,0);ctx.fill();ctx.restore()
      })
      navItems.forEach((_,i)=>{
        const y=160+i*64,isH=hoveredItem.current===i
        const bloom=isH?(0.6+0.4*Math.sin(t*3)):0.2
        const fx=sx+Math.sin(y*0.05+t*0.3)*3
        ctx.save();ctx.globalAlpha=0.3+bloom*0.4;ctx.strokeStyle='#5a9e6f';ctx.lineWidth=1
        ctx.beginPath();ctx.moveTo(fx,y);ctx.quadraticCurveTo(fx+10,y-8,fx+18,y);ctx.stroke();ctx.restore()
        if(bloom>0.15){
          const ps=4+bloom*5,rot=t*0.05+i*0.8
          for(let p=0;p<5;p++){const ang=(p/5)*Math.PI*2+rot;ctx.save();ctx.globalAlpha=bloom*0.7;ctx.fillStyle='#7cb987';ctx.beginPath();ctx.arc(fx+18+Math.cos(ang)*ps,y+Math.sin(ang)*ps,ps*0.55,0,Math.PI*2);ctx.fill();ctx.restore()}
          ctx.save();ctx.globalAlpha=bloom;ctx.fillStyle='#c8975a';ctx.beginPath();ctx.arc(fx+18,y,2.5,0,Math.PI*2);ctx.fill();ctx.restore()
        }
      })
      t+=0.016;rafRef.current=requestAnimationFrame(draw)
    }
    draw()
    return()=>{cancelAnimationFrame(rafRef.current);window.removeEventListener('resize',resize)}
  },[])
  return (
    <div style={{width:'220px',flexShrink:0,background:'rgba(4,10,5,0.95)',borderRight:'1px solid rgba(200,151,90,0.08)',display:'flex',flexDirection:'column',position:'sticky',top:0,height:'100vh',overflow:'hidden'}}>
      <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}}/>
      <div style={{position:'relative',zIndex:2,display:'flex',flexDirection:'column',height:'100%',padding:'2rem 0'}}>
        <Link href="/" style={{fontFamily:"'Playfair Display',serif",fontSize:'1.8rem',color:'var(--gold)',textDecoration:'none',padding:'0 1.5rem',marginBottom:'2.5rem',display:'block'}}>felt.</Link>
        <nav style={{flex:1}}>
          {navItems.map((item,i)=>(
            <Link key={item.label} href={item.href} onMouseEnter={()=>{hoveredItem.current=i;setHov(i)}} onMouseLeave={()=>{hoveredItem.current=-1;setHov(-1)}} style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.85rem 1.5rem 0.85rem 3.2rem',textDecoration:'none',color:hov===i?'var(--parchment)':'var(--muted)',transition:'all 0.3s',fontFamily:"'Cormorant Garamond',serif",fontSize:'1rem'}}>
              <span style={{fontSize:'0.7rem',color:'rgba(200,151,90,0.3)'}}>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div style={{padding:'0 1.5rem',borderTop:'1px solid rgba(200,151,90,0.08)',paddingTop:'1.5rem'}}>
          <p style={{color:'var(--parchment)',fontStyle:'italic',fontFamily:"'Cormorant Garamond',serif",fontSize:'0.9rem',marginBottom:'0.75rem'}}>{user?.name}</p>
          <button onClick={onLogout} style={{background:'transparent',border:'none',color:'rgba(107,138,114,0.5)',fontSize:'0.8rem',fontFamily:"'Cormorant Garamond',serif",fontStyle:'italic',cursor:'none',padding:0}} onMouseEnter={e=>e.currentTarget.style.color='var(--gold)'} onMouseLeave={e=>e.currentTarget.style.color='rgba(107,138,114,0.5)'}>sign out</button>
        </div>
      </div>
    </div>
  )
}

// ─── Growing Tree Canvas — the centerpiece ───────────────────────────────────
function DreamTree({ isPro }: { isPro: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const DPR = window.devicePixelRatio || 1
    const resize = () => {
      canvas.width = canvas.offsetWidth * DPR
      canvas.height = canvas.offsetHeight * DPR
      ctx.scale(DPR, DPR)
    }
    resize()
    const W = canvas.offsetWidth, H = canvas.offsetHeight
    const cx = W / 2, baseY = H - 30

    const fireflies = Array.from({ length: isPro ? 14 : 0 }, () => ({
      x: cx + (Math.random()-0.5) * 140,
      y: baseY - 60 - Math.random() * 140,
      r: 1 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
      vx: (Math.random()-0.5) * 0.15,
      vy: (Math.random()-0.5) * 0.15,
    }))
    const petals = Array.from({ length: isPro ? 10 : 0 }, () => ({
      x: cx + (Math.random()-0.5) * 160,
      y: -Math.random() * H,
      vy: 0.3 + Math.random() * 0.4,
      vx: (Math.random()-0.5) * 0.3,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random()-0.5) * 0.02,
      size: 3 + Math.random() * 3,
    }))

    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      const grad = ctx.createRadialGradient(cx, baseY, 0, cx, baseY, isPro ? 120 : 60)
      grad.addColorStop(0, isPro ? 'rgba(200,151,90,0.12)' : 'rgba(124,185,135,0.08)')
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)

      const trunkH = isPro ? 90 : 50
      const trunkW = isPro ? 8 : 4
      ctx.strokeStyle = isPro ? '#8a5a2a' : '#4a6a4a'
      ctx.lineWidth = trunkW
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(cx, baseY)
      ctx.quadraticCurveTo(cx + Math.sin(t*0.3)*2, baseY - trunkH/2, cx, baseY - trunkH)
      ctx.stroke()

      if (isPro) {
        const branches = [
          { ang: -0.7, len: 55 }, { ang: -0.3, len: 65 }, { ang: 0.2, len: 60 },
          { ang: 0.65, len: 50 }, { ang: -1.1, len: 40 }, { ang: 1.0, len: 42 },
        ]
        const topX = cx + Math.sin(t*0.3)*2, topY = baseY - trunkH
        branches.forEach((b, i) => {
          const sway = Math.sin(t*0.4 + i) * 0.05
          const ex = topX + Math.sin(b.ang + sway) * b.len
          const ey = topY - Math.cos(b.ang + sway) * b.len * 0.7
          ctx.strokeStyle = '#9a6a35'
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(topX, topY)
          ctx.quadraticCurveTo((topX+ex)/2, (topY+ey)/2 - 10, ex, ey)
          ctx.stroke()

          for (let l = 0; l < 8; l++) {
            const lang = (l / 8) * Math.PI * 2 + t * 0.2 + i
            const lr = 14 + Math.sin(t*0.5 + l) * 3
            const lx = ex + Math.cos(lang) * lr * 0.6
            const ly = ey + Math.sin(lang) * lr * 0.5
            ctx.save()
            ctx.globalAlpha = 0.75 + 0.2 * Math.sin(t + l)
            ctx.fillStyle = l % 3 === 0 ? '#f5c850' : (l % 3 === 1 ? '#dba96e' : '#7cb987')
            ctx.beginPath()
            ctx.arc(lx, ly, 4, 0, Math.PI*2)
            ctx.fill()
            ctx.restore()
          }
        })

        fireflies.forEach(f => {
          f.x += f.vx; f.y += f.vy; f.phase += 0.03
          if (f.x < cx-160) f.vx = Math.abs(f.vx); if (f.x > cx+160) f.vx = -Math.abs(f.vx)
          if (f.y < baseY-220) f.vy = Math.abs(f.vy); if (f.y > baseY-40) f.vy = -Math.abs(f.vy)
          const glow = 0.4 + 0.6 * Math.sin(f.phase)
          ctx.save()
          ctx.globalAlpha = glow
          const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 4)
          g.addColorStop(0, 'rgba(255,230,140,0.9)')
          g.addColorStop(1, 'rgba(255,230,140,0)')
          ctx.fillStyle = g
          ctx.beginPath(); ctx.arc(f.x, f.y, f.r*4, 0, Math.PI*2); ctx.fill()
          ctx.fillStyle = '#fff5cc'
          ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI*2); ctx.fill()
          ctx.restore()
        })

        petals.forEach(p => {
          p.y += p.vy; p.x += p.vx; p.rot += p.vr
          if (p.y > H) { p.y = -10; p.x = cx + (Math.random()-0.5)*160 }
          ctx.save()
          ctx.translate(p.x, p.y); ctx.rotate(p.rot)
          ctx.globalAlpha = 0.7
          ctx.fillStyle = '#f0b8a0'
          ctx.beginPath()
          ctx.ellipse(0, 0, p.size, p.size*0.6, 0, 0, Math.PI*2)
          ctx.fill()
          ctx.restore()
        })

      } else {
        const leafPositions = [
          { x: cx-8, y: baseY-trunkH+5 }, { x: cx+6, y: baseY-trunkH-2 }, { x: cx, y: baseY-trunkH-10 },
        ]
        leafPositions.forEach((p, i) => {
          ctx.save()
          ctx.globalAlpha = 0.6 + 0.15*Math.sin(t+i)
          ctx.fillStyle = '#5a9e6f'
          ctx.beginPath()
          ctx.ellipse(p.x, p.y, 6, 4, Math.sin(t*0.3+i)*0.3, 0, Math.PI*2)
          ctx.fill()
          ctx.restore()
        })
      }

      t += 0.016
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [isPro])

  return <canvas ref={canvasRef} style={{ width:'100%', height:'280px', display:'block' }}/>
}

// ─── Feature row, no emojis — small dot marker only ──────────────────────────
function FeatureRow({ text, included }: { text: string; included: boolean }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'0.85rem', padding:'0.7rem 0', opacity: included ? 1 : 0.35 }}>
      <span style={{ fontSize:'0.6rem', color: included ? '#c8975a' : 'var(--muted)', width:'14px', flexShrink:0, textAlign:'center' }}>{included ? '✦' : '·'}</span>
      <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1rem', fontStyle: included ? 'normal' : 'italic', color: included ? 'var(--parchment)' : 'var(--muted)' }}>{text}</span>
    </div>
  )
}

export default function SubscriptionPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('felt_token')
    const ud = localStorage.getItem('felt_user')
    if (!token) { window.location.href = '/login'; return }
    if (ud) try { setUser(JSON.parse(ud)) } catch {}
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => {
        const u = d?.data?.data || d?.data || d
        if (u && (u.id || u.email)) { setUser(u); localStorage.setItem('felt_user', JSON.stringify(u)) }
        setLoading(false)
      }).catch(() => setLoading(false))
  }, [])

  const logout = () => { localStorage.removeItem('felt_token'); localStorage.removeItem('felt_user'); window.location.href = '/' }

  const isPro = user?.subscriptionPlan === 'PRO'

  const handleUpgrade = async () => {
    setCheckingOut(true)
    setMessage('')
    try {
      const token = localStorage.getItem('felt_token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscription/checkout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      const data = json?.data?.data || json?.data || json
      if (data?.url) {
        window.location.href = data.url
      } else {
        setMessage('Could not start checkout. Please try again.')
        setCheckingOut(false)
      }
    } catch (e) {
      setMessage('Something went wrong. Please try again.')
      setCheckingOut(false)
    }
  }

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const token = localStorage.getItem('felt_token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscription/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      const data = json?.data?.data || json?.data || json
      setMessage(data?.message || 'Your plan will end at the close of this billing period.')
    } catch (e) {
      setMessage('Could not cancel. Please try again or contact support.')
    }
    setCancelling(false)
  }

  return (
    <>
      <Cursor />
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmerGold { 0%,100%{opacity:0.5} 50%{opacity:1} }
      `}</style>
      <div style={{ display:'flex', minHeight:'100vh', position:'relative', zIndex:2 }}>
        <VineSidebar user={user} onLogout={logout} />

        <div style={{ flex:1, padding:'3rem 3.5rem', overflowY:'auto' }}>
          <div style={{ maxWidth:'920px', margin:'0 auto', animation:'fadeIn 0.6s ease both' }}>

            <p style={{ color:'var(--muted)', fontStyle:'italic', fontFamily:"'Cormorant Garamond',serif", fontSize:'0.95rem', marginBottom:'0.4rem' }}>
              every story deserves room to grow
            </p>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'2.4rem', fontWeight:400, marginBottom:'2.5rem' }}>
              {isPro ? 'Your story is in full bloom' : 'Let your story bloom'}
            </h1>

            {loading ? (
              <p style={{ color:'var(--muted)', fontStyle:'italic', fontFamily:"'Cormorant Garamond',serif" }}>Loading...</p>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2rem', alignItems:'start' }}>

                {/* FREE card */}
                <div style={{
                  background: !isPro ? 'rgba(124,185,135,0.05)' : 'rgba(8,18,10,0.5)',
                  border: !isPro ? '1px solid rgba(124,185,135,0.3)' : '1px solid rgba(200,151,90,0.06)',
                  borderRadius:'20px', padding:'2rem', position:'relative', overflow:'hidden',
                  transition:'all 0.4s',
                }}>
                  {!isPro && (
                    <div style={{ position:'absolute', top:'1.2rem', right:'1.2rem', fontSize:'0.6rem', letterSpacing:'0.15em', color:'#7cb987', textTransform:'uppercase', fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic' }}>
                      current plan
                    </div>
                  )}
                  <p style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', color:'var(--cream)', marginBottom:'0.3rem' }}>A Seedling</p>
                  <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', color:'var(--muted)', fontSize:'0.9rem', marginBottom:'1.5rem' }}>free, forever</p>

                  <DreamTree isPro={false} />

                  <div style={{ marginTop:'1.5rem', borderTop:'1px solid rgba(124,185,135,0.1)', paddingTop:'1rem' }}>
                    <FeatureRow text="Up to 30 moments" included />
                    <FeatureRow text="My Book — basic layouts" included />
                    <FeatureRow text="AI poetic reflections" included />
                    <FeatureRow text="Living video moments" included={false} />
                    <FeatureRow text="Original music per moment" included={false} />
                    <FeatureRow text="Hardcover printed book" included={false} />
                  </div>
                </div>

                {/* PRO card */}
                <div style={{
                  background: isPro ? 'linear-gradient(160deg, rgba(200,151,90,0.1), rgba(200,151,90,0.03))' : 'rgba(8,18,10,0.6)',
                  border: isPro ? '1px solid rgba(200,151,90,0.4)' : '1px solid rgba(200,151,90,0.15)',
                  borderRadius:'20px', padding:'2rem', position:'relative', overflow:'hidden',
                  boxShadow: isPro ? '0 20px 60px rgba(200,151,90,0.1)' : 'none',
                  transition:'all 0.4s',
                }}>
                  <div style={{ position:'absolute', top:'1.2rem', right:'1.2rem', fontSize:'0.6rem', letterSpacing:'0.15em', color:'#c8975a', textTransform:'uppercase', fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', animation: isPro ? 'none' : 'shimmerGold 2.5s ease-in-out infinite' }}>
                    {isPro ? 'current plan' : 'most felt'}
                  </div>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', color:'var(--gold)', marginBottom:'0.3rem' }}>A Blooming Tree</p>
                  <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', color:'var(--muted)', fontSize:'0.9rem', marginBottom:'1.5rem' }}>
                    <span style={{ fontSize:'1.3rem', color:'var(--cream)', fontStyle:'normal' }}>$9.99</span> / month
                  </p>

                  <DreamTree isPro={true} />

                  <div style={{ marginTop:'1.5rem', borderTop:'1px solid rgba(200,151,90,0.12)', paddingTop:'1rem' }}>
                    <FeatureRow text="Unlimited moments" included />
                    <FeatureRow text="My Book — every elegant layout" included />
                    <FeatureRow text="AI poetic reflections" included />
                    <FeatureRow text="Living video moments" included />
                    <FeatureRow text="Original music per moment" included />
                    <FeatureRow text="Hardcover printed book, mailed to you" included />
                  </div>

                  {!isPro ? (
                    <button onClick={handleUpgrade} disabled={checkingOut}
                      style={{ width:'100%', marginTop:'1.8rem', background:'linear-gradient(135deg,#c8975a,#dba96e)', color:'var(--forest)', border:'none', borderRadius:'2rem', padding:'0.9rem', fontFamily:"'Playfair Display',serif", fontSize:'1rem', fontWeight:700, cursor:'none', transition:'all 0.3s', opacity: checkingOut ? 0.7 : 1 }}
                      onMouseEnter={e=>{if(!checkingOut){e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 10px 30px rgba(200,151,90,0.35)'}}}
                      onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none'}}
                    >{checkingOut ? 'Opening checkout...' : 'Let it bloom'}</button>
                  ) : (
                    <button onClick={handleCancel} disabled={cancelling}
                      style={{ width:'100%', marginTop:'1.8rem', background:'transparent', border:'1px solid rgba(200,151,90,0.2)', color:'var(--muted)', borderRadius:'2rem', padding:'0.9rem', fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontSize:'0.95rem', cursor:'none', transition:'all 0.3s' }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(200,100,100,0.4)';e.currentTarget.style.color='rgba(220,140,140,0.8)'}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(200,151,90,0.2)';e.currentTarget.style.color='var(--muted)'}}
                    >{cancelling ? 'Cancelling...' : 'Let the season end'}</button>
                  )}
                </div>
              </div>
            )}

            {message && (
              <p style={{ marginTop:'1.5rem', textAlign:'center', fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontSize:'0.9rem', color:'#dba96e', animation:'fadeIn 0.4s ease' }}>{message}</p>
            )}

            <p style={{ marginTop:'3rem', textAlign:'center', fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontSize:'0.82rem', color:'rgba(200,151,90,0.35)' }}>
              cancel anytime · your moments are always yours to keep
            </p>
          </div>
        </div>
      </div>
    </>
  )
}