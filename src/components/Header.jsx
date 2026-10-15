import React, { useState } from 'react';
import { Menu, X, Shield, Info, Grid } from 'lucide-react';

export default function Header({ 
  activeView, 
  onNavigateHome, 
  onOpenExhibitionInfo, 
  onOpenAdmin,
  isSupabaseOnline 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container">
        <div className="site-header-inner">
          <div 
            className="brand-title"
            onClick={onNavigateHome}
            role="button"
            tabIndex={0}
          >
            <span>Gema Belajar</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="header-nav" style={{ display: 'flex' }}>
            <span 
              className={`nav-link ${activeView === 'INDEX' ? 'active' : ''}`}
              onClick={onNavigateHome}
            >
              Galeri kelas
            </span>

            <span 
              className="nav-link"
              onClick={onOpenExhibitionInfo}
            >
              Pameran siswa
            </span>

            <button 
              className="admin-badge-btn"
              onClick={onOpenAdmin}
              title="Buka panel admin untuk mengelola kelas, karya, dan komentar"
            >
              <Shield size={14} />
              <span>Admin</span>
              {isSupabaseOnline && (
                <span 
                  style={{ 
                    width: 6, 
                    height: 6, 
                    borderRadius: '50%', 
                    backgroundColor: '#10b981',
                    marginLeft: 2 
                  }} 
                  title="Supabase Terhubung"
                />
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
