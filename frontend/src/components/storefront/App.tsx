import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { CartDrawer } from './components/CartDrawer';
import { Home } from './pages/Home/index';
import { Product } from './pages/Product/index';
import { Checkout } from './pages/Checkout/index';
import { Success } from './pages/Success/index';
import { Payment } from './pages/Payment/index';
import { AllProducts } from './pages/AllProducts/index';
import { Categories } from './pages/Categories/index';
import AdminDashboardApp from '@oaksol/admin-dashboard';
import MerchantDashboardApp from '@oaksol/merchant-dashboard';

// ─── Error Boundary ───────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    console.error('OakSol App Error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      const err = this.state.error;
      const isMissingTenant = err && (
        err.status === 404 || 
        (err.message && (err.message.includes('Store domain mapping') || err.message.includes('Tenant-Domain')))
      );

      if (isMissingTenant) {
        if (typeof window !== 'undefined') {
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
        return (
          <div style={{
            minHeight: '100vh', background: '#FAF7F2',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Inter, sans-serif', padding: '40px 20px', textAlign: 'center', color: '#6B7280'
          }}>
            <p>Redirecting to main platform...</p>
          </div>
        );
      }

      return (
        <div style={{
          minHeight: '100vh', background: '#FAF7F2',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Inter, sans-serif', padding: '40px 20px', textAlign: 'center'
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 20 }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <h2 style={{ fontSize: '1.75rem', marginBottom: 10, color: '#1F2937' }}>Something went wrong</h2>
          <p style={{ color: '#6B7280', marginBottom: 6, maxWidth: 480 }}>{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginBottom: 24 }}>Please refresh the page or contact support.</p>
          <button
            onClick={() => window.location.reload()}
            style={{ background: '#15803D', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const StorefrontGateway: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #111827, #030712)',
      color: '#F3F4F6',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Outfit', 'Inter', sans-serif",
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Orbs */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '20%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '20%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', width: '100%', textAlign: 'center' }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          color: '#34D399',
          padding: '6px 14px',
          borderRadius: '9999px',
          fontSize: '0.8rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '24px'
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
          Storefront Routing Gateway
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 800,
          background: 'linear-gradient(to right, #FFFFFF, #E5E7EB, #9CA3AF)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '16px',
          letterSpacing: '-0.02em',
          marginTop: 0
        }}>
          OakSol E-Commerce
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: '#9CA3AF',
          lineHeight: '1.6',
          maxWidth: '600px',
          margin: '0 auto 48px'
        }}>
          This server handles storefronts on port <code style={{ color: '#F3F4F6', background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>3001</code>. Access the platform landing page, customer stores, or administrative panels below:
        </p>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px',
          textAlign: 'left'
        }}>
          {/* Card 1: SaaS Landing Page */}
          <div style={{
            background: 'rgba(17, 24, 39, 0.7)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)'
          }}>
            <div>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(99, 102, 241, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818CF8',
                marginBottom: '16px'
              }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px', marginTop: 0 }}>SaaS Website</h3>
              <p style={{ fontSize: '0.9rem', color: '#9CA3AF', lineHeight: '1.5', marginBottom: '20px' }}>
                Visit the main platform landing page on port 3000 to sign up or check features.
              </p>
            </div>
            <a href="http://localhost:3000" style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 500,
              textDecoration: 'none'
            }}>
              Go to Website
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>

          {/* Card 2: Merchant Storefronts */}
          <div style={{
            background: 'rgba(17, 24, 39, 0.7)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)'
          }}>
            <div>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34D399',
                marginBottom: '16px'
              }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px', marginTop: 0 }}>Storefronts</h3>
              <p style={{ fontSize: '0.9rem', color: '#9CA3AF', lineHeight: '1.5', marginBottom: '20px' }}>
                Open an active store via its subdomain on port 3001:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                <a href="http://maheorthe.localhost:3001" style={{
                  color: '#34D399',
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  • maheorthe.localhost:3001
                  <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <a href="http://nature-glow.localhost:3001" style={{
                  color: '#34D399',
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  • nature-glow.localhost:3001
                  <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#6B7280', fontStyle: 'italic' }}>
              Subdomain resolution required
            </span>
          </div>

          {/* Card 3: Super Admin Panel */}
          <div style={{
            background: 'rgba(17, 24, 39, 0.7)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)'
          }}>
            <div>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F87171',
                marginBottom: '16px'
              }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px', marginTop: 0 }}>Super Admin</h3>
              <p style={{ fontSize: '0.9rem', color: '#9CA3AF', lineHeight: '1.5', marginBottom: '20px' }}>
                Open the super administration board to provision and manage merchant plans.
              </p>
            </div>
            <a href="http://admin.localhost:3001" style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#F87171',
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 500,
              textDecoration: 'none'
            }}>
              Open Admin
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '64px', fontSize: '0.85rem', color: '#4B5563' }}>
          OakSol E-commerce © 2026. All rights reserved.
        </div>
      </div>
    </div>
  );
};

function App() {
  // Resolve current browser location context
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const parts = hostname.split('.');

  // 1. Super Admin domain (e.g., admin.localhost)
  const isSuperAdminDomain = parts[0] === 'admin';

  // 2. SaaS Platform Landing Page (e.g., localhost or 127.0.0.1)
  const isMainLandingPage = hostname === 'localhost' || hostname === '127.0.0.1' || parts.length < 2;

  // 3. Merchant Dashboard page (e.g., maheorthe.localhost/admin or /dashboard)
  const isMerchantDashboard = pathname.startsWith('/admin') || pathname.startsWith('/dashboard');

  // --- CASE A: Super Admin Platform Panel ---
  if (isSuperAdminDomain) {
    return (
      <ErrorBoundary>
        <AdminDashboardApp />
      </ErrorBoundary>
    );
  }

  // --- CASE B: Main SaaS Platform Landing Page ---
  if (isMainLandingPage) {
    return (
      <ErrorBoundary>
        <StorefrontGateway />
      </ErrorBoundary>
    );
  }

  // --- CASE C: Merchant Dashboard Panel on Brand Subdomain ---
  if (isMerchantDashboard) {
    return (
      <ErrorBoundary>
        <MerchantDashboardApp />
      </ErrorBoundary>
    );
  }

  // --- CASE D: Customer Brand Storefront ---
  return (
    <ErrorBoundary>
      <Router>
        <CartProvider>
          <div className="storefront-app-shell" style={{ background: '#FAF7F2', minHeight: '100vh', paddingTop: '70px' }}>
            <Header />
            <main className="storefront-main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<AllProducts />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/categories/:categorySlug" element={<Categories />} />
                <Route path="/products/:slug" element={<Product />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/checkout/payment/:orderId" element={<Payment />} />
                <Route path="/order-success" element={<Success />} />
              </Routes>
            </main>
            <CartDrawer />
          </div>
        </CartProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
