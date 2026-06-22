import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface Props {
  screenshots: string[]
}

export default function ScreenshotGallery({ screenshots }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  if (!screenshots.length) return null

  const prev = () =>
    setLightbox((i) => (i !== null ? (i - 1 + screenshots.length) % screenshots.length : null))
  const next = () =>
    setLightbox((i) => (i !== null ? (i + 1) % screenshots.length : null))

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 10,
        }}
      >
        {screenshots.map((src, i) => (
          <button
            key={i}
            onClick={() => setLightbox(i)}
            style={{
              padding: 0,
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              cursor: 'zoom-in',
              background: 'none',
              aspectRatio: '16/9',
            }}
          >
            <img
              src={src}
              alt={`Screenshot ${i + 1}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </button>
        ))}
      </div>

      {lightbox !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(null) }}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>

          {screenshots.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                style={{
                  position: 'absolute',
                  left: 20,
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 44,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                style={{
                  position: 'absolute',
                  right: 20,
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 44,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          <img
            src={screenshots[lightbox]}
            alt={`Screenshot ${lightbox + 1}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '85vh',
              objectFit: 'contain',
              borderRadius: 'var(--radius-md)',
            }}
          />

          <div
            style={{
              position: 'absolute',
              bottom: 20,
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.82rem',
            }}
          >
            {lightbox + 1} / {screenshots.length}
          </div>
        </div>
      )}
    </>
  )
}
