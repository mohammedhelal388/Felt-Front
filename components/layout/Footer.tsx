import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{
      padding: '5rem 4rem 3rem',
      borderTop: '1px solid rgba(245,240,232,0.06)',
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', flexWrap: 'wrap', gap: '2rem',
      position: 'relative', zIndex: 2,
    }}>
      <div>
        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.8rem', color: 'var(--gold)',
          marginBottom: '0.5rem',
        }}>felt.</p>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
          capture how it felt, not just how it looked
        </p>
      </div>

      <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
        {['Home', 'About', 'Pricing', 'Contact', 'Privacy', 'Terms'].map(label => (
          <Link key={label} href={`/${label.toLowerCase()}`} style={{
            color: 'var(--muted)', textDecoration: 'none',
            fontSize: '0.9rem', fontStyle: 'italic',
            transition: 'color 0.3s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
          >
            {label}
          </Link>
        ))}
      </div>

      <p style={{ color: 'var(--muted)', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
        © 2026 felt. all memories reserved.
      </p>
    </footer>
  )
}
