'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const Cursor = dynamic(() => import('@/components/ui/Cursor'), { ssr: false })
const ParticleCanvas = dynamic(() => import('@/components/ui/ParticleCanvas'), { ssr: false })

function spawnGlitter(x: number, y: number) {
  const colors = ['#c8975a','#dba96e','#f5f0e8','#7cb987','#ffe8a0']
  for (let i = 0; i < 5; i++) {
    const el = document.createElement('div')
    const angle = Math.random() * Math.PI * 2
    const dist = 15 + Math.random() * 30
    const size = 1.5 + Math.random() * 3
    const dur = 0.4 + Math.random() * 0.4
    const col = colors[Math.floor(Math.random() * colors.length)]
    el.style.cssText = `position:fixed;border-radius:50%;pointer-events:none;z-index:9999;left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${col};transform:translate(-50%,-50%);opacity:0.9;box-shadow:0 0 ${size*2}px ${col};transition:transform ${dur}s ease-out,opacity ${dur}s ease-out;`
    document.body.appendChild(el)
    const tx = Math.cos(angle)*dist, ty = Math.sin(angle)*dist - 12
    requestAnimationFrame(()=>requestAnimationFrame(()=>{el.style.transform=`translate(calc(-50% + ${tx}px),calc(-50% + ${ty}px))`;el.style.opacity='0'}))
    setTimeout(()=>el.remove(), dur*1000+100)
  }
}

export default function NewMomentPage() {
  const [step, setStep] = useState<'form'|'generating'|'done'>('form')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhoto(file)
    const reader = new FileReader()
    reader.onload = ev => setPhotoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    const el = e.currentTarget as HTMLElement
    const r = el.getBoundingClientRect()
    spawnGlitter(r.left + Math.random() * r.width, r.top + r.height * 0.5)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) { setError('Tell us what you felt'); return }
    setStep('generating'); setError('')
    const token = localStorage.getItem('felt_token')
    try {
      const form = new FormData()
      form.append('description', description)
      if (location) form.append('location', location)
      if (photo) form.append('frontPhoto', photo)
      const res = await fetch('http://localhost:3000/api/v1/moments', {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message?.message || 'Failed to create moment')
      
      const momentId = data.data?.id
      if (!momentId) throw new Error('No moment ID returned')

      // Auto-trigger AI generation
      await fetch(`http://localhost:3000/api/v1/moments/${momentId}/generate`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      })

      // Poll for completion (max 30s)
      let generated = data.data
      for (let i = 0; i < 15; i++) {
        await new Promise(r => setTimeout(r, 2000))
        const poll = await fetch(`http://localhost:3000/api/v1/moments/${momentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const pollData = await poll.json()
        if (pollData.data?.isGenerated) { generated = pollData.data; break }
      }

      setResult(generated); setStep('done')
    } catch (err: any) { setError(err.message); setStep('form') }
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '1rem 1.5rem',
    background: 'rgba(6,13,8,0.6)', borderRadius: '10px',
    color: 'var(--cream)', fontFamily: "'Cormorant Garamond',serif",
    fontSize: '1.1rem', outline: 'none', transition: 'all 0.3s',
    resize: 'none' as any,
  }

  return (
    <>
      <Cursor /><ParticleCanvas />
      <style>{`@keyframes riseIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ minHeight:'100vh', position:'relative', zIndex:2 }}>
        <nav style={{ padding:'1.2rem 3rem', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid rgba(200,151,90,0.08)', background:'rgba(6,13,8,0.92)', backdropFilter:'blur(20px)', position:'sticky', top:0, zIndex:100 }}>
          <Link href="/" style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.8rem', color:'var(--gold)', textDecoration:'none' }}>felt.</Link>
          <Link href="/dashboard" style={{ color:'var(--muted)', fontStyle:'italic', fontFamily:"'Cormorant Garamond',serif", textDecoration:'none', fontSize:'0.9rem', transition:'color 0.3s' }}
            onMouseEnter={e=>e.currentTarget.style.color='var(--gold)'}
            onMouseLeave={e=>e.currentTarget.style.color='var(--muted)'}
          >← your story</Link>
        </nav>

        <div style={{ maxWidth:'620px', margin:'0 auto', padding:'5rem 2rem' }}>

          {step === 'generating' && (
            <div style={{ textAlign:'center', padding:'6rem', animation:'riseIn 0.8s ease both' }}>
              <p style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.5rem', marginBottom:'1rem', animation:'pulse 2s ease-in-out infinite' }}>Feeling your moment...</p>
              <p style={{ color:'var(--muted)', fontStyle:'italic', fontFamily:"'Cormorant Garamond',serif" }}>AI is reading your emotion and giving it language</p>
            </div>
          )}

          {step === 'done' && result && (
            <div style={{ animation:'riseIn 0.9s ease both' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'2rem' }}>
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'var(--gold)', boxShadow:'0 0 10px var(--gold)' }} />
                <span style={{ fontSize:'0.7rem', letterSpacing:'0.3em', color:'var(--gold)', textTransform:'uppercase', fontFamily:"'Cormorant Garamond',serif" }}>
                  moment captured
                </span>
              </div>
              {result.frontPhotoUrl && (
                <div style={{ borderRadius:'16px', overflow:'hidden', marginBottom:'2.5rem', boxShadow:'0 20px 60px rgba(0,0,0,0.4)' }}>
                  <img src={result.frontPhotoUrl} alt="" style={{ width:'100%', maxHeight:'360px', objectFit:'cover', display:'block' }} />
                </div>
              )}
              {result.poeticText && (
                <div style={{ marginBottom:'3rem' }}>
                  {result.poeticText.split('. ').filter(Boolean).map((line: string, i: number) => (
                    <p key={i} style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontSize:'1.3rem', color:i===2?'var(--gold)':'var(--cream)', lineHeight:1.8, marginBottom:'0.4rem', opacity:0, animation:`riseIn 1s ease ${i*400}ms forwards` }}>
                      {line}{i < result.poeticText.split('. ').length - 1 ? '.' : ''}
                    </p>
                  ))}
                </div>
              )}
              <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
                <Link href={`/moments/${result.id}`} style={{ background:'var(--gold)', color:'var(--forest)', padding:'0.9rem 2rem', borderRadius:'2rem', textDecoration:'none', fontFamily:"'Playfair Display',serif", fontWeight:700 }}>View this moment</Link>
                <Link href="/dashboard" style={{ background:'transparent', border:'1px solid rgba(200,151,90,0.2)', color:'var(--muted)', padding:'0.9rem 2rem', borderRadius:'2rem', textDecoration:'none', fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', transition:'all 0.3s' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--gold)';e.currentTarget.style.color='var(--gold)'}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(200,151,90,0.2)';e.currentTarget.style.color='var(--muted)'}}
                >Back to your story</Link>
              </div>
            </div>
          )}

          {step === 'form' && (
            <div style={{ animation:'riseIn 0.8s ease both' }}>
              <p style={{ color:'var(--muted)', fontStyle:'italic', marginBottom:'0.5rem', fontFamily:"'Cormorant Garamond',serif" }}>a new memory</p>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.8rem,3vw,2.5rem)', fontWeight:400, marginBottom:'3rem' }}>
                What did you <em style={{ color:'var(--gold)' }}>feel?</em>
              </h1>

              {error && <div style={{ background:'rgba(180,60,60,0.15)', border:'1px solid rgba(180,60,60,0.3)', borderRadius:'8px', padding:'0.75rem 1rem', color:'#f08080', marginBottom:'1.5rem', textAlign:'center' }}>{error}</div>}

              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'2rem' }}>

                {/* photo upload */}
                <div>
                  <label style={{ display:'block', fontSize:'0.72rem', letterSpacing:'0.2em', color:'var(--muted)', textTransform:'uppercase', marginBottom:'0.75rem', fontFamily:"'Cormorant Garamond',serif" }}>Photo</label>
                  {photoPreview ? (
                    <div style={{ position:'relative', borderRadius:'12px', overflow:'hidden', cursor:'none' }} onClick={() => fileRef.current?.click()}>
                      <img src={photoPreview} alt="" style={{ width:'100%', height:'220px', objectFit:'cover', display:'block' }} />
                      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', opacity:0, transition:'opacity 0.3s' }}
                        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.opacity='1'}
                        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.opacity='0'}
                      >
                        <span style={{ color:'white', fontStyle:'italic', fontFamily:"'Playfair Display',serif" }}>change photo</span>
                      </div>
                    </div>
                  ) : (
                    <div onClick={() => fileRef.current?.click()} style={{ border:'1px dashed rgba(200,151,90,0.2)', borderRadius:'12px', padding:'3rem', textAlign:'center', cursor:'none', transition:'all 0.3s' }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(200,151,90,0.5)';e.currentTarget.style.background='rgba(200,151,90,0.03)'}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(200,151,90,0.2)';e.currentTarget.style.background='transparent'}}
                    >
                      <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', color:'var(--muted)', marginBottom:'0.5rem' }}>add a photo</p>
                      <p style={{ color:'rgba(107,138,114,0.4)', fontSize:'0.8rem', fontStyle:'italic', fontFamily:"'Cormorant Garamond',serif" }}>the moment you want to feel again</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display:'none' }} />
                </div>

                {/* feeling */}
                <div>
                  <label style={{ display:'block', fontSize:'0.72rem', letterSpacing:'0.2em', color:focused==='desc'?'var(--gold)':'var(--muted)', textTransform:'uppercase', marginBottom:'0.75rem', fontFamily:"'Cormorant Garamond',serif", transition:'color 0.3s' }}>What you felt</label>
                  <textarea ref={textRef} value={description} onChange={e=>{setDescription(e.target.value);handleKey(e as any)}}
                    onFocus={()=>setFocused('desc')} onBlur={()=>setFocused('')}
                    placeholder="Speak what you feel. The mountain at sunset. The way she laughed. The exact shade of peace..."
                    rows={5} style={{ ...inp, border:`1px solid ${focused==='desc'?'rgba(200,151,90,0.5)':'rgba(200,151,90,0.15)'}`, boxShadow:focused==='desc'?'0 0 20px rgba(200,151,90,0.08)':'none' }}
                  />
                </div>

                {/* location */}
                <div>
                  <label style={{ display:'block', fontSize:'0.72rem', letterSpacing:'0.2em', color:focused==='loc'?'var(--gold)':'var(--muted)', textTransform:'uppercase', marginBottom:'0.5rem', fontFamily:"'Cormorant Garamond',serif", transition:'color 0.3s' }}>Location <span style={{ opacity:0.4 }}>(optional)</span></label>
                  <input type="text" value={location} onChange={e=>{setLocation(e.target.value);handleKey(e as any)}}
                    onFocus={()=>setFocused('loc')} onBlur={()=>setFocused('')}
                    placeholder="Turkey · Mountain Summit"
                    style={{ ...inp, border:`1px solid ${focused==='loc'?'rgba(200,151,90,0.5)':'rgba(200,151,90,0.15)'}`, boxShadow:focused==='loc'?'0 0 20px rgba(200,151,90,0.08)':'none' }}
                  />
                </div>

                <button type="submit" style={{ background:'var(--gold)', color:'var(--forest)', padding:'1.1rem', border:'none', borderRadius:'12px', fontFamily:"'Playfair Display',serif", fontSize:'1.1rem', fontWeight:700, transition:'all 0.3s', cursor:'none', letterSpacing:'0.05em' }}
                  onMouseEnter={e=>{e.currentTarget.style.background='var(--copper)';e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(200,151,90,0.3)'}}
                  onMouseLeave={e=>{e.currentTarget.style.background='var(--gold)';e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none'}}
                >Feel this moment</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  )
}