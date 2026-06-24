'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'

const Cursor = dynamic(() => import('@/components/ui/Cursor'), { ssr: false })
const ParticleCanvas = dynamic(() => import('@/components/ui/ParticleCanvas'), { ssr: false })

function normalize(raw: any) {
  if (!raw) return null
  return {
    ...raw,
    id: raw.id,
    emotionWord: raw.emotionWord || raw.emotion_word || raw.emotion || raw.emotionLabel || '',
    location: raw.location || raw.locationName || raw.place || '',
    poeticText: raw.poeticText || raw.poetic_text || raw.generatedText || raw.generated_text || raw.text || '',
    frontPhotoUrl: raw.frontPhotoUrl || raw.front_photo_url || raw.photoUrl || raw.photo_url || raw.imageUrl || raw.image_url || '',
    isGenerated: raw.isGenerated ?? raw.is_generated ?? false,
    capturedAt: raw.capturedAt || raw.captured_at || raw.createdAt || raw.created_at || new Date().toISOString(),
    description: raw.description || raw.userDescription || raw.user_description || raw.userInput || '',
  }
}

function ShareButton({ momentId }: { momentId: string }) {
  const [state, setState] = useState<'idle'|'loading'|'copied'|'limit'>('idle')
  const [limitMsg, setLimitMsg] = useState('')

  const share = async () => {
    setState('loading')
    setLimitMsg('')
    try {
      const token = localStorage.getItem('felt_token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shares/moments/${momentId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      const json = await res.json()

      // FREE plan monthly share limit reached
      if (res.status === 403) {
        const msg = json?.message?.message || json?.message || "You've reached your monthly share limit."
        setLimitMsg(msg)
        setState('limit')
        return
      }

      const data = json?.data?.data || json?.data || json
      const token2 = data?.publicToken
      if (token2) {
        const url = `${window.location.origin}/share/${token2}`
        await navigator.clipboard.writeText(url)
        setState('copied')
        setTimeout(() => setState('idle'), 2500)
      } else {
        console.error('Share failed — no token in response:', json)
        setState('idle')
      }
    } catch (e) { console.error('Share error:', e); setState('idle') }
  }

  if (state === 'limit') {
    return (
      <div style={{ display:'flex', alignItems:'center', gap:'0.9rem', flexWrap:'wrap' }}>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontSize:'0.9rem', color:'var(--gold)' }}>{limitMsg}</p>
        <Link href="/subscription" style={{ background:'linear-gradient(135deg,#c8975a,#dba96e)', color:'var(--forest)', padding:'0.6rem 1.4rem', borderRadius:'2rem', textDecoration:'none', fontFamily:"'Playfair Display',serif", fontSize:'0.82rem', fontWeight:700 }}>
          Upgrade ✦
        </Link>
        <button onClick={()=>setState('idle')} style={{ background:'transparent', border:'none', color:'var(--muted)', fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontSize:'0.82rem', cursor:'none' }}>dismiss</button>
      </div>
    )
  }

  return (
    <button onClick={share} disabled={state==='loading'} style={{ background:'transparent', border:'1px solid rgba(200,151,90,0.2)', color:'var(--muted)', padding:'0.8rem 2rem', borderRadius:'2rem', fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', transition:'all 0.3s', cursor:'none' }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--gold)';e.currentTarget.style.color='var(--gold)'}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(200,151,90,0.2)';e.currentTarget.style.color='var(--muted)'}}
    >
      {state==='idle' && '↗ share'}
      {state==='loading' && 'creating link...'}
      {state==='copied' && '✓ link copied'}
    </button>
  )
}

export default function MomentPage() {
  const params = useParams()
  const id = params?.id
  const [moment, setMoment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [textVisible, setTextVisible] = useState(false)
  const [rawData, setRawData] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('felt_token')
    if (!token) { window.location.href = '/login'; return }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/moments/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        setRawData(d)
        const raw = d.data || d
        setMoment(normalize(raw))
        setLoading(false)
        setTimeout(() => setTextVisible(true), 400)
      }).catch(err => { console.error(err); setLoading(false) })
  }, [id])

  const generateAI = async () => {
    const token = localStorage.getItem('felt_token')
    setGenerating(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/moments/${id}/generate`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      const raw = data.data || data
      if (raw) { setMoment(normalize(raw)); setTextVisible(false); setTimeout(() => setTextVisible(true), 100) }
    } catch (e) { console.error(e) }
    finally { setGenerating(false) }
  }

  const emotionColors: Record<string, string> = {
    nostalgic: '#7ca4c0', belonging: '#7cb987', wonder: '#c8975a', peace: '#8fa897',
    joy: '#dba96e', melancholy: '#8878a0', awe: '#c8a855', love: '#c87878',
    excited: '#dba96e', sky: '#7ca4c0', sad: '#8878a0', happy: '#dba96e', angry: '#c87878',
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'var(--muted)', fontStyle:'italic', fontFamily:"'Playfair Display',serif", animation:'pulse 2s ease-in-out infinite' }}>Opening this memory...</p>
    </div>
  )

  if (!moment) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'1rem' }}>
      <p style={{ color:'var(--muted)', fontStyle:'italic' }}>Memory not found.</p>
      <Link href="/dashboard" style={{ color:'var(--gold)' }}>← back to dashboard</Link>
    </div>
  )

  const ec = emotionColors[moment.emotionWord?.toLowerCase()] || '#c8975a'
  const lines = moment.poeticText
    ? moment.poeticText.split(/[.!?]+/).map((s: string) => s.trim()).filter(Boolean)
    : []

  return (
    <>
      <Cursor /><ParticleCanvas />
      <style>{`@keyframes lineIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes photoIn{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}`}</style>

      <div style={{ minHeight:'100vh', position:'relative', zIndex:2 }}>
        <nav style={{ padding:'1.2rem 3rem', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid rgba(200,151,90,0.08)', background:'rgba(6,13,8,0.92)', backdropFilter:'blur(20px)', position:'sticky', top:0, zIndex:100 }}>
          <Link href="/" style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.8rem', color:'var(--gold)', textDecoration:'none' }}>felt.</Link>
          <Link href="/dashboard" style={{ color:'var(--muted)', fontStyle:'italic', fontFamily:"'Cormorant Garamond',serif", textDecoration:'none', fontSize:'0.9rem', transition:'color 0.3s' }}
            onMouseEnter={e=>e.currentTarget.style.color='var(--gold)'}
            onMouseLeave={e=>e.currentTarget.style.color='var(--muted)'}
          >← your story</Link>
        </nav>

        <div style={{ maxWidth:'900px', margin:'0 auto', padding:'5rem 3rem' }}>

          {/* emotion badge */}
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'2rem', animation:'lineIn 0.8s ease 0.1s both' }}>
            <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:ec, boxShadow:`0 0 10px ${ec}` }} />
            <span style={{ fontSize:'0.7rem', letterSpacing:'0.3em', color:ec, textTransform:'uppercase', fontFamily:"'Cormorant Garamond',serif" }}>
              {moment.emotionWord || 'moment'}{moment.location ? ` · ${moment.location}` : ''}
            </span>
            <span style={{ fontSize:'0.7rem', color:'var(--muted)', fontStyle:'italic', fontFamily:"'Cormorant Garamond',serif" }}>
              · {new Date(moment.capturedAt).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })}
            </span>
          </div>

          {/* photo */}
          {moment.frontPhotoUrl && (
            <div style={{ borderRadius:'20px', overflow:'hidden', marginBottom:'3.5rem', animation:'photoIn 1s ease 0.2s both', boxShadow:`0 30px 80px rgba(0,0,0,0.5), 0 0 60px ${ec}18` }}>
              <img src={moment.frontPhotoUrl} alt="" style={{ width:'100%', maxHeight:'480px', objectFit:'cover', display:'block' }} />
            </div>
          )}

          {/* user's original feeling */}
          {moment.description && (
            <div style={{ marginBottom:'2.5rem', padding:'1.5rem 2rem', background:'rgba(10,20,12,0.5)', border:'1px solid rgba(200,151,90,0.08)', borderRadius:'12px', animation:'lineIn 0.8s ease 0.3s both' }}>
              <p style={{ fontSize:'0.65rem', letterSpacing:'0.2em', color:'var(--muted)', textTransform:'uppercase', marginBottom:'0.5rem', fontFamily:"'Cormorant Garamond',serif" }}>what you felt</p>
              <p style={{ color:'var(--parchment)', fontStyle:'italic', lineHeight:1.8, fontFamily:"'Cormorant Garamond',serif", fontSize:'1rem' }}>{moment.description}</p>
            </div>
          )}

          {/* poetic text */}
          {lines.length > 0 ? (
            <div style={{ marginBottom:'4rem' }}>
              <p style={{ fontSize:'0.65rem', letterSpacing:'0.2em', color:'rgba(200,151,90,0.4)', textTransform:'uppercase', marginBottom:'1.5rem', fontFamily:"'Cormorant Garamond',serif", animation:'lineIn 0.8s ease 0.4s both' }}>felt by ai</p>
              {lines.map((line: string, i: number) => (
                <p key={i} style={{
                  fontFamily:"'Playfair Display',serif", fontStyle:'italic',
                  fontSize:'clamp(1.1rem,2.5vw,1.5rem)',
                  color: i === Math.floor(lines.length/2) ? ec : 'var(--cream)',
                  lineHeight:1.9, marginBottom:'0.4rem',
                  opacity: textVisible ? 1 : 0,
                  transform: textVisible ? 'translateY(0)' : 'translateY(16px)',
                  transition: `opacity 1.2s ease ${i*280}ms, transform 1.2s ease ${i*280}ms`,
                }}>
                  {line}.
                </p>
              ))}
            </div>
          ) : (
            <div style={{ textAlign:'center', padding:'4rem 2rem', border:'1px dashed rgba(200,151,90,0.15)', borderRadius:'16px', marginBottom:'3rem', animation:'lineIn 0.8s ease 0.4s both' }}>
              <p style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.3rem', marginBottom:'1rem', fontWeight:400 }}>This moment hasn't been felt yet</p>
              <p style={{ color:'var(--muted)', fontStyle:'italic', marginBottom:'2rem', fontFamily:"'Cormorant Garamond',serif" }}>Let AI read the emotion and bring it to life</p>
              <button onClick={generateAI} disabled={generating} style={{ background:'var(--gold)', color:'var(--forest)', padding:'0.9rem 2.5rem', borderRadius:'2rem', border:'none', fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:'1rem', transition:'all 0.3s', cursor:'none' }}
                onMouseEnter={e=>{if(!generating){e.currentTarget.style.background='var(--copper)';e.currentTarget.style.transform='translateY(-2px)'}}}
                onMouseLeave={e=>{if(!generating){e.currentTarget.style.background='var(--gold)';e.currentTarget.style.transform='translateY(0)'}}}
              >{generating ? 'Feeling it...' : 'Feel this moment'}</button>
            </div>
          )}

          {/* actions */}
          <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', alignItems:'center', animation:'lineIn 0.8s ease 0.8s both' }}>
            {moment.poeticText && (
              <button onClick={generateAI} disabled={generating} style={{ background:'transparent', border:'1px solid rgba(200,151,90,0.2)', color:'var(--muted)', padding:'0.8rem 2rem', borderRadius:'2rem', fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', transition:'all 0.3s', cursor:'none' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--gold)';e.currentTarget.style.color='var(--gold)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(200,151,90,0.2)';e.currentTarget.style.color='var(--muted)'}}
              >{generating ? 'Regenerating...' : 'Regenerate'}</button>
            )}
            <ShareButton momentId={id as string} />
            <Link href="/dashboard" style={{ background:'transparent', border:'1px solid rgba(200,151,90,0.15)', color:'var(--muted)', padding:'0.8rem 2rem', borderRadius:'2rem', textDecoration:'none', fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', transition:'all 0.3s' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--gold)';e.currentTarget.style.color='var(--gold)'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(200,151,90,0.15)';e.currentTarget.style.color='var(--muted)'}}
            >← back to your story</Link>
          </div>
        </div>
      </div>
    </>
  )
}