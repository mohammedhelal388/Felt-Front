'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '1.25rem 3rem',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      transition: 'all 0.4s ease',
      background: scrolled ? 'rgba(6,13,8,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(200,151,90,0.1)' : 'none',
    }}>
      <Link href="/" style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '2rem', fontWeight: 700,
        color: 'var(--gold)', letterSpacing: '0.1em',
        textDecoration: 'none',
      }}>
        felt.
      </Link>

      <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
        {['How it works', 'Pricing', 'About', 'Contact'].map(label => (
          <Link key={label} href={`#${label.toLowerCase().replace(' ', '-')}`} style={{
            color: 'var(--parchment)', textDecoration: 'none',
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.1rem', fontStyle: 'italic',
            letterSpacing: '0.05em',
            transition: 'color 0.3s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--parchment)')}
          >
            {label}
          </Link>
        ))}
        <Link href="/login" style={{
          background: 'transparent',
          border: '1px solid rgba(200,151,90,0.5)',
          color: 'var(--gold)', padding: '0.5rem 1.5rem',
          borderRadius: '2rem',
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1rem', fontStyle: 'italic',
          textDecoration: 'none',
          transition: 'all 0.3s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(200,151,90,0.1)'
          e.currentTarget.style.borderColor = 'var(--gold)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.borderColor = 'rgba(200,151,90,0.5)'
        }}
        >
          sign in
        </Link>
        <Link href="/register" style={{
          background: 'var(--gold)',
          color: 'var(--forest)', padding: '0.5rem 1.5rem',
          borderRadius: '2rem',
          fontFamily: "'Playfair Display', serif",
          fontSize: '0.95rem', fontWeight: 700,
          textDecoration: 'none',
          transition: 'all 0.3s',
          letterSpacing: '0.05em',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--copper)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--gold)'}
        >
          Start free
        </Link>
      </div>
    </nav>
  )
}
