'use client'
import dynamic from 'next/dynamic'
import Navbar from '@/components/layout/Navbar'
import Hero from '@/components/sections/Hero'
import Features from '@/components/sections/Features'
import MemorySection from '@/components/sections/MemorySection'
import QuoteSection from '@/components/sections/QuoteSection'
import Pricing from '@/components/sections/Pricing'
import Footer from '@/components/layout/Footer'

const Cursor = dynamic(() => import('@/components/ui/Cursor'), { ssr: false })
const ParticleCanvas = dynamic(() => import('@/components/ui/ParticleCanvas'), { ssr: false })

export default function HomePage() {
  return (
    <>
      <Cursor />
      <ParticleCanvas />
      <Navbar />
      <main>
        <Hero />
        <QuoteSection />
        <Features />
        <MemorySection />
        <Pricing />
      </main>
      <Footer />
    </>
  )
}