import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { catalogApi } from '@oaksol/api-client';
import { Icons } from '../icons';

export const Header: React.FC = () => {
  const { cartCount, setCartOpen } = useCart();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [shop, setShop] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const data = await catalogApi.getCategories();
        setCategories(data || []);

        const homeData = await catalogApi.getHomepage();
        setShop(homeData.shop || null);
      } catch (err: any) {
        console.error('Failed to load categories in header:', err);
        const isMissingTenant = err.status === 404 || (err.message && (err.message.includes('Store domain mapping') || err.message.includes('Tenant-Domain')));
        if (isMissingTenant) {
          const host = window.location.host;
          const protocol = window.location.protocol;
          if (host.includes('localhost') || host.includes('127.0.0.1')) {
            const port = host.split(':')[1] ? `:${host.split(':')[1]}` : '';
            window.location.href = `${protocol}//localhost${port}`;
          } else {
            const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'posix.digital';
            window.location.href = `${protocol}//${platformDomain}`;
          }
        }
      }
    };
    fetchHeaderData();
  }, []);

  // Only root-level categories that should show in nav
  const menuCategories = categories.filter((cat: any) => cat.show_in_menu !== false);

  const goTo = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  return (
    <header className="site-header">
      <div className="header-container">
        {/* Left: Brand */}
        <div className="logo-area" onClick={() => goTo('/')}>
          <span className="brand-name">{shop?.name || 'STOREFRONT'}</span>
          <span className="brand-tag">Pure Botanical</span>
        </div>

        {/* Center: Nav with dropdown subcategories */}
        <nav className="site-nav" onMouseLeave={() => setOpenDropdown(null)}>
          <span onClick={() => goTo('/')}>Home</span>
          <span onClick={() => goTo('/categories')}>All Categories</span>

          {menuCategories.map((cat: any) => {
            const subs = (cat.children || []).filter((s: any) => s.show_in_menu !== false);
            const hasDropdown = subs.length > 0;

            return (
              <div
                key={cat.id}
                className={`nav-item-wrap ${hasDropdown ? 'has-dropdown' : ''}`}
                onMouseEnter={() => hasDropdown && setOpenDropdown(cat.id)}
              >
                <span
                  className={openDropdown === cat.id ? 'active' : ''}
                  onClick={() => goTo(`/categories/${cat.slug}`)}
                >
                  {cat.name}
                  {hasDropdown && <Icons.ChevronDown />}
                </span>

                {hasDropdown && openDropdown === cat.id && (
                  <div className="nav-dropdown">
                    <div className="nav-dropdown-header" onClick={() => goTo(`/categories/${cat.slug}`)}>
                      <strong>All {cat.name}</strong>
                      <span className="view-all-link">View All →</span>
                    </div>
                    <div className="nav-dropdown-divider" />
                    <div className="nav-dropdown-grid">
                      {subs.map((sub: any) => (
                        <div
                          key={sub.id}
                          className="nav-dropdown-item"
                          onClick={() => goTo(`/categories/${sub.slug}`)}
                        >
                          <span className="sub-dot">●</span>
                          {sub.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right: Cart + Mobile Toggle */}
        <div className="header-actions">
          <div className="cart-trigger-icon" onClick={() => { setCartOpen(true); setMobileMenuOpen(false); }}>
            <span className="cart-bag-symbol">🛒</span>
            {cartCount > 0 && <span className="cart-badge-count">{cartCount}</span>}
          </div>
          <button
            className={`mobile-menu-toggle ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <nav className="mobile-nav-links">
          <span onClick={() => goTo('/')}>Home</span>
          <span onClick={() => goTo('/categories')}>All Categories</span>

          {menuCategories.map((cat: any) => {
            const subs = (cat.children || []).filter((s: any) => s.show_in_menu !== false);
            const isExpanded = mobileExpanded === cat.id;

            return (
              <div key={cat.id} className="mobile-cat-group">
                <div className="mobile-cat-header">
                  <span onClick={() => goTo(`/categories/${cat.slug}`)}>
                    {cat.name}
                  </span>
                  {subs.length > 0 && (
                    <button
                      className="mobile-expand-btn"
                      onClick={() => setMobileExpanded(isExpanded ? null : cat.id)}
                    >
                      {isExpanded ? '▲' : '▼'}
                    </button>
                  )}
                </div>
                {subs.length > 0 && isExpanded && (
                  <div className="mobile-subcats">
                    {subs.map((sub: any) => (
                      <span key={sub.id} className="mobile-subcat-item" onClick={() => goTo(`/categories/${sub.slug}`)}>
                        ↳ {sub.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <style>{`
        .site-header {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          background: rgba(250, 247, 242, 0.92);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }

        .header-container {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          height: 70px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 28px;
          box-sizing: border-box;
        }

        .logo-area {
          display: flex; flex-direction: column; cursor: pointer;
          flex-shrink: 0;
        }
        .brand-name {
          font-family: var(--font-serif);
          font-size: 1.45rem; font-weight: 700;
          letter-spacing: 0.04em; color: var(--sf-text-main); line-height: 1;
        }
        .brand-tag {
          font-size: 0.6rem; text-transform: uppercase;
          letter-spacing: 0.15em; color: var(--sf-accent);
          font-weight: 700; margin-top: 2px;
        }

        /* ─── Desktop Nav ─── */
        .site-nav {
          display: flex; gap: 4px; align-items: center;
          flex: 1; justify-content: center;
        }

        .nav-item-wrap {
          position: relative;
        }

        .site-nav > span,
        .nav-item-wrap > span {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 8px 14px;
          font-size: 0.9rem; font-weight: 500;
          color: var(--sf-text-muted);
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
          white-space: nowrap;
          user-select: none;
        }

        .site-nav > span:hover,
        .nav-item-wrap > span:hover,
        .nav-item-wrap > span.active {
          color: var(--sf-text-main);
          background: rgba(0,0,0,0.04);
        }

        .nav-chevron {
          opacity: 0.5; transition: transform 0.2s; flex-shrink: 0;
        }
        .nav-item-wrap > span.active .nav-chevron {
          transform: rotate(180deg); opacity: 1;
        }

        /* ─── Dropdown ─── */
        .nav-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 16px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.12);
          min-width: 220px;
          padding: 8px;
          z-index: 200;
          animation: nav-dd-in 0.15s ease;
        }

        @keyframes nav-dd-in {
          from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        .nav-dropdown-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 14px 6px;
          cursor: pointer;
        }
        .nav-dropdown-header strong {
          font-size: 0.85rem; font-weight: 700; color: #111827;
        }
        .view-all-link {
          font-size: 0.75rem; font-weight: 600;
          color: var(--sf-accent); white-space: nowrap;
        }
        .nav-dropdown-divider {
          height: 1px; background: #F3F4F6; margin: 4px 0;
        }
        .nav-dropdown-grid {
          display: flex; flex-direction: column; gap: 2px;
        }
        .nav-dropdown-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 14px;
          font-size: 0.88rem; color: #374151; font-weight: 500;
          cursor: pointer;
          border-radius: 10px;
          transition: background 0.15s, color 0.15s;
        }
        .nav-dropdown-item:hover {
          background: #F0FDF4; color: #15803D;
        }
        .sub-dot {
          font-size: 0.45rem; color: #9CA3AF;
        }

        @media (max-width: 900px) {
          .site-nav { display: none; }
        }

        /* ─── Header Actions ─── */
        .header-actions {
          display: flex; align-items: center; gap: 8px; flex-shrink: 0;
        }
        .cart-trigger-icon {
          position: relative; cursor: pointer;
          font-size: 1.35rem; padding: 6px;
          transition: transform 0.2s; border-radius: 8px;
        }
        .cart-trigger-icon:hover { transform: scale(1.08); background: rgba(0,0,0,0.04); }
        .cart-badge-count {
          position: absolute; top: -2px; right: -4px;
          background: var(--sf-accent); color: #fff;
          font-size: 0.65rem; font-weight: 700;
          width: 17px; height: 17px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        }

        /* ─── Mobile Toggle ─── */
        .mobile-menu-toggle {
          display: none; flex-direction: column;
          justify-content: space-between;
          width: 22px; height: 15px;
          background: transparent; border: none;
          cursor: pointer; padding: 0; margin-left: 8px;
        }
        .mobile-menu-toggle .bar {
          width: 100%; height: 2px;
          background: var(--sf-text-main);
          border-radius: 2px;
          transition: all 0.25s;
        }
        .mobile-menu-toggle.open .bar:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .mobile-menu-toggle.open .bar:nth-child(2) { opacity: 0; }
        .mobile-menu-toggle.open .bar:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

        @media (max-width: 900px) {
          .mobile-menu-toggle { display: flex; }
        }

        /* ─── Mobile Drawer ─── */
        .mobile-drawer {
          position: fixed;
          top: 70px; left: 0; right: 0; bottom: 0;
          background: var(--sf-bg);
          z-index: 99;
          transform: translateX(100%);
          opacity: 0; visibility: hidden;
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), opacity 0.25s, visibility 0.25s;
          padding: 24px;
          overflow-y: auto;
        }
        .mobile-drawer.open {
          transform: translateX(0); opacity: 1; visibility: visible;
        }
        .mobile-nav-links {
          display: flex; flex-direction: column; gap: 0;
        }
        .mobile-nav-links > span {
          font-family: var(--font-serif);
          font-size: 1.25rem; font-weight: 600;
          color: var(--sf-text-main); cursor: pointer;
          border-bottom: 1px solid var(--sf-border);
          padding: 16px 0;
          transition: color 0.2s;
        }
        .mobile-nav-links > span:hover { color: var(--sf-accent); }

        .mobile-cat-group {
          border-bottom: 1px solid var(--sf-border);
        }
        .mobile-cat-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 0;
        }
        .mobile-cat-header > span {
          font-family: var(--font-serif);
          font-size: 1.25rem; font-weight: 600;
          color: var(--sf-text-main); cursor: pointer;
        }
        .mobile-expand-btn {
          background: none; border: none; cursor: pointer;
          font-size: 0.7rem; color: var(--sf-text-muted); padding: 4px 8px;
        }
        .mobile-subcats {
          display: flex; flex-direction: column; gap: 2px;
          padding-bottom: 12px;
        }
        .mobile-subcat-item {
          font-size: 1rem; color: var(--sf-text-muted);
          cursor: pointer; padding: 8px 16px;
          border-radius: 8px; transition: all 0.2s;
        }
        .mobile-subcat-item:hover {
          color: var(--sf-accent); background: rgba(21,128,61,0.05);
        }
      `}</style>
    </header>
  );
};
export default Header;
