'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const Cursor = dynamic(() => import('@/components/ui/Cursor'), { ssr: false })

export default function SubscriptionSuccessPage() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    setTimeout(() => setShow(true), 200)
    const token = localStorage.getItem('felt_token')
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => {
          const u = d?.data?.data || d?.data || d
          if (u?.id) localStorage.setItem('felt_user', JSON.stringify(u))
        }).catch(() => {})
    }
  }, [])

  return (
    <>
      <Cursor />
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'var(--forest)', padding:'2rem', textAlign:'center' }}>
        <div style={{ opacity: show?1:0, transform: show?'scale(1)':'scale(0.8)', transition:'all 0.8s ease' }}>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'2rem', color:'var(--gold)', marginBottom:'1rem' }}>Your story is in full bloom</h1>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', color:'var(--muted)', fontSize:'1.05rem', marginBottom:'2.5rem', maxWidth:'420px' }}>
            Thank you for nurturing this space. Every moment from here on has room to grow into something even more beautiful.
          </p>
          <Link href="/dashboard" style={{ background:'linear-gradient(135deg,#c8975a,#dba96e)', color:'var(--forest)', padding:'0.9rem 2.4rem', borderRadius:'2rem', textDecoration:'none', fontFamily:"'Playfair Display',serif", fontWeight:700 }}>
            Return to your story
          </Link>
        </div>
      </div>
    </>
  )
}