import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { catalogApi } from '../../../../lib/api-client';
import { useCart } from '../../context/CartContext';

export const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [inputVal, setInputVal] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setTotal(0); return; }
    setLoading(true);
    try {
      const data: any = await catalogApi.getProducts({ search: q, limit: 24 });
      const items: any[] = data?.products || data || [];
      setResults(items);
      setTotal(data?.total || items.length);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQuery(inputVal);
      if (inputVal.trim()) setSearchParams({ q: inputVal });
      else setSearchParams({});
      doSearch(inputVal);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [inputVal, doSearch, setSearchParams]);

  useEffect(() => { if (initialQuery) doSearch(initialQuery); }, []);

  const fmt = (v: any) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

  return (
    <div className="srch-page">
      <div className="srch-inner">
        {/* Hero Search Bar */}
        <div className="srch-hero">
          <h1 className="srch-title">Search Products</h1>
          <div className="srch-bar-wrap">
            <div className="srch-bar">
              <svg className="srch-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="text"
                className="srch-input"
                placeholder="Search for products, brands, categories…"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                autoFocus
              />
              {inputVal && (
                <button className="srch-clear" onClick={() => { setInputVal(''); setResults([]); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
          </div>
          {query && !loading && (
            <p className="srch-meta">
              {total > 0 ? `${total} result${total !== 1 ? 's' : ''} for "${query}"` : `No results for "${query}"`}
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="srch-loading">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="srch-skeleton" />)}
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <div className="srch-grid">
            {results.map(product => {
              const img = product.images?.[0]?.url || product.thumbnail_url || null;
              const price = Number(product.base_price || product.price || 0);
              const ogPrice = product.compare_at_price ? Number(product.compare_at_price) : null;
              const discount = ogPrice && ogPrice > price ? Math.round(((ogPrice - price) / ogPrice) * 100) : null;
              const defaultVariant = product.variants?.[0];
              return (
                <div key={product.id} className="srch-card">
                  <div className="srch-card-img" onClick={() => navigate(`/products/${product.slug}`)}>
                    {img ? <img src={img} alt={product.name} /> : (
                      <div className="srch-card-placeholder">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      </div>
                    )}
                    {discount && <span className="srch-badge">-{discount}%</span>}
                  </div>
                  <div className="srch-card-body">
                    {product.category?.name && <span className="srch-cat">{product.category.name}</span>}
                    <h3 className="srch-name" onClick={() => navigate(`/products/${product.slug}`)}>{product.name}</h3>
                    <div className="srch-price-row">
                      <span className="srch-price">{fmt(price)}</span>
                      {ogPrice && ogPrice > price && <span className="srch-og">{fmt(ogPrice)}</span>}
                    </div>
                    <button className="srch-cart-btn"
                      onClick={() => defaultVariant && addToCart({ id: defaultVariant.id, variantId: defaultVariant.id, name: product.name, variantLabel: defaultVariant.label || '', price, imageUrl: img || undefined }, 1)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty */}
        {!loading && query && results.length === 0 && (
          <div className="srch-empty">
            <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="var(--sf-border)" strokeWidth="1.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <h3>No products found</h3>
            <p>Try different keywords or browse our catalog.</p>
            <button className="srch-browse-btn" onClick={() => navigate('/products')}>Browse All Products</button>
          </div>
        )}

        {/* Initial state */}
        {!loading && !query && (
          <div className="srch-empty">
            <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="var(--sf-border)" strokeWidth="1.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <h3>Start searching</h3>
            <p>Type a product name, category, or brand above.</p>
          </div>
        )}
      </div>

      <style>{`
        .srch-page { min-height: 100vh; background: var(--sf-bg); font-family: var(--font-sans); padding: 40px 5% 80px; }
        .srch-inner { max-width: 1200px; margin: 0 auto; }
        .srch-hero { text-align: center; margin-bottom: 40px; }
        .srch-title { font-family: var(--font-serif); font-size: 2.2rem; color: var(--sf-text-main); margin: 0 0 24px; }
        .srch-bar-wrap { max-width: 640px; margin: 0 auto; }
        .srch-bar { display: flex; align-items: center; gap: 12px; background: #fff; border: 2px solid var(--sf-border); border-radius: 50px; padding: 12px 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); transition: border-color 0.2s, box-shadow 0.2s; }
        .srch-bar:focus-within { border-color: var(--sf-accent); box-shadow: 0 0 0 4px var(--sf-accent-light); }
        .srch-icon { color: var(--sf-text-muted); flex-shrink: 0; }
        .srch-input { flex: 1; border: none; outline: none; font-size: 1rem; font-family: var(--font-sans); color: var(--sf-text-main); background: transparent; }
        .srch-input::placeholder { color: var(--sf-text-muted); }
        .srch-clear { background: none; border: none; cursor: pointer; color: var(--sf-text-muted); display: flex; align-items: center; transition: color 0.2s; }
        .srch-clear:hover { color: var(--sf-text-main); }
        .srch-meta { margin-top: 14px; font-size: 0.88rem; color: var(--sf-text-muted); }
        .srch-loading { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 24px; }
        .srch-skeleton { height: 280px; background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%); background-size: 200% 100%; border-radius: 16px; animation: shimmer 1.4s infinite; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .srch-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 24px; }
        .srch-card { background: #fff; border: 1px solid var(--sf-border); border-radius: 18px; overflow: hidden; transition: transform 0.25s, box-shadow 0.25s; }
        .srch-card:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0,0,0,0.09); }
        .srch-card-img { position: relative; aspect-ratio: 4/3; overflow: hidden; cursor: pointer; background: var(--sf-bg); }
        .srch-card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
        .srch-card:hover .srch-card-img img { transform: scale(1.06); }
        .srch-card-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .srch-badge { position: absolute; top: 10px; left: 10px; background: #dc2626; color: #fff; font-size: 0.7rem; font-weight: 700; padding: 3px 8px; border-radius: 20px; }
        .srch-card-body { padding: 14px; display: flex; flex-direction: column; gap: 7px; }
        .srch-cat { font-size: 0.7rem; font-weight: 700; color: var(--sf-accent); text-transform: uppercase; letter-spacing: 0.06em; }
        .srch-name { font-size: 0.92rem; font-weight: 600; color: var(--sf-text-main); margin: 0; cursor: pointer; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .srch-name:hover { color: var(--sf-accent); }
        .srch-price-row { display: flex; align-items: center; gap: 8px; }
        .srch-price { font-size: 1rem; font-weight: 800; color: var(--sf-text-main); font-family: var(--font-serif); }
        .srch-og { font-size: 0.82rem; color: var(--sf-text-muted); text-decoration: line-through; }
        .srch-cart-btn { display: flex; align-items: center; gap: 7px; justify-content: center; padding: 9px 14px; background: var(--sf-accent); color: #fff; border: none; border-radius: 10px; font-size: 0.82rem; font-weight: 700; cursor: pointer; font-family: var(--font-sans); transition: background 0.2s; }
        .srch-cart-btn:hover { background: var(--sf-accent-dark, #166534); }
        .srch-empty { text-align: center; padding: 80px 20px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .srch-empty h3 { font-family: var(--font-serif); font-size: 1.4rem; color: var(--sf-text-main); margin: 0; }
        .srch-empty p { font-size: 0.9rem; color: var(--sf-text-muted); margin: 0; }
        .srch-browse-btn { padding: 12px 28px; background: var(--sf-accent); color: #fff; border: none; border-radius: 50px; font-size: 0.9rem; font-weight: 700; cursor: pointer; font-family: var(--font-sans); transition: background 0.2s; }
        .srch-browse-btn:hover { background: var(--sf-accent-dark, #166534); }
      `}</style>
    </div>
  );
};
