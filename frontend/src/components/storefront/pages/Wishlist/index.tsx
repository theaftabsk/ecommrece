import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { catalogApi } from '../../../../lib/api-client';

const WISHLIST_KEY = 'sf_wishlist';

export function getWishlist(): string[] {
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]'); } catch { return []; }
}
export function toggleWishlist(productId: string): boolean {
  const list = getWishlist();
  const idx = list.indexOf(productId);
  if (idx > -1) { list.splice(idx, 1); } else { list.push(productId); }
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  return idx === -1; // true = added, false = removed
}
export function isWishlisted(productId: string): boolean {
  return getWishlist().includes(productId);
}
export function getWishlistCount(): number {
  return getWishlist().length;
}

export const Wishlist: React.FC = () => {
  const navigate = useNavigate();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = getWishlist();
    setWishlistIds(ids);
    if (ids.length === 0) { setLoading(false); return; }
    // Fetch all products then filter by ID
    catalogApi.getProducts()
      .then((data: any) => {
        const all: any[] = data?.products || data || [];
        setProducts(all.filter(p => ids.includes(p.id)));
      })
      .finally(() => setLoading(false));
  }, []);

  const removeFromWishlist = (id: string) => {
    toggleWishlist(id);
    setWishlistIds(prev => prev.filter(x => x !== id));
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const fmt = (v: any) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="wl-spinner" />
    </div>
  );

  return (
    <div className="wl-page">
      <div className="wl-inner">
        <div className="wl-header">
          <h1 className="wl-title">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="var(--sf-accent)" stroke="var(--sf-accent)" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            My Wishlist
          </h1>
          <p className="wl-count">{wishlistIds.length} saved item{wishlistIds.length !== 1 ? 's' : ''}</p>
        </div>

        {wishlistIds.length === 0 ? (
          <div className="wl-empty">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--sf-border)" strokeWidth="1.2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <h3>Your wishlist is empty</h3>
            <p>Save items you love by tapping the heart icon on any product.</p>
            <button className="wl-browse-btn" onClick={() => navigate('/products')}>Browse Products</button>
          </div>
        ) : (
          <div className="wl-grid">
            {products.map(product => {
              const img = product.images?.[0]?.url || product.thumbnail_url || null;
              const price = Number(product.base_price || product.price || 0);
              const ogPrice = product.compare_at_price ? Number(product.compare_at_price) : null;
              const discount = ogPrice && ogPrice > price ? Math.round(((ogPrice - price) / ogPrice) * 100) : null;
              return (
                <div className="wl-card" key={product.id}>
                  <div className="wl-card-img-wrap" onClick={() => navigate(`/products/${product.slug}`)}>
                    {img ? (
                      <img src={img} alt={product.name} className="wl-card-img" />
                    ) : (
                      <div className="wl-card-placeholder">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      </div>
                    )}
                    {discount && <span className="wl-discount">-{discount}%</span>}
                    <button className="wl-remove-btn" onClick={e => { e.stopPropagation(); removeFromWishlist(product.id); }} title="Remove from wishlist">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#dc2626" stroke="#dc2626" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </button>
                  </div>
                  <div className="wl-card-body">
                    {product.category?.name && <span className="wl-cat">{product.category.name}</span>}
                    <h3 className="wl-name" onClick={() => navigate(`/products/${product.slug}`)}>{product.name}</h3>
                    <div className="wl-price-row">
                      <span className="wl-price">{fmt(price)}</span>
                      {ogPrice && ogPrice > price && <span className="wl-og-price">{fmt(ogPrice)}</span>}
                    </div>
                    <button className="wl-cart-btn" onClick={() => navigate(`/products/${product.slug}`)}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
                      View Product
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .wl-page { min-height: 100vh; background: var(--sf-bg); font-family: var(--font-sans); padding: 40px 5% 80px; }
        .wl-inner { max-width: 1200px; margin: 0 auto; }
        .wl-header { margin-bottom: 32px; }
        .wl-title { font-family: var(--font-serif); font-size: 1.9rem; color: var(--sf-text-main); margin: 0 0 6px; display: flex; align-items: center; gap: 12px; }
        .wl-count { font-size: 0.88rem; color: var(--sf-text-muted); margin: 0; }
        .wl-empty { text-align: center; padding: 80px 20px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .wl-empty h3 { font-family: var(--font-serif); font-size: 1.5rem; color: var(--sf-text-main); margin: 0; }
        .wl-empty p { font-size: 0.9rem; color: var(--sf-text-muted); margin: 0; max-width: 320px; }
        .wl-browse-btn { padding: 12px 28px; background: var(--sf-accent); color: #fff; border: none; border-radius: 50px; font-size: 0.9rem; font-weight: 700; cursor: pointer; font-family: var(--font-sans); transition: background 0.2s; }
        .wl-browse-btn:hover { background: var(--sf-accent-dark, #166534); }
        .wl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 24px; }
        .wl-card { background: #fff; border: 1px solid var(--sf-border); border-radius: 18px; overflow: hidden; transition: transform 0.25s, box-shadow 0.25s; }
        .wl-card:hover { transform: translateY(-4px); box-shadow: 0 12px 36px rgba(0,0,0,0.1); }
        .wl-card-img-wrap { position: relative; aspect-ratio: 4/3; overflow: hidden; background: var(--sf-bg); cursor: pointer; }
        .wl-card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
        .wl-card:hover .wl-card-img { transform: scale(1.05); }
        .wl-card-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .wl-discount { position: absolute; top: 10px; left: 10px; background: #dc2626; color: #fff; font-size: 0.7rem; font-weight: 700; padding: 3px 8px; border-radius: 20px; }
        .wl-remove-btn { position: absolute; top: 10px; right: 10px; width: 34px; height: 34px; border-radius: 50%; background: rgba(255,255,255,0.9); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: background 0.2s, transform 0.2s; }
        .wl-remove-btn:hover { background: #fef2f2; transform: scale(1.1); }
        .wl-card-body { padding: 16px; display: flex; flex-direction: column; gap: 8px; }
        .wl-cat { font-size: 0.7rem; font-weight: 700; color: var(--sf-accent); text-transform: uppercase; letter-spacing: 0.06em; }
        .wl-name { font-size: 0.95rem; font-weight: 600; color: var(--sf-text-main); margin: 0; cursor: pointer; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .wl-name:hover { color: var(--sf-accent); }
        .wl-price-row { display: flex; align-items: center; gap: 8px; }
        .wl-price { font-size: 1.05rem; font-weight: 800; color: var(--sf-text-main); font-family: var(--font-serif); }
        .wl-og-price { font-size: 0.85rem; color: var(--sf-text-muted); text-decoration: line-through; }
        .wl-cart-btn { display: flex; align-items: center; gap: 8px; justify-content: center; padding: 10px 16px; background: var(--sf-accent-light); color: var(--sf-accent); border: 1.5px solid var(--sf-accent); border-radius: 10px; font-size: 0.85rem; font-weight: 700; cursor: pointer; font-family: var(--font-sans); transition: all 0.2s; }
        .wl-cart-btn:hover { background: var(--sf-accent); color: #fff; }
        .wl-spinner { width: 48px; height: 48px; border-radius: 50%; border: 3px solid var(--sf-border); border-top-color: var(--sf-accent); animation: spin 0.9s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
