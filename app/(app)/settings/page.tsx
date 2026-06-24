'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const Cursor = dynamic(() => import('@/components/ui/Cursor'), { ssr: false })

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
        const y=160+i*64,isA=navItems[i].href==='/settings',isH=hoveredItem.current===i
        const bloom=isA?1:isH?(0.6+0.4*Math.sin(t*3)):0.2
        const fx=sx+Math.sin(y*0.05+t*0.3)*3
        ctx.save();ctx.globalAlpha=0.3+bloom*0.4;ctx.strokeStyle='#5a9e6f';ctx.lineWidth=1
        ctx.beginPath();ctx.moveTo(fx,y);ctx.quadraticCurveTo(fx+10,y-8,fx+18,y);ctx.stroke();ctx.restore()
        if(bloom>0.15){
          const ps=4+bloom*5,rot=t*(isA?0.15:0.05)+i*0.8
          for(let p=0;p<5;p++){const ang=(p/5)*Math.PI*2+rot;ctx.save();ctx.globalAlpha=bloom*0.7;ctx.fillStyle=isA?'#c8975a':'#7cb987';ctx.beginPath();ctx.arc(fx+18+Math.cos(ang)*ps,y+Math.sin(ang)*ps,ps*0.55,0,Math.PI*2);ctx.fill();ctx.restore()}
          ctx.save();ctx.globalAlpha=bloom;ctx.fillStyle=isA?'#ffe8a0':'#c8975a';ctx.beginPath();ctx.arc(fx+18,y,2.5,0,Math.PI*2);ctx.fill();ctx.restore()
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
          {navItems.map((item,i)=>{const isA=item.href==='/settings';return(
            <Link key={item.label} href={item.href} onMouseEnter={()=>{hoveredItem.current=i;setHov(i)}} onMouseLeave={()=>{hoveredItem.current=-1;setHov(-1)}} style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.85rem 1.5rem 0.85rem 3.2rem',textDecoration:'none',color:isA?'var(--cream)':hov===i?'var(--parchment)':'var(--muted)',background:isA?'rgba(200,151,90,0.06)':'transparent',borderRight:isA?'2px solid var(--gold)':'2px solid transparent',transition:'all 0.3s',fontFamily:"'Cormorant Garamond',serif",fontSize:'1rem',fontStyle:isA?'italic':'normal'}}>
              <span style={{fontSize:'0.7rem',color:isA?'var(--gold)':'rgba(200,151,90,0.3)'}}>{item.icon}</span>{item.label}
            </Link>
          )})}
        </nav>
        <div style={{padding:'0 1.5rem',borderTop:'1px solid rgba(200,151,90,0.08)',paddingTop:'1.5rem'}}>
          <p style={{color:'var(--parchment)',fontStyle:'italic',fontFamily:"'Cormorant Garamond',serif",fontSize:'0.9rem',marginBottom:'0.75rem'}}>{user?.name}</p>
          <button onClick={onLogout} style={{background:'transparent',border:'none',color:'rgba(107,138,114,0.5)',fontSize:'0.8rem',fontFamily:"'Cormorant Garamond',serif",fontStyle:'italic',cursor:'none',padding:0}} onMouseEnter={e=>e.currentTarget.style.color='var(--gold)'} onMouseLeave={e=>e.currentTarget.style.color='rgba(107,138,114,0.5)'}>sign out</button>
        </div>
      </div>
    </div>
  )
}

function EditableField({ label, value, type='text', placeholder='', onSave }: any) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showPw, setShowPw] = useState(false)

  useEffect(() => {
    if (!editing && type !== 'password') setVal(value)
  }, [value, editing, type])

  const save = async () => {
    if (!val.trim()) return
    setSaving(true)
    const savedVal = val
    await onSave(val)
    setSaving(false); setSaved(true); setEditing(false); setShowPw(false)
    if (type !== 'password') setVal(savedVal)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div style={{marginBottom:'1.8rem',paddingBottom:'1.8rem',borderBottom:'1px solid rgba(200,151,90,0.07)'}}>
      <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'0.62rem',letterSpacing:'0.2em',color:'rgba(200,151,90,0.45)',textTransform:'uppercase',marginBottom:'0.5rem'}}>{label}</p>
      {editing ? (
        <div style={{display:'flex',gap:'0.75rem',alignItems:'center',flexWrap:'wrap'}}>
          <div style={{ position:'relative', flex:1, minWidth:'200px' }}>
            <input type={type==='password' && showPw ? 'text' : type} value={val} onChange={e=>setVal(e.target.value)}
              onKeyDown={e=>{if(e.key==='Enter')save();if(e.key==='Escape'){setEditing(false);setVal(type==='password'?'':value)}}}
              autoFocus placeholder={type==='password' ? 'New password' : undefined}
              style={{width:'100%',boxSizing:'border-box',background:'rgba(200,151,90,0.05)',border:'1px solid rgba(200,151,90,0.25)',borderRadius:'8px',padding:'0.65rem 1rem',paddingRight:type==='password'?'2.6rem':'1rem',color:'var(--cream)',fontFamily:"'Cormorant Garamond',serif",fontSize:'1rem',outline:'none'}}
            />
            {type==='password' && (
              <button type="button" onClick={()=>setShowPw(s=>!s)} style={{ position:'absolute', right:'0.7rem', top:'50%', transform:'translateY(-50%)', background:'transparent', border:'none', cursor:'none', color:'rgba(200,151,90,0.5)', fontSize:'0.95rem', padding:0, lineHeight:1 }}>
                {showPw ? '🙈' : '👁'}
              </button>
            )}
          </div>
          <button onClick={save} disabled={saving} style={{background:'var(--gold)',color:'var(--forest)',border:'none',borderRadius:'8px',padding:'0.65rem 1.3rem',fontFamily:"'Cormorant Garamond',serif",fontSize:'0.85rem',cursor:'none',opacity:saving?0.6:1}}>
            {saving?'saving...':'save'}
          </button>
          <button onClick={()=>{setEditing(false);setVal(type==='password'?'':value);setShowPw(false)}} style={{background:'transparent',border:'none',color:'var(--muted)',fontFamily:"'Cormorant Garamond',serif",fontSize:'0.85rem',cursor:'none'}}>cancel</button>
        </div>
      ) : (
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1rem',color:val?'var(--parchment)':'var(--muted)',fontStyle:val?'normal':'italic'}}>
            {type==='password' ? '••••••••' : (val || placeholder)}
          </p>
          <button onClick={()=>{setEditing(true);setVal(type==='password'?'':value)}} style={{background:'transparent',border:'none',color:saved?'#7cb987':'rgba(200,151,90,0.4)',fontSize:'0.8rem',fontFamily:"'Cormorant Garamond',serif",fontStyle:'italic',cursor:'none',transition:'color 0.3s'}}
            onMouseEnter={e=>e.currentTarget.style.color='var(--gold)'}
            onMouseLeave={e=>e.currentTarget.style.color=saved?'#7cb987':'rgba(200,151,90,0.4)'}
          >{saved?'✓ saved':'edit'}</button>
        </div>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [planMsg, setPlanMsg] = useState('')
  const [cancelConfirm, setCancelConfirm] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('felt_token')
    const ud = localStorage.getItem('felt_user')
    if (!token) { window.location.href = '/login'; return }
    if (ud) try { setUser(JSON.parse(ud)) } catch {}
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        const u = d?.data?.data || d?.data || d
        if (u && (u.id || u.email)) {
          setUser(u)
          localStorage.setItem('felt_user', JSON.stringify(u))
        }
        setLoading(false)
      })
      .catch((e) => { console.error('Failed to load user:', e); setLoading(false) })
  }, [])

  const logout = () => { localStorage.removeItem('felt_token'); localStorage.removeItem('felt_user'); window.location.href = '/' }

  const updateField = async (field: string, value: string) => {
    const token = localStorage.getItem('felt_token')
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    })
    const json = await res.json()
    const u = json?.data?.data || json?.data || json
    if (u?.id) { setUser(u); localStorage.setItem('felt_user', JSON.stringify(u)) }
  }

  const handleCancelSubscription = async () => {
    setCancelling(true)
    try {
      const token = localStorage.getItem('felt_token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscription/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      const data = json?.data?.data || json?.data || json
      setUser((u: any) => {
        const updated = {
          ...u,
          cancelAtPeriodEnd: true,
          currentPeriodEnd: data?.currentPeriodEnd || u?.currentPeriodEnd,
        }
        localStorage.setItem('felt_user', JSON.stringify(updated))
        return updated
      })
      setCancelConfirm(false)
    } catch (e) {
      setPlanMsg('Could not cancel. Please try again or contact support.')
    }
    setCancelling(false)
  }

  const card: React.CSSProperties = { background:'rgba(8,18,10,0.6)', border:'1px solid rgba(200,151,90,0.08)', borderRadius:'16px', padding:'2rem', marginBottom:'1.5rem' }
  const sectionLabel: React.CSSProperties = { fontFamily:"'Playfair Display',serif", fontSize:'0.72rem', letterSpacing:'0.2em', color:'rgba(200,151,90,0.45)', textTransform:'uppercase', marginBottom:'1.5rem' }

  return (
    <>
      <Cursor />
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ display:'flex', minHeight:'100vh', position:'relative', zIndex:2 }}>
        <VineSidebar user={user} onLogout={logout} />
        <div style={{ flex:1, padding:'3rem 3.5rem', overflowY:'auto' }}>
          <div style={{ maxWidth:'580px', animation:'fadeIn 0.6s ease both' }}>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'2.2rem', fontWeight:400, marginBottom:'0.4rem' }}>Settings</h1>
            <p style={{ color:'var(--muted)', fontStyle:'italic', fontFamily:"'Cormorant Garamond',serif", marginBottom:'2.5rem', fontSize:'1rem' }}>Manage your account and preferences</p>

            {/* Profile */}
            <div style={card}>
              <p style={sectionLabel}>Profile</p>
              {loading ? (
                <p style={{ color:'var(--muted)', fontStyle:'italic', fontFamily:"'Cormorant Garamond',serif" }}>Loading...</p>
              ) : <>
                <div style={{ display:'flex', alignItems:'center', gap:'1.5rem', marginBottom:'2rem', paddingBottom:'1.8rem', borderBottom:'1px solid rgba(200,151,90,0.07)' }}>
                  <div style={{ position:'relative', flexShrink:0 }}>
                    <div style={{ width:'72px', height:'72px', borderRadius:'50%', overflow:'hidden', border:'2px solid rgba(200,151,90,0.25)', background:'rgba(200,151,90,0.08)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {user?.avatarUrl
                        ? <img src={user.avatarUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                        : <p style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.8rem', color:'var(--gold)', opacity:0.6 }}>{user?.name?.[0]?.toUpperCase()||'?'}</p>
                      }
                    </div>
                  </div>
                  <div>
                    <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'0.62rem', letterSpacing:'0.2em', color:'rgba(200,151,90,0.45)', textTransform:'uppercase', marginBottom:'0.5rem' }}>Profile Photo</p>
                    <label style={{ cursor:'none', display:'inline-block' }}>
                      <input type="file" accept="image/*" style={{ display:'none' }} onChange={async(e) => {
                        const file = e.target.files?.[0]; if (!file) return
                        const token = localStorage.getItem('felt_token')
                        const form = new FormData()
                        form.append('avatar', file)
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/avatar`, {
                          method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form,
                        })
                        const data = await res.json()
                        const u = data?.data?.data || data?.data || data
                        if (u?.id) { setUser(u); localStorage.setItem('felt_user', JSON.stringify(u)) }
                      }}/>
                      <span style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontSize:'0.88rem', color:'rgba(200,151,90,0.5)', transition:'color 0.3s', borderBottom:'1px solid rgba(200,151,90,0.2)' }}
                        onMouseEnter={e=>e.currentTarget.style.color='var(--gold)'}
                        onMouseLeave={e=>e.currentTarget.style.color='rgba(200,151,90,0.5)'}
                      >upload photo</span>
                    </label>
                    {user?.avatarUrl && (
                      <button onClick={async()=>{
                        const token = localStorage.getItem('felt_token')
                        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/avatar`, { method:'DELETE', headers:{ Authorization:`Bearer ${token}` }})
                        setUser((u:any) => ({...u, avatarUrl:null}))
                      }} style={{ background:'transparent', border:'none', color:'rgba(180,80,80,0.45)', fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontSize:'0.78rem', cursor:'none', marginLeft:'0.75rem' }}
                        onMouseEnter={e=>e.currentTarget.style.color='rgba(220,100,100,0.8)'}
                        onMouseLeave={e=>e.currentTarget.style.color='rgba(180,80,80,0.45)'}
                      >remove</button>
                    )}
                  </div>
                </div>
                <EditableField label="Name" value={user?.name||''} placeholder="Your name" onSave={(v:string)=>updateField('name',v)} />
                <EditableField label="Email" value={user?.email||''} type="email" onSave={(v:string)=>updateField('email',v)} />
              </>}
            </div>

            {/* Security */}
            <div style={card}>
              <p style={sectionLabel}>Security</p>
              <EditableField label="Password" value="" type="password" placeholder="Set a new password" onSave={(v:string)=>updateField('password',v)} />
            </div>

            {/* Plan */}
            <div style={card}>
              <p style={sectionLabel}>Your Plan</p>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.2rem', color:'var(--gold)', marginBottom:'0.35rem' }}>
                    {user?.subscriptionPlan || 'FREE'} Plan
                  </p>
                  <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontSize:'0.88rem', color:'var(--muted)' }}>
                    {(!user?.subscriptionPlan || user?.subscriptionPlan === 'FREE')
                      ? 'Upgrade to unlock unlimited moments and more'
                      : user?.cancelAtPeriodEnd
                        ? 'Your season is winding down'
                        : 'Thank you for supporting felt. ✦'}
                  </p>
                </div>

                {(!user?.subscriptionPlan || user?.subscriptionPlan === 'FREE') ? (
                  <Link href="/subscription"
                    style={{ display:'inline-block', textDecoration:'none', background:'linear-gradient(135deg,#c8975a,#dba96e)', color:'var(--forest)', border:'none', borderRadius:'2rem', padding:'0.7rem 1.6rem', fontFamily:"'Playfair Display',serif", fontSize:'0.85rem', fontWeight:700, flexShrink:0, marginLeft:'1rem', transition:'all 0.3s' }}
                    onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(200,151,90,0.3)'}}
                    onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=''}}
                  >Upgrade ✦</Link>
                ) : user?.cancelAtPeriodEnd ? (
                  <Link href="/subscription"
                    style={{ display:'inline-block', textDecoration:'none', background:'transparent', border:'1px solid rgba(200,151,90,0.3)', color:'var(--gold)', borderRadius:'2rem', padding:'0.7rem 1.4rem', fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontSize:'0.85rem', flexShrink:0, marginLeft:'1rem' }}
                  >Keep blooming</Link>
                ) : (
                  !cancelConfirm ? (
                    <button onClick={()=>setCancelConfirm(true)}
                      style={{ background:'transparent', border:'1px solid rgba(200,151,90,0.2)', color:'var(--muted)', borderRadius:'2rem', padding:'0.7rem 1.6rem', fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontSize:'0.88rem', cursor:'none', flexShrink:0, marginLeft:'1rem', transition:'all 0.3s' }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(200,100,100,0.4)';e.currentTarget.style.color='rgba(220,140,140,0.85)'}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(200,151,90,0.2)';e.currentTarget.style.color='var(--muted)'}}
                    >Cancel plan</button>
                  ) : (
                    <div style={{ display:'flex', gap:'0.6rem', flexShrink:0, marginLeft:'1rem' }}>
                      <button onClick={handleCancelSubscription} disabled={cancelling}
                        style={{ background:'rgba(180,60,60,0.7)', color:'white', border:'none', borderRadius:'2rem', padding:'0.7rem 1.3rem', fontFamily:"'Cormorant Garamond',serif", fontSize:'0.85rem', cursor:'none', opacity:cancelling?0.6:1 }}
                      >{cancelling ? 'Cancelling...' : 'Confirm'}</button>
                      <button onClick={()=>setCancelConfirm(false)}
                        style={{ background:'transparent', border:'none', color:'var(--muted)', fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontSize:'0.85rem', cursor:'none' }}
                      >Keep it</button>
                    </div>
                  )
                )}
              </div>

              {/* Persistent cancellation notice with exact end date */}
              {user?.subscriptionPlan === 'PRO' && user?.cancelAtPeriodEnd && (
                <div style={{ marginTop:'1.2rem', paddingTop:'1.2rem', borderTop:'1px solid rgba(200,151,90,0.1)' }}>
                  <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontSize:'0.85rem', color:'rgba(220,160,110,0.85)', lineHeight:1.6 }}>
                    Your subscription has been cancelled and will end on{' '}
                    <strong style={{ color:'var(--gold)', fontStyle:'normal' }}>
                      {user?.currentPeriodEnd
                        ? new Date(user.currentPeriodEnd).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })
                        : 'your next billing date'}
                    </strong>
                    . You'll keep full access to everything until then.
                  </p>
                </div>
              )}

              {planMsg && <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontSize:'0.85rem', color:'#7cb987', marginTop:'1rem', animation:'fadeIn 0.4s ease' }}>{planMsg}</p>}
            </div>

            {/* Danger */}
            <div style={{ ...card, borderColor:'rgba(180,60,60,0.12)' }}>
              <p style={{ ...sectionLabel, color:'rgba(200,100,100,0.45)' }}>Danger Zone</p>
              {!deleteConfirm ? (
                <button onClick={()=>setDeleteConfirm(true)}
                  style={{ background:'transparent', border:'1px solid rgba(180,60,60,0.2)', color:'rgba(200,100,100,0.65)', borderRadius:'8px', padding:'0.65rem 1.4rem', fontFamily:"'Cormorant Garamond',serif", fontSize:'0.9rem', fontStyle:'italic', cursor:'none' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(200,80,80,0.45)';e.currentTarget.style.color='rgba(220,120,120,0.9)'}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(180,60,60,0.2)';e.currentTarget.style.color='rgba(200,100,100,0.65)'}}
                >Delete my account</button>
              ) : (
                <div>
                  <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'0.9rem', color:'rgba(200,120,120,0.85)', marginBottom:'1rem', lineHeight:1.75 }}>
                    This permanently deletes all your moments and your story. Type <strong style={{color:'rgba(230,150,150,1)'}}>delete my story</strong> to confirm.
                  </p>
                  <input value={deleteInput} onChange={e=>setDeleteInput(e.target.value)} placeholder="delete my story"
                    style={{ width:'100%', background:'rgba(180,60,60,0.05)', border:'1px solid rgba(180,60,60,0.18)', borderRadius:'8px', padding:'0.65rem 1rem', color:'var(--cream)', fontFamily:"'Cormorant Garamond',serif", fontSize:'0.95rem', outline:'none', marginBottom:'0.9rem', boxSizing:'border-box' }}
                  />
                  <div style={{ display:'flex', gap:'0.75rem' }}>
                    <button disabled={deleteInput !== 'delete my story' || deleting}
                      onClick={async () => {
                        setDeleting(true)
                        try {
                          const token = localStorage.getItem('felt_token')
                          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${token}` },
                          })
                          if (res.ok) {
                            localStorage.removeItem('felt_token')
                            localStorage.removeItem('felt_user')
                            window.location.href = '/'
                          } else {
                            console.error('Delete failed:', res.status, await res.text())
                            setDeleting(false)
                          }
                        } catch (e) {
                          console.error('Delete error:', e)
                          setDeleting(false)
                        }
                      }}
                      style={{ background:deleteInput==='delete my story'?'rgba(180,60,60,0.75)':'rgba(180,60,60,0.15)', color:'rgba(255,200,200,0.9)', border:'none', borderRadius:'8px', padding:'0.65rem 1.3rem', fontFamily:"'Cormorant Garamond',serif", fontSize:'0.85rem', cursor:deleteInput==='delete my story'?'none':'default', transition:'all 0.3s', opacity:deleting?0.6:1 }}>
                      {deleting ? 'deleting...' : 'Confirm delete'}
                    </button>
                    <button onClick={()=>{setDeleteConfirm(false);setDeleteInput('')}}
                      style={{ background:'transparent', border:'none', color:'var(--muted)', fontFamily:"'Cormorant Garamond',serif", fontSize:'0.85rem', fontStyle:'italic', cursor:'none' }}>cancel</button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}