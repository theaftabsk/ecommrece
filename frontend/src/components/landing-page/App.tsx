import React, { useState, useEffect, useRef } from 'react';
import { catalogApi } from '@oaksol/api-client';

// ─── SVG Icon Components ──────────────────────────────────────────────────────
const IcZap = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IcCard = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);
const IcSettings = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
const IcLeaf = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2"/>
  </svg>
);
const IcGlobe = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const IcChart = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const IcCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IcMail = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IcArrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IcMenu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const FEATURES = [
  { icon: <IcZap />, title: 'Instant Storefronts', desc: 'Deploy a multi-tenant store with dynamic banners, categories, and product grids in minutes once approved.', color: '#f59e0b' },
  { icon: <IcCard />, title: 'Razorpay Integration', desc: 'Accept UPI, NetBanking, Cards, and COD out of the box. Cryptographic signature verification on every transaction.', color: '#3b82f6' },
  { icon: <IcSettings />, title: 'Merchant Console', desc: 'Manage listings, configure multi-SKU variants, track inventory, generate coupons, and fulfill orders in one place.', color: '#8b5cf6' },
  { icon: <IcLeaf />, title: 'Rich Product Pages', desc: 'Showcase benefits tabs, ingredient cards, usage guides, and step-by-step application instructions beautifully.', color: '#22c55e' },
  { icon: <IcGlobe />, title: 'Custom Domain Routing', desc: 'Map your brand domain directly to your tenant store with automatic SSL certificates provisioning.', color: '#06b6d4' },
  { icon: <IcChart />, title: 'Admin Analytics', desc: 'Track system-wide performance, total gross sales, manage merchant billing tiers, and approve tenant stores instantly.', color: '#ec4899' },
];

const STATS = [
  { value: '10x', label: 'Faster Time to Market' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '∞', label: 'Scalable Products' },
  { value: '₹0', label: 'Setup Cost' },
];

function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [shopName, setShopName] = useState('');
  const [category, setCategory] = useState('Skincare');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [demoSlug, setDemoSlug] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleRequestDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !shopName) return;
    setLoading(true);
    try {
      const slug = shopName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await catalogApi.submitTenantRequest({ name: shopName, slug, ownerName: name, ownerEmail: email, phone, category });
      setDemoSlug(slug);
      setSuccess(true);
    } catch (err: any) {
      alert(err.message || 'Failed to submit demo request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp-root">

      {/* ── Navigation ── */}
      <header className={`lp-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="lp-nav-inner">
          <div className="lp-logo">
            <span className="logo-mark">O</span>
            <span>OakSol Commerce</span>
          </div>
          <nav className="lp-nav-links">
            <a href="#features">Features</a>
            <a href="#stats">Platform</a>
            <a href="#demo-form">Pricing</a>
          </nav>
          <a href="#demo-form" className="lp-nav-cta">
            Get Started Free <IcArrow />
          </a>
          <button className="lp-hamburger" onClick={() => setMenuOpen(m => !m)}><IcMenu /></button>
        </div>
        {menuOpen && (
          <div className="lp-mobile-menu">
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#stats" onClick={() => setMenuOpen(false)}>Platform</a>
            <a href="#demo-form" onClick={() => setMenuOpen(false)}>Get Started</a>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="lp-hero" ref={heroRef}>
        <div className="lp-hero-particles">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="particle" style={{ '--i': i } as React.CSSProperties} />
          ))}
        </div>
        <div className="lp-hero-glow lp-hero-glow-1" />
        <div className="lp-hero-glow lp-hero-glow-2" />

        <div className="lp-hero-content">
          <div className="lp-hero-badge">
            <span className="badge-dot" />
            Enterprise Multi-Tenant E-Commerce Platform
          </div>
          <h1 className="lp-hero-h1">
            Launch Your Brand Store<br />
            <span className="lp-hero-accent">in Minutes, Not Months</span>
          </h1>
          <p className="lp-hero-sub">
            A high-performance SaaS platform built for premium retail brands. Custom domains,
            secure payments, inventory management — all ready on day one.
          </p>
          <div className="lp-hero-actions">
            <a href="#demo-form" className="btn-primary-hero">
              Request Free Sandbox
              <IcArrow />
            </a>
            <a href="#features" className="btn-ghost-hero">
              See How It Works
            </a>
          </div>
          <div className="lp-hero-trust">
            <span>Powered by</span>
            <span className="trust-tag">Razorpay</span>
            <span className="trust-tag">NestJS</span>
            <span className="trust-tag">React + Vite</span>
            <span className="trust-tag">Prisma ORM</span>
          </div>
        </div>

        <div className="lp-hero-visual">
          <div className="hero-mockup">
            <div className="hm-bar">
              <span className="hm-dot red"/><span className="hm-dot yellow"/><span className="hm-dot green"/>
              <span className="hm-url">nature-glow.localhost:3001</span>
            </div>
            <div className="hm-body">
              <div className="hm-nav-strip" />
              <div className="hm-banner" />
              <div className="hm-grid">
                {[1,2,3,4].map(n => (
                  <div className="hm-card" key={n}>
                    <div className="hm-img" style={{animationDelay: `${n * 0.2}s`}} />
                    <div className="hm-title-bar" />
                    <div className="hm-price-bar" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section id="stats" className="lp-stats">
        <div className="lp-stats-inner">
          {STATS.map((s, i) => (
            <div className="lp-stat" key={i}>
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="lp-features">
        <div className="lp-section-header">
          <span className="lp-eyebrow">PLATFORM CAPABILITIES</span>
          <h2>Everything to Sell Online,<br />Nothing You Don't Need</h2>
          <p>OakSol Commerce combines a robust NestJS backend with blazing-fast React storefronts to power modern digital retail at scale.</p>
        </div>

        <div className="lp-features-grid">
          {FEATURES.map((f, i) => (
            <div className="lp-feature-card" key={i} style={{ '--accent': f.color } as React.CSSProperties}>
              <div className="fc-icon-wrap">
                {f.icon}
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <div className="fc-line" />
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="lp-how">
        <div className="lp-how-inner">
          <div className="lp-section-header" style={{ marginBottom: '60px' }}>
            <span className="lp-eyebrow">WORKFLOW</span>
            <h2>Up and Running in 3 Steps</h2>
          </div>
          <div className="lp-steps">
            {[
              { n: '01', title: 'Request Your Store', desc: 'Fill the form with your shop name, category, and contact. Takes under 60 seconds.' },
              { n: '02', title: 'Admin Approval', desc: 'Our Super Admin reviews the request and provisions your tenant store with a sample catalog.' },
              { n: '03', title: 'Go Live', desc: 'Your custom-domain storefront is live. Manage it via the Merchant Console and start selling.' },
            ].map((step, i) => (
              <div className="lp-step" key={i}>
                <div className="step-num">{step.n}</div>
                <div className="step-body">
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
                {i < 2 && <div className="step-connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Form Section ── */}
      <section id="demo-form" className="lp-form-section">
        <div className="lp-form-inner">
          {/* Info Side */}
          <div className="lp-form-info">
            <span className="lp-eyebrow">GET STARTED</span>
            <h2>Launch Your Free<br />Sandbox Store Today</h2>
            <p>No credit card required. Our team will review and provision your store manually — usually within hours.</p>
            <ul className="lp-checklist">
              {[
                'Instant sandbox on approval',
                'Fully populated sample catalog',
                'Live Razorpay test environment',
                '14-day free trial on all Pro features',
                'Dedicated merchant admin console',
              ].map((item, i) => (
                <li key={i}>
                  <span className="check-circle"><IcCheck /></span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="lp-form-social-proof">
              <div className="sp-avatars">
                {['A', 'R', 'S', 'M'].map((l, i) => (
                  <span className="sp-avatar" key={i} style={{ zIndex: 4 - i }}>{l}</span>
                ))}
              </div>
              <span>Join <strong>50+ merchants</strong> already on OakSol Commerce</span>
            </div>
          </div>

          {/* Form Card */}
          <div className="lp-form-card">
            {success ? (
              <div className="lp-success-state">
                <div className="success-mail-icon"><IcMail /></div>
                <h3>Request Submitted!</h3>
                <p>Your store request for <strong>{shopName}</strong> has been received by our Super Admin panel.</p>
                <div className="lp-creds-box">
                  <div className="cred-row">
                    <span className="cred-label">Status</span>
                    <span className="badge-pending">Pending Approval</span>
                  </div>
                  <div className="cred-row">
                    <span className="cred-label">Requested Domain</span>
                    <code className="cred-value">{demoSlug}.localhost:3001</code>
                  </div>
                  <p className="cred-note">Once the Super Admin approves, your store will be provisioned and accessible instantly.</p>
                </div>
                <button className="btn-outline-reset" onClick={() => { setSuccess(false); setName(''); setEmail(''); setPhone(''); setShopName(''); }}>
                  Request Another Store
                </button>
              </div>
            ) : (
              <form onSubmit={handleRequestDemo} className="lp-form">
                <h3 className="form-title">Create Your Store</h3>
                <div className="lp-field">
                  <label>Full Name <span className="required">*</span></label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g., Amit Sharma" />
                </div>
                <div className="lp-field-row">
                  <div className="lp-field">
                    <label>Email <span className="required">*</span></label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="amit@gmail.com" />
                  </div>
                  <div className="lp-field">
                    <label>Phone <span className="required">*</span></label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+91 98765 43210" />
                  </div>
                </div>
                <div className="lp-field-row">
                  <div className="lp-field" style={{ flex: 2 }}>
                    <label>Shop Name <span className="required">*</span></label>
                    <input type="text" value={shopName} onChange={e => setShopName(e.target.value)} required placeholder="e.g., Organic Roots" />
                  </div>
                  <div className="lp-field" style={{ flex: 1 }}>
                    <label>Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)}>
                      <option>Skincare</option>
                      <option>Fashion</option>
                      <option>Electronics</option>
                      <option>Grocery</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? (
                    <span className="btn-spinner" />
                  ) : (
                    <>Request Free Store <IcArrow /></>
                  )}
                </button>
                <p className="form-legal">By submitting, you agree to our Terms of Service. No payment required.</p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <div className="lp-logo" style={{ color: '#fff' }}>
              <span className="logo-mark">O</span>
              <span>OakSol Commerce</span>
            </div>
            <p>A multi-tenant e-commerce SaaS platform for premium Indian retail brands.</p>
          </div>
          <div className="lp-footer-links">
            <span className="footer-col-title">Product</span>
            <a href="#features">Features</a>
            <a href="#stats">Platform</a>
            <a href="#demo-form">Get Started</a>
          </div>
          <div className="lp-footer-links">
            <span className="footer-col-title">Technology</span>
            <a href="#">NestJS Backend</a>
            <a href="#">React Storefront</a>
            <a href="#">Razorpay Payments</a>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <span>© 2026 OakSol Commerce. All rights reserved.</span>
          <span>Built with React · Vite · NestJS · Prisma</span>
        </div>
      </footer>

      <style>{`
        /* ─── Reset & Base ─────────────────────────────────────────────── */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lp-root {
          font-family: 'Inter', sans-serif;
          background: #FAF9F6;
          color: #1E293B;
          overflow-x: hidden;
          letter-spacing: -0.01em;
        }

        /* ─── Navigation ────────────────────────────────────────────────── */
        .lp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          padding: 20px 5%;
          transition: background 0.3s ease, box-shadow 0.3s ease, padding 0.3s ease;
        }
        .lp-nav.scrolled {
          background: rgba(250, 249, 246, 0.92);
          backdrop-filter: blur(16px);
          padding: 14px 5%;
          box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
        }
        .lp-nav-inner {
          max-width: 1280px; margin: 0 auto;
          display: flex; align-items: center; gap: 32px;
        }
        .lp-logo {
          display: flex; align-items: center; gap: 10px;
          font-size: 1.15rem; font-weight: 700; color: #0F172A;
          font-family: 'Playfair Display', serif;
          text-decoration: none;
          white-space: nowrap;
        }
        .logo-mark {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, #16A34A, #15803D);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 1rem; font-weight: 900;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
        }
        .lp-nav-links {
          display: flex; gap: 28px; margin-left: auto;
        }
        .lp-nav-links a {
          color: #475569; text-decoration: none; font-size: 0.9rem; font-weight: 500;
          transition: color 0.2s;
        }
        .lp-nav-links a:hover { color: #0F172A; }
        .lp-nav-cta {
          display: flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #16A34A, #15803D);
          color: #fff; text-decoration: none;
          padding: 9px 20px; border-radius: 50px;
          font-size: 0.87rem; font-weight: 600;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(22, 163, 74, 0.25);
          white-space: nowrap;
        }
        .lp-nav-cta:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(22, 163, 74, 0.35); }
        .lp-hamburger {
          display: none; background: none; border: none; color: #475569; cursor: pointer; margin-left: auto;
        }
        .lp-mobile-menu {
          background: rgba(250, 249, 246, 0.98);
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          display: flex; flex-direction: column;
          padding: 16px 5%;
        }
        .lp-mobile-menu a { color: #475569; text-decoration: none; padding: 12px 0; font-size: 1rem; border-bottom: 1px solid rgba(0,0,0,0.03); }

        @media (max-width: 768px) {
          .lp-nav-links, .lp-nav-cta { display: none; }
          .lp-hamburger { display: block; }
        }

        /* ─── Hero ──────────────────────────────────────────────────────── */
        .lp-hero {
          min-height: 100vh;
          background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(22, 163, 74, 0.07) 0%, transparent 70%),
                      linear-gradient(180deg, #EAEFE9 0%, #FAF9F6 40%, #FAF9F6 100%);
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 60px;
          padding: 140px 5% 80px;
          position: relative;
          overflow: hidden;
          max-width: 100%;
        }
        @media (max-width: 960px) {
          .lp-hero { grid-template-columns: 1fr; padding: 120px 5% 60px; }
          .lp-hero-visual { display: none; }
        }

        /* Floating particles */
        .lp-hero-particles { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .particle {
          position: absolute;
          width: 3px; height: 3px;
          background: rgba(22, 163, 74, 0.35);
          border-radius: 50%;
          left: calc(var(--i, 0) * 6.5%);
          top: calc(20% + (var(--i, 0) * 4%));
          animation: floatUp calc(8s + var(--i, 0) * 0.5s) ease-in-out infinite alternate;
          opacity: 0;
        }
        @keyframes floatUp {
          0% { opacity: 0; transform: translateY(30px) scale(0); }
          20% { opacity: 0.8; }
          100% { opacity: 0.2; transform: translateY(-80px) scale(1.5); }
        }

        .lp-hero-glow {
          position: absolute; border-radius: 50%; pointer-events: none; filter: blur(80px);
        }
        .lp-hero-glow-1 {
          width: 500px; height: 400px;
          background: radial-gradient(circle, rgba(22, 163, 74, 0.08) 0%, transparent 70%);
          top: -100px; left: 20%;
          animation: glowPulse 6s ease-in-out infinite alternate;
        }
        .lp-hero-glow-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%);
          bottom: 0; right: 5%;
        }
        @keyframes glowPulse {
          from { transform: scale(1) translateY(0); opacity: 0.7; }
          to { transform: scale(1.2) translateY(-20px); opacity: 1; }
        }

        .lp-hero-content { position: relative; z-index: 2; }
        .lp-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(22, 163, 74, 0.08);
          border: 1px solid rgba(22, 163, 74, 0.18);
          color: #16A34A; font-size: 0.78rem; font-weight: 600;
          letter-spacing: 0.06em; padding: 6px 14px; border-radius: 50px;
          margin-bottom: 24px;
          animation: fadeSlideUp 0.6s ease forwards;
        }
        .badge-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #16A34A;
          animation: blink 2s ease-in-out infinite;
        }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

        .lp-hero-h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.5rem, 5vw, 3.8rem);
          line-height: 1.12;
          color: #0F172A;
          margin-bottom: 20px;
          animation: fadeSlideUp 0.6s 0.1s ease both;
          letter-spacing: -0.015em;
        }
        .lp-hero-accent {
          background: linear-gradient(135deg, #15803D, #22C55E);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .lp-hero-sub {
          font-size: 1.1rem; color: #475569; line-height: 1.7;
          max-width: 520px; margin-bottom: 36px;
          animation: fadeSlideUp 0.6s 0.2s ease both;
        }
        .lp-hero-actions {
          display: flex; gap: 14px; flex-wrap: wrap;
          animation: fadeSlideUp 0.6s 0.3s ease both;
          margin-bottom: 36px;
        }
        .btn-primary-hero {
          display: inline-flex; align-items: center; gap: 10px;
          background: linear-gradient(135deg, #16A34A, #15803D);
          color: #fff; text-decoration: none;
          padding: 14px 28px; border-radius: 50px; font-size: 1rem; font-weight: 700;
          box-shadow: 0 6px 30px rgba(22, 163, 74, 0.3);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-primary-hero:hover { transform: translateY(-2px); box-shadow: 0 8px 40px rgba(22, 163, 74, 0.45); }
        .btn-ghost-hero {
          display: inline-flex; align-items: center; gap: 8px;
          color: #475569; text-decoration: none;
          padding: 14px 24px; border-radius: 50px; font-size: 0.95rem; font-weight: 500;
          border: 1px solid rgba(0, 0, 0, 0.12);
          transition: color 0.2s, border-color 0.2s, background 0.2s;
          background: rgba(255, 255, 255, 0.6);
        }
        .btn-ghost-hero:hover { color: #0F172A; border-color: rgba(0,0,0,0.3); background: #fff; }

        .lp-hero-trust {
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
          animation: fadeSlideUp 0.6s 0.4s ease both;
        }
        .lp-hero-trust > span:first-child { font-size: 0.8rem; color: #64748b; }
        .trust-tag {
          font-size: 0.78rem; font-weight: 600; color: #475569;
          background: rgba(0, 0, 0, 0.03); border: 1px solid rgba(0, 0, 0, 0.06);
          padding: 4px 10px; border-radius: 6px;
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── Browser Mockup ── */
        .lp-hero-visual { position: relative; z-index: 2; animation: fadeSlideUp 0.8s 0.5s ease both; }
        .hero-mockup {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 30px 70px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02);
        }
        .hm-bar {
          background: #f8fafc;
          padding: 12px 16px;
          display: flex; align-items: center; gap: 8px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        .hm-dot { width: 10px; height: 10px; border-radius: 50%; }
        .hm-dot.red { background: #ef4444; }
        .hm-dot.yellow { background: #f59e0b; }
        .hm-dot.green { background: #22c55e; }
        .hm-url {
          font-size: 0.72rem; color: #475569; background: rgba(0, 0, 0, 0.04);
          padding: 4px 12px; border-radius: 6px; margin: 0 auto; font-family: monospace;
        }
        .hm-body { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
        .hm-nav-strip {
          height: 36px; background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 100%);
          border-radius: 8px;
          animation: shimmer 2s ease-in-out infinite alternate;
        }
        .hm-banner {
          height: 100px;
          background: linear-gradient(135deg, rgba(34,197,94,0.08), rgba(16,185,129,0.04));
          border-radius: 10px; border: 1px solid rgba(34,197,94,0.08);
        }
        .hm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .hm-card { background: #f8fafc; border-radius: 10px; padding: 10px; border: 1px solid rgba(0, 0, 0, 0.04); }
        .hm-img {
          height: 60px; border-radius: 7px; margin-bottom: 8px;
          background: linear-gradient(135deg, rgba(34,197,94,0.04), rgba(59,130,246,0.04));
          animation: shimmer 2s ease-in-out infinite alternate;
        }
        .hm-title-bar { height: 8px; background: rgba(0,0,0,0.06); border-radius: 4px; margin-bottom: 5px; width: 75%; }
        .hm-price-bar { height: 7px; background: rgba(34,197,94,0.25); border-radius: 4px; width: 45%; }
        @keyframes shimmer {
          from { opacity: 0.6; }
          to { opacity: 1; }
        }

        /* ─── Stats ─────────────────────────────────────────────────────── */
        .lp-stats {
          background: rgba(0, 0, 0, 0.015);
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          padding: 48px 5%;
        }
        .lp-stats-inner {
          max-width: 1000px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px;
          text-align: center;
        }
        @media (max-width: 640px) { .lp-stats-inner { grid-template-columns: repeat(2, 1fr); } }
        .lp-stat { display: flex; flex-direction: column; gap: 4px; }
        .stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 2.6rem; font-weight: 800;
          background: linear-gradient(135deg, #15803D, #22C55E);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .stat-label { font-size: 0.85rem; color: #475569; font-weight: 500; }

        /* ─── Features ──────────────────────────────────────────────────── */
        .lp-features {
          padding: 120px 5%;
          background: #FAF9F6;
        }
        .lp-section-header {
          text-align: center; max-width: 700px; margin: 0 auto 80px;
          display: flex; flex-direction: column; align-items: center; gap: 16px;
        }
        .lp-eyebrow {
          font-size: 0.72rem; font-weight: 700; letter-spacing: 0.18em;
          color: #16A34A; text-transform: uppercase;
        }
        .lp-section-header h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 4vw, 2.8rem);
          color: #0F172A; line-height: 1.2;
          letter-spacing: -0.01em;
        }
        .lp-section-header p { font-size: 1rem; color: #475569; line-height: 1.7; max-width: 560px; }

        .lp-features-grid {
          max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
        }
        @media (max-width: 900px) { .lp-features-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .lp-features-grid { grid-template-columns: 1fr; } }

        .lp-feature-card {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 20px;
          padding: 36px 30px;
          display: flex; flex-direction: column; gap: 14px;
          position: relative; overflow: hidden;
          transition: transform 0.3s ease, border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.015);
        }
        .lp-feature-card::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: var(--accent, #16A34A);
          opacity: 0; transition: opacity 0.3s;
        }
        .lp-feature-card:hover {
          transform: translateY(-6px);
          border-color: rgba(22, 163, 74, 0.15);
          background: #ffffff;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.04);
        }
        .lp-feature-card:hover::before { opacity: 1; }

        .fc-icon-wrap {
          width: 52px; height: 52px;
          background: rgba(22, 163, 74, 0.05);
          border: 1px solid rgba(22, 163, 74, 0.1);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          color: var(--accent, #16A34A);
          transition: background 0.3s, transform 0.3s;
        }
        .lp-feature-card:hover .fc-icon-wrap {
          background: rgba(22, 163, 74, 0.1);
          transform: scale(1.08);
        }
        .lp-feature-card h3 { font-size: 1.05rem; font-weight: 700; color: #0F172A; }
        .lp-feature-card p { font-size: 0.88rem; color: #475569; line-height: 1.65; flex: 1; }
        .fc-line { height: 1px; background: rgba(0, 0, 0, 0.04); margin-top: auto; }

        /* ─── How It Works ──────────────────────────────────────────────── */
        .lp-how {
          padding: 100px 5%;
          background: linear-gradient(180deg, rgba(22,163,74,0.02) 0%, transparent 100%);
          border-top: 1px solid rgba(0, 0, 0, 0.04);
        }
        .lp-how-inner { max-width: 1200px; margin: 0 auto; }
        .lp-steps {
          display: flex; gap: 0; align-items: flex-start;
          position: relative;
        }
        @media (max-width: 768px) { .lp-steps { flex-direction: column; gap: 30px; } .step-connector { display: none; } }
        .lp-step {
          flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center;
          position: relative; gap: 20px;
        }
        .step-num {
          width: 56px; height: 56px; border-radius: 50%;
          border: 2px solid rgba(22,163,74,0.25);
          background: rgba(22,163,74,0.05);
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem; font-weight: 800; color: #16A34A;
          font-family: 'Playfair Display', serif;
          position: relative; z-index: 2;
        }
        .step-body { max-width: 260px; }
        .step-body h4 { font-size: 1.05rem; font-weight: 700; color: #0F172A; margin-bottom: 8px; }
        .step-body p { font-size: 0.88rem; color: #475569; line-height: 1.6; }
        .step-connector {
          position: absolute;
          top: 28px; left: calc(50% + 36px); right: calc(-50% + 36px);
          height: 1px;
          background: linear-gradient(90deg, rgba(22,163,74,0.25), rgba(22,163,74,0.05));
        }

        /* ─── Form Section ──────────────────────────────────────────────── */
        .lp-form-section {
          padding: 120px 5%;
          background: #FAF9F6;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }
        .lp-form-inner {
          max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1.1fr;
          gap: 80px; align-items: start;
        }
        @media (max-width: 900px) { .lp-form-inner { grid-template-columns: 1fr; gap: 50px; } }

        .lp-form-info { display: flex; flex-direction: column; gap: 20px; }
        .lp-form-info h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 3.5vw, 2.8rem);
          color: #0F172A; line-height: 1.2;
          letter-spacing: -0.01em;
        }
        .lp-form-info > p { font-size: 1rem; color: #475569; line-height: 1.7; }

        .lp-checklist { list-style: none; display: flex; flex-direction: column; gap: 12px; }
        .lp-checklist li {
          display: flex; align-items: center; gap: 12px;
          font-size: 0.93rem; color: #475569; font-weight: 500;
        }
        .check-circle {
          width: 22px; height: 22px; flex-shrink: 0;
          border-radius: 50%; background: rgba(22,163,74,0.1);
          border: 1px solid rgba(22,163,74,0.2);
          display: flex; align-items: center; justify-content: center;
          color: #16A34A;
        }

        .lp-form-social-proof {
          display: flex; align-items: center; gap: 12px; margin-top: 8px;
        }
        .sp-avatars { display: flex; }
        .sp-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #16A34A, #15803D);
          border: 2px solid #FAF9F6;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.7rem; font-weight: 700; color: #fff;
          margin-left: -8px;
        }
        .sp-avatar:first-child { margin-left: 0; }
        .lp-form-social-proof > span { font-size: 0.85rem; color: #64748b; }
        .lp-form-social-proof strong { color: #0F172A; }

        /* Form Card */
        .lp-form-card {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 24px;
          padding: 44px;
          box-shadow: 0 30px 70px rgba(0,0,0,0.04);
          position: sticky; top: 100px;
        }
        @media (max-width: 900px) { .lp-form-card { position: static; } }

        .lp-form { display: flex; flex-direction: column; gap: 18px; }
        .form-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem; color: #0F172A; margin-bottom: 4px;
        }
        .lp-field { display: flex; flex-direction: column; gap: 6px; }
        .lp-field label { font-size: 0.82rem; font-weight: 600; color: #475569; letter-spacing: 0.02em; }
        .required { color: #ef4444; }
        .lp-field input, .lp-field select {
          background: #ffffff;
          border: 1px solid #D1D5DB;
          border-radius: 10px;
          padding: 12px 14px;
          color: #1F2937; font-family: 'Inter', sans-serif; font-size: 0.93rem;
          outline: none; transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .lp-field input::placeholder { color: #9CA3AF; }
        .lp-field input:focus, .lp-field select:focus {
          border-color: rgba(22, 163, 74, 0.5);
          background: rgba(22, 163, 74, 0.01);
          box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
        }
        .lp-field select option { background: #ffffff; color: #1F2937; }
        .lp-field-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 14px; }

        .btn-submit {
          width: 100%; padding: 15px; border-radius: 50px; border: none;
          background: linear-gradient(135deg, #16A34A, #15803D);
          color: #fff; font-size: 1rem; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
          box-shadow: 0 6px 24px rgba(22, 163, 74, 0.25);
          transition: transform 0.2s, box-shadow 0.2s;
          font-family: 'Inter', sans-serif;
          margin-top: 4px;
        }
        .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(22, 163, 74, 0.35); }
        .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

        .btn-spinner {
          width: 20px; height: 20px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .form-legal { font-size: 0.75rem; color: #64748b; text-align: center; line-height: 1.5; }

        /* Success State */
        .lp-success-state {
          display: flex; flex-direction: column; align-items: center;
          gap: 18px; text-align: center;
        }
        .success-mail-icon {
          width: 88px; height: 88px; border-radius: 50%;
          background: rgba(22, 163, 74, 0.08); border: 1px solid rgba(22, 163, 74, 0.2);
          display: flex; align-items: center; justify-content: center;
          color: #16A34A;
          animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes popIn { from { opacity:0; transform:scale(0.7); } to { opacity:1; transform:scale(1); } }
        .lp-success-state h3 { font-family: 'Playfair Display', serif; font-size: 1.6rem; color: #16A34A; }
        .lp-success-state > p { font-size: 0.9rem; color: #475569; line-height: 1.6; }
        .lp-success-state strong { color: #0F172A; }

        .lp-creds-box {
          background: #f8fafc; border: 1px solid #e2e8f0;
          border-radius: 12px; padding: 20px; width: 100%;
          display: flex; flex-direction: column; gap: 12px; text-align: left;
        }
        .cred-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .cred-label { font-size: 0.8rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .cred-value { font-family: monospace; font-size: 0.87rem; color: #16A34A; background: rgba(22, 163, 74, 0.06); padding: 3px 8px; border-radius: 6px; }
        .badge-pending { font-size: 0.78rem; font-weight: 700; color: #d97706; background: rgba(217,119,6,0.08); border: 1px solid rgba(217,119,6,0.15); padding: 3px 10px; border-radius: 20px; }
        .cred-note { font-size: 0.8rem; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 12px; line-height: 1.5; }

        .btn-outline-reset {
          background: none; border: 1px solid #D1D5DB; color: #475569;
          padding: 11px 24px; border-radius: 50px; font-size: 0.88rem; font-weight: 600;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: color 0.2s, border-color 0.2s, background 0.2s;
        }
        .btn-outline-reset:hover { color: #0F172A; border-color: #9CA3AF; background: #F9FAFB; }

        /* ─── Footer ────────────────────────────────────────────────────── */
        .lp-footer {
          background: #f8fafc;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
          padding: 70px 5% 0;
        }
        .lp-footer-inner {
          max-width: 1280px; margin: 0 auto;
          display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 60px;
          padding-bottom: 60px;
        }
        @media (max-width: 768px) { .lp-footer-inner { grid-template-columns: 1fr; gap: 36px; } }
        .lp-footer-brand { display: flex; flex-direction: column; gap: 14px; }
        .lp-footer-brand p { font-size: 0.87rem; color: #475569; line-height: 1.6; max-width: 280px; }
        .lp-footer-links { display: flex; flex-direction: column; gap: 12px; }
        .footer-col-title { font-size: 0.8rem; font-weight: 700; color: #64748b; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 4px; }
        .lp-footer-links a { font-size: 0.88rem; color: #475569; text-decoration: none; transition: color 0.2s; }
        .lp-footer-links a:hover { color: #0F172A; }
        .lp-footer-bottom {
          max-width: 1280px; margin: 0 auto;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          padding: 24px 0;
          display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;
          font-size: 0.8rem; color: #64748b;
        }
      `}</style>
    </div>
  );
}

export default App;
