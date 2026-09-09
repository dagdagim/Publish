import React, { useState } from 'react';

// Smartphone Device Frame
export function PhoneMockup({ src, title = 'App Screen', alt = '', width = 230, style = {} }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      style={{
        width: `${width}px`,
        aspectRatio: '9 / 19',
        borderRadius: '34px',
        padding: '10px',
        background: '#0F172A',
        boxShadow: '0 20px 35px -5px rgba(15, 23, 42, 0.22), 0 0 0 1px #334155',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        ...style
      }}
    >
      {/* Top Speaker & Camera Notch */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '64px',
        height: '14px',
        backgroundColor: '#0F172A',
        borderRadius: '8px',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px'
      }}>
        <div style={{ width: '28px', height: '3px', backgroundColor: '#334155', borderRadius: '2px' }} />
        <div style={{ width: '5px', height: '5px', backgroundColor: '#1E293B', borderRadius: '50%' }} />
      </div>

      {/* Screen container */}
      <div style={{
        width: '100%',
        height: '100%',
        borderRadius: '26px',
        overflow: 'hidden',
        backgroundColor: '#052E16',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {!hasError ? (
          <img
            src={src}
            alt={alt || title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={() => setHasError(true)}
          />
        ) : (
          /* High quality inline fallback if asset fails */
          <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(180deg, #15803D 0%, #052E16 100%)',
            padding: '36px 16px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: '#FFFFFF',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '10px', letterSpacing: '1px', color: '#86EFAC', fontWeight: '700', marginBottom: '8px' }}>9:41</div>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#FFFFFF', margin: '14px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '32px' }}>⚽</span>
              </div>
              <div style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>Football Quiz</div>
              <div style={{ fontSize: '11px', color: '#A7F3D0' }}>World Tournaments &amp; Legends</div>
            </div>
            <div style={{
              backgroundColor: '#22C55E',
              color: '#052E16',
              fontWeight: '800',
              fontSize: '13px',
              padding: '10px',
              borderRadius: '12px',
              letterSpacing: '0.5px'
            }}>
              PLAY GAME
            </div>
          </div>
        )}
      </div>

      {/* Bottom Home Indicator */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '70px',
        height: '4px',
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: '2px',
        pointerEvents: 'none'
      }} />
    </div>
  );
}

// Laptop / Desktop Device Frame
export function LaptopMockup({ src, title = 'Web App Preview', width = 420, style = {} }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      style={{
        width: `${width}px`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        ...style
      }}
    >
      {/* Screen lid */}
      <div style={{
        width: '100%',
        aspectRatio: '16 / 10',
        backgroundColor: '#0F172A',
        borderRadius: '14px 14px 0 0',
        padding: '10px 10px 0 10px',
        boxShadow: '0 20px 30px -10px rgba(15, 23, 42, 0.2)',
        position: 'relative'
      }}>
        {/* Camera pip */}
        <div style={{
          position: 'absolute',
          top: '5px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '5px',
          height: '5px',
          backgroundColor: '#334155',
          borderRadius: '50%'
        }} />

        {/* Display screen */}
        <div style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#F8FAFC',
          borderRadius: '6px 6px 0 0',
          overflow: 'hidden',
          border: '1px solid #1E293B'
        }}>
          {!hasError ? (
            <img
              src={src}
              alt={title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={() => setHasError(true)}
            />
          ) : (
            /* High quality inline fallback if asset fails */
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#F8FAFC',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E2E8F0'
              }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A' }}>East Valley Agricultural Cluster</span>
                <span style={{ fontSize: '10px', backgroundColor: '#DCFCE7', color: '#16A34A', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>Optimal</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>Soil Moisture &amp; Health</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#16A34A', marginTop: '2px' }}>34.2%</div>
                  <div style={{ fontSize: '9px', color: '#94A3B8' }}>Irrigation: 06:00 AM</div>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>Marketplace Volume</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#2563EB', marginTop: '2px' }}>4,200 KG</div>
                  <div style={{ fontSize: '9px', color: '#94A3B8' }}>Arabica Lot #4</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Laptop base */}
      <div style={{
        width: '112%',
        height: '12px',
        backgroundColor: '#E2E8F0',
        borderRadius: '0 0 12px 12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center'
      }}>
        {/* Notch opener */}
        <div style={{
          width: '48px',
          height: '4px',
          backgroundColor: '#CBD5E1',
          borderRadius: '0 0 4px 4px'
        }} />
      </div>
    </div>
  );
}
