'use client'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const Cursor = dynamic(() => import('@/components/ui/Cursor'), { ssr: false })

export default function SubscriptionCancelPage() {
  return (
    <>
      <Cursor />
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'var(--forest)', padding:'2rem', textAlign:'center' }}>
        <p style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.7rem', color:'var(--cream)', marginBottom:'1rem' }}>No worries</p>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', color:'var(--muted)', fontSize:'1rem', marginBottom:'2.5rem', maxWidth:'380px' }}>
          Your seedling is still growing at its own pace. You can return to this whenever you're ready.
        </p>
        <Link href="/subscription" style={{ color:'var(--gold)', fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', textDecoration:'none' }}>
          ← back to plans
        </Link>
      </div>
    </>
  )
}