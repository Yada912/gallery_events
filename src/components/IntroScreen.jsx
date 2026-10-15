import React, { useEffect, useState } from 'react';

export default function IntroScreen({ onComplete }) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    // 2-second automatic timeout as specified in the Figma design note
    const timer = setTimeout(() => {
      handleClose();
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      onComplete();
    }, 350);
  };

  return (
    <div 
      className="intro-overlay"
      style={{
        opacity: closing ? 0 : 1,
        transition: 'opacity 0.35s ease-out'
      }}
      onClick={handleClose}
      title="Klik untuk langsung masuk ke indeks kelas"
    >
      <div className="intro-masthead">
        <div>PAMERAN SISWA</div>
        <div style={{ fontWeight: 600, letterSpacing: '0.12em' }}>SMAS KRISTEN HARAPAN</div>
        <div>Ragam sudut pandang</div>
      </div>

      <div className="intro-center">
        <div className="intro-eyebrow">Proyek Kokulikuler</div>
        <h1 className="intro-headline">Gema Belajar</h1>
        <p className="intro-descriptor">
          Belajar dari Penglipuran: <strong>Menjelajah, Meneliti, Berkarya, dan Berbagi</strong>
        </p>
      </div>

      <div className="intro-footer">
        <div>Selamat datang di pameran</div>
        <button 
          className="intro-skip-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
        >
          Masuk sekarang &rarr;
        </button>
      </div>
    </div>
  );
}
