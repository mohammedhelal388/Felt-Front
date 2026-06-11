'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const Cursor = dynamic(() => import('@/components/ui/Cursor'), { ssr: false })
const ParticleCanvas = dynamic(() => import('@/components/ui/ParticleCanvas'), { ssr: false })

export default function SharePage({ params }: { params: { token: string } }) {
  const [moment, setMoment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`http://localhost:3000/api/v1/moments/public/${params.token}`)
      .then(r => r.json())
      .then(d => {
        if (d.data) setMoment(d.data)
        else setError('This moment has been removed or the link has expired.')
        setLoading(false)
      })
      .catch(() => { setError('Could not load this moment.'); setLoading(false) })
  }, [params.token])

  return (
    <>
      <Cursor />
      <ParticleCanvas />
      <div style={{
        minHeight: '100vh', display: 'flex',
        flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '2rem',
        position: 'relative', zIndex: 2,
      }}>
        <Link href="/" style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '2rem', color: 'var(--gold)',
          textDecoration: 'none', marginBottom: '3rem',
        }}>
          felt.
        </Link>

        {loading && (
          <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Opening this memory...</p>
        )}

        {error && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--muted)', fontStyle: 'italic', marginBottom: '2rem' }}>{error}</p>
            <Link href="/" style={{ color: 'var(--gold)', textDecoration: 'none', fontStyle: 'italic' }}>
              Return home
            </Link>
          </div>
        )}

        {moment && (
          <div style={{
            maxWidth: '580px', width: '100%',
            background: 'rgba(15,31,18,0.85)',
            border: '1px solid rgba(200,151,90,0.3)',
            borderRadius: '24px', overflow: 'hidden',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 0 40px rgba(200,151,90,0.05)',
          }}>
            {moment.frontPhotoUrl && (
              <img
                src={moment.frontPhotoUrl} alt=""
                style={{ width: '100%', height: '320px', objectFit: 'cover' }}
              />
            )}
            <div style={{ padding: '2.5rem' }}>
              <p style={{ fontSize: '0.7rem', letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '1rem' }}>
                {moment.emotionWord} · {moment.location}
              </p>
              {moment.poeticText && (
                <p style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.3rem', fontStyle: 'italic',
                  color: 'var(--cream)', lineHeight: 1.7,
                  marginBottom: '1.5rem',
                }}>
                  "{moment.poeticText}"
                </p>
              )}
              <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                {new Date(moment.capturedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              <div style={{
                marginTop: '2rem', paddingTop: '2rem',
                borderTop: '1px solid rgba(200,151,90,0.1)',
                textAlign: 'center',
              }}>
                <p style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: '0.95rem', marginBottom: '1rem' }}>
                  Capture your own moments with Felt
                </p>
                <Link href="/register" style={{
                  background: 'var(--gold)', color: 'var(--forest)',
                  padding: '0.75rem 2rem', borderRadius: '2rem',
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '0.95rem', fontWeight: 700,
                  textDecoration: 'none',
                }}>
                  Begin your story
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
