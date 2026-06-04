import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { catalogApi } from '@oaksol/api-client';

const IcSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IcGrid = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const IcList = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);
const IcFilter = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);
const IcCart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);
const IcStar = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IcEmpty = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

const SORT_OPTIONS = [
  { value: 'default', label: 'Default Sorting' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A → Z' },
  { value: 'name-desc', label: 'Name: Z → A' },
];

export const AllProducts: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const search = searchParams.get('q') || '';
  const categoryId = searchParams.get('cat') || '';
  const sort = searchParams.get('sort') || 'default';
  const minPrice = Number(searchParams.get('min') || 0);
  const maxPrice = Number(searchParams.get('max') || 99999);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [prodData, catData] = await Promise.all([
          catalogApi.getProducts(),
          catalogApi.getCategories(),
        ]);
        setProducts(prodData?.products || prodData || []);
        setCategories(catData || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load products.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  // Flatten categories
  const flatCats = (list: any[]): any[] =>
    list.flatMap(c => [c, ...flatCats(c.children || [])]);
  const allCats = flatCats(categories);

  // Filter + Sort
  let filtered = products.filter(p => {
    const name = (p.name || '').toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase());
    const matchCat = !categoryId || p.category_id === categoryId;
    const price = Number(p.base_price || 0);
    const matchPrice = price >= minPrice && (maxPrice >= 99999 || price <= maxPrice);
    return matchSearch && matchCat && matchPrice && p.status === 'active';
  });

  if (sort === 'price-asc') filtered.sort((a, b) => Number(a.base_price) - Number(b.base_price));
  else if (sort === 'price-desc') filtered.sort((a, b) => Number(b.base_price) - Number(a.base_price));
  else if (sort === 'name-asc') filtered.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === 'name-desc') filtered.sort((a, b) => b.name.localeCompare(a.name));

  const fmt = (v: any) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

  return (
    <div className="ap-page">

      {/* ── Page Header ── */}
      <div className="ap-header">
        <div className="ap-header-inner">
          <div>
            <h1 className="ap-title">All Products</h1>
            <p className="ap-subtitle">
              {loading ? 'Loading...' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''} found`}
            </p>
          </div>

          {/* Search */}
          <div className="ap-search-wrap">
            <span className="ap-search-icon"><IcSearch /></span>
            <input
              className="ap-search"
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setParam('q', e.target.value)}
            />
          </div>

          {/* View Toggle */}
          <div className="ap-view-toggle">
            <button
              className={`vt-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <IcGrid />
            </button>
            <button
              className={`vt-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <IcList />
            </button>
          </div>
        </div>
      </div>

      <div className="ap-layout">
        {/* ── Sidebar Filters ── */}
        <aside className="ap-sidebar">
          <div className="filter-section">
            <div className="filter-title"><IcFilter /> Categories</div>
            <div className="filter-options">
              <label className={`filter-opt ${!categoryId ? 'active' : ''}`}>
                <input type="radio" name="cat" checked={!categoryId} onChange={() => setParam('cat', '')} />
                <span>All Categories</span>
                <span className="filter-count">{products.filter(p => p.status === 'active').length}</span>
              </label>
              {allCats.map(cat => {
                const count = products.filter(p => p.category_id === cat.id && p.status === 'active').length;
                if (!count) return null;
                return (
                  <label key={cat.id} className={`filter-opt ${categoryId === cat.id ? 'active' : ''}`}>
                    <input type="radio" name="cat" checked={categoryId === cat.id} onChange={() => setParam('cat', cat.id)} />
                    <span>{cat.name}</span>
                    <span className="filter-count">{count}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-title">Sort By</div>
            <select className="filter-select" value={sort} onChange={e => setParam('sort', e.target.value)}>
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {(search || categoryId || sort !== 'default') && (
            <button
              className="filter-clear-btn"
              onClick={() => setSearchParams({})}
            >
              Clear All Filters
            </button>
          )}
        </aside>

        {/* ── Product Grid ── */}
        <div className="ap-content">
          {loading ? (
            <div className={`ap-grid${viewMode === 'list' ? ' ap-list' : ''}`}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div className="product-skeleton" key={i}>
                  <div className="sk-img" />
                  <div className="sk-line wide" />
                  <div className="sk-line medium" />
                  <div className="sk-line short" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="ap-error">
              <p>{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="ap-empty">
              <div className="ap-empty-icon"><IcEmpty /></div>
              <h3>No products found</h3>
              <p>Try adjusting your search or filters to find what you're looking for.</p>
              <button className="ap-empty-reset" onClick={() => setSearchParams({})}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={`ap-grid${viewMode === 'list' ? ' ap-list' : ''}`}>
              {filtered.map((product) => {
                const img = product.images?.[0]?.url || product.thumbnail_url || null;
                const price = Number(product.base_price || 0);
                const ogPrice = product.compare_at_price ? Number(product.compare_at_price) : null;
                const discount = ogPrice && ogPrice > price
                  ? Math.round(((ogPrice - price) / ogPrice) * 100)
                  : null;

                return (
                  <div
                    key={product.id}
                    className={`ap-card${hoveredId === product.id ? ' hovered' : ''}`}
                    onClick={() => navigate(`/products/${product.slug}`)}
                    onMouseEnter={() => setHoveredId(product.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div className="ap-card-img-wrap">
                      {img ? (
                        <img src={img} alt={product.name} className="ap-card-img" />
                      ) : (
                        <div className="ap-card-img-placeholder">
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                        </div>
                      )}
                      {discount && (
                        <span className="ap-discount-badge">-{discount}%</span>
                      )}
                      <div className="ap-card-overlay">
                        <button
                          className="ap-quick-view"
                          onClick={e => { e.stopPropagation(); navigate(`/products/${product.slug}`); }}
                        >
                          <IcCart /> View Product
                        </button>
                      </div>
                    </div>

                    <div className="ap-card-body">
                      {product.category?.name && (
                        <span className="ap-card-cat">{product.category.name}</span>
                      )}
                      <h3 className="ap-card-name">{product.name}</h3>
                      {product.short_description && viewMode === 'list' && (
                        <p className="ap-card-desc">{product.short_description}</p>
                      )}
                      <div className="ap-card-stars">
                        {[1,2,3,4,5].map(s => (
                          <span key={s} className="star-icon" style={{ color: s <= 4 ? '#f59e0b' : '#d1d5db' }}>
                            <IcStar />
                          </span>
                        ))}
                        <span className="ap-card-review-count">(4.0)</span>
                      </div>
                      <div className="ap-card-price-row">
                        <span className="ap-card-price">{fmt(price)}</span>
                        {ogPrice && ogPrice > price && (
                          <span className="ap-card-og-price">{fmt(ogPrice)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .ap-page {
          min-height: 100vh;
          background: var(--sf-bg);
          font-family: var(--font-sans);
        }

        /* ── Header ── */
        .ap-header {
          background: #fff;
          border-bottom: 1px solid var(--sf-border);
          padding: 28px 5%;
        }
        .ap-header-inner {
          max-width: 1400px; margin: 0 auto;
          display: flex; align-items: center; gap: 20px; flex-wrap: wrap;
        }
        .ap-title {
          font-family: var(--font-serif);
          font-size: 1.8rem; color: var(--sf-text-main); margin: 0;
        }
        .ap-subtitle {
          font-size: 0.85rem; color: var(--sf-text-muted); margin: 2px 0 0;
        }
        .ap-search-wrap {
          flex: 1; min-width: 200px; max-width: 400px;
          position: relative; margin-left: auto;
        }
        .ap-search-icon {
          position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
          color: var(--sf-text-muted);
          display: flex;
        }
        .ap-search {
          width: 100%; padding: 10px 14px 10px 40px;
          border: 1px solid var(--sf-border); border-radius: 50px;
          font-family: var(--font-sans); font-size: 0.9rem;
          background: var(--sf-bg); color: var(--sf-text-main);
          outline: none; transition: border-color 0.2s;
        }
        .ap-search:focus { border-color: var(--sf-accent); }
        .ap-search::placeholder { color: var(--sf-text-muted); }
        .ap-view-toggle { display: flex; gap: 4px; }
        .vt-btn {
          width: 36px; height: 36px; border-radius: 8px;
          border: 1px solid var(--sf-border);
          background: #fff; color: var(--sf-text-muted);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
        }
        .vt-btn.active, .vt-btn:hover {
          border-color: var(--sf-accent); color: var(--sf-accent); background: var(--sf-accent-light);
        }

        /* ── Layout ── */
        .ap-layout {
          max-width: 1400px; margin: 0 auto;
          padding: 32px 5% 60px;
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 32px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .ap-layout { grid-template-columns: 1fr; }
          .ap-sidebar { display: flex; flex-wrap: wrap; gap: 20px; }
          .filter-section { flex: 1; min-width: 200px; }
        }

        /* ── Sidebar ── */
        .ap-sidebar {
          display: flex; flex-direction: column; gap: 24px;
          position: sticky; top: 90px;
        }
        @media (max-width: 900px) { .ap-sidebar { position: static; } }

        .filter-section {
          background: #fff;
          border: 1px solid var(--sf-border);
          border-radius: 14px;
          padding: 20px;
        }
        .filter-title {
          font-size: 0.8rem; font-weight: 700; color: var(--sf-text-muted);
          text-transform: uppercase; letter-spacing: 0.08em;
          margin-bottom: 14px;
          display: flex; align-items: center; gap: 6px;
        }
        .filter-options { display: flex; flex-direction: column; gap: 6px; }
        .filter-opt {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 10px; border-radius: 9px; cursor: pointer;
          font-size: 0.87rem; color: var(--sf-text-muted);
          transition: background 0.15s, color 0.15s;
        }
        .filter-opt input[type=radio] { display: none; }
        .filter-opt:hover { background: var(--sf-bg); color: var(--sf-text-main); }
        .filter-opt.active { background: var(--sf-accent-light); color: var(--sf-accent); font-weight: 600; }
        .filter-opt span:first-of-type { flex: 1; }
        .filter-count {
          font-size: 0.75rem; background: var(--sf-bg); border: 1px solid var(--sf-border);
          padding: 1px 7px; border-radius: 20px; color: var(--sf-text-muted) !important;
          font-weight: 600;
        }
        .filter-opt.active .filter-count { background: var(--sf-accent); border-color: var(--sf-accent); color: #fff !important; }

        .filter-select {
          width: 100%; padding: 9px 12px;
          border: 1px solid var(--sf-border); border-radius: 9px;
          font-family: var(--font-sans); font-size: 0.87rem;
          background: var(--sf-bg); color: var(--sf-text-main);
          outline: none; cursor: pointer;
          transition: border-color 0.2s;
        }
        .filter-select:focus { border-color: var(--sf-accent); }

        .filter-clear-btn {
          width: 100%; padding: 10px; border-radius: 9px;
          border: 1px dashed #fca5a5; background: #fef2f2;
          color: #dc2626; font-size: 0.85rem; font-weight: 600;
          cursor: pointer; font-family: var(--font-sans);
          transition: background 0.2s;
        }
        .filter-clear-btn:hover { background: #fee2e2; }

        /* ── Grid ── */
        .ap-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
          gap: 22px;
        }
        .ap-list {
          grid-template-columns: 1fr !important;
        }
        .ap-list .ap-card {
          flex-direction: row; align-items: flex-start;
        }
        .ap-list .ap-card-img-wrap {
          width: 160px; flex-shrink: 0; aspect-ratio: auto; height: 160px;
        }

        /* ── Product Card ── */
        .ap-card {
          background: #fff;
          border: 1px solid var(--sf-border);
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          display: flex; flex-direction: column;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .ap-card.hovered {
          transform: translateY(-5px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.1);
          border-color: var(--sf-accent);
        }
        .ap-card-img-wrap {
          position: relative;
          aspect-ratio: 4/3;
          overflow: hidden;
          background: var(--sf-bg);
        }
        .ap-card-img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.4s ease;
        }
        .ap-card.hovered .ap-card-img { transform: scale(1.06); }
        .ap-card-img-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
        }
        .ap-discount-badge {
          position: absolute; top: 10px; left: 10px;
          background: #dc2626; color: #fff;
          font-size: 0.72rem; font-weight: 700;
          padding: 3px 8px; border-radius: 20px;
          letter-spacing: 0.03em;
        }
        .ap-card-overlay {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0.38);
          display: flex; align-items: flex-end; justify-content: center;
          padding-bottom: 16px;
          opacity: 0; transition: opacity 0.25s ease;
        }
        .ap-card.hovered .ap-card-overlay { opacity: 1; }
        .ap-quick-view {
          display: flex; align-items: center; gap: 8px;
          background: #fff; color: var(--sf-text-main);
          border: none; padding: 9px 18px; border-radius: 50px;
          font-size: 0.83rem; font-weight: 700; cursor: pointer;
          font-family: var(--font-sans);
          transform: translateY(8px); transition: transform 0.25s ease;
          transition: background 0.2s;
        }
        .ap-card.hovered .ap-quick-view { transform: translateY(0); }
        .ap-quick-view:hover { background: var(--sf-accent); color: #fff; }

        .ap-card-body {
          padding: 16px; display: flex; flex-direction: column; gap: 6px; flex: 1;
        }
        .ap-card-cat {
          font-size: 0.72rem; font-weight: 700; color: var(--sf-accent);
          text-transform: uppercase; letter-spacing: 0.06em;
        }
        .ap-card-name {
          font-size: 0.97rem; font-weight: 600; color: var(--sf-text-main);
          line-height: 1.35;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .ap-card-desc {
          font-size: 0.85rem; color: var(--sf-text-muted); line-height: 1.5;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .ap-card-stars {
          display: flex; align-items: center; gap: 2px;
        }
        .star-icon { display: flex; }
        .ap-card-review-count { font-size: 0.75rem; color: var(--sf-text-muted); margin-left: 4px; }
        .ap-card-price-row {
          display: flex; align-items: center; gap: 8px; margin-top: 4px;
        }
        .ap-card-price {
          font-size: 1.05rem; font-weight: 800; color: var(--sf-text-main);
          font-family: var(--font-serif);
        }
        .ap-card-og-price {
          font-size: 0.85rem; color: var(--sf-text-muted); text-decoration: line-through;
        }

        /* ── Skeletons ── */
        .product-skeleton {
          background: #fff; border: 1px solid var(--sf-border); border-radius: 16px; overflow: hidden;
        }
        .sk-img { aspect-ratio: 4/3; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        .sk-line { height: 12px; border-radius: 6px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; margin: 8px 16px 0; }
        .sk-line.wide { width: calc(100% - 32px); }
        .sk-line.medium { width: 60%; margin-bottom: 4px; }
        .sk-line.short { width: 35%; margin-bottom: 16px; }
        @keyframes shimmer { to { background-position: -200% 0; } }

        /* ── Empty / Error ── */
        .ap-empty {
          grid-column: 1 / -1;
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 80px 20px; text-align: center; gap: 14px;
        }
        .ap-empty-icon { color: var(--sf-border); }
        .ap-empty h3 { font-family: var(--font-serif); font-size: 1.4rem; color: var(--sf-text-main); }
        .ap-empty p { font-size: 0.9rem; color: var(--sf-text-muted); max-width: 320px; }
        .ap-empty-reset {
          margin-top: 6px; padding: 10px 24px; border-radius: 50px;
          border: 1px solid var(--sf-accent); background: var(--sf-accent-light);
          color: var(--sf-accent); font-size: 0.88rem; font-weight: 600;
          cursor: pointer; font-family: var(--font-sans);
        }
        .ap-error { padding: 60px; text-align: center; color: #dc2626; }

        @media (max-width: 640px) {
          .ap-header-inner { flex-direction: column; align-items: flex-start; }
          .ap-search-wrap { width: 100%; max-width: 100%; margin-left: 0; }
          .ap-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
        }
      `}</style>
    </div>
  );
};
