import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { catalogApi } from '@oaksol/api-client';
import { useCart } from '../../context/CartContext';

export const Product: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const galleryRef = useRef<HTMLDivElement>(null);

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI States
  const [activeImg, setActiveImg] = useState<string>('');
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<string>('');
  const [faqOpen, setFaqOpen] = useState<Record<string, boolean>>({});
  const [addedToCart, setAddedToCart] = useState(false);
  const [imgZoomed, setImgZoomed] = useState(false);

  // Stock information helper based on selected variant
  const stockInfo = (() => {
    if (selectedVariant) {
      const qty = selectedVariant.stock_qty;
      const lowAt = selectedVariant.low_stock_at ?? 5;
      if (qty <= 0) {
        return { status: 'out_of_stock', text: '🚨 Out of Stock', color: '#DC2626', disabled: true, maxQty: 0 };
      } else if (qty <= lowAt) {
        return { status: 'low_stock', text: `⚠️ Only ${qty} left!`, color: '#D97706', disabled: false, maxQty: qty };
      } else {
        return { status: 'in_stock', text: `✓ In Stock (${qty} available)`, color: '#16A34A', disabled: false, maxQty: qty };
      }
    }
    // Fallback if no variants exist
    return { status: 'in_stock', text: '✓ In Stock', color: '#16A34A', disabled: false };
  })();

  // Keep quantity inside valid range when variant changes
  useEffect(() => {
    if (selectedVariant) {
      const qty = selectedVariant.stock_qty;
      if (qty <= 0) {
        setQuantity(0);
      } else {
        setQuantity(prev => {
          if (prev > qty) return qty;
          if (prev < 1) return 1;
          return prev;
        });
      }
    } else {
      setQuantity(prev => (prev < 1 ? 1 : prev));
    }
  }, [selectedVariant]);

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const data = await catalogApi.getProduct(slug);
        setProduct(data.product);

        if (data.product.gallery && data.product.gallery.length > 0) {
          const coverImg = data.product.gallery.find((g: any) => g.is_cover) || data.product.gallery[0];
          setActiveImg(coverImg.url);
          setActiveImgIdx(data.product.gallery.indexOf(coverImg));
        }

        if (data.product.variants && data.product.variants.length > 0) {
          setSelectedVariant(data.product.variants[0]);
        }

        const customSecs = data.product.custom_sections || [];
        if (customSecs.length > 0) {
          setActiveTab(customSecs[0].id);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="pdp-loading">
        <div className="pdp-spinner"></div>
        <p>Loading product...</p>
        <style>{`
          .pdp-loading {
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            min-height: 60vh; gap: 20px; color: #6B7280;
          }
          .pdp-spinner {
            width: 48px; height: 48px;
            border: 3px solid #E5E7EB;
            border-top-color: #15803D;
            border-radius: 50%;
            animation: pdp-spin 0.8s linear infinite;
          }
          @keyframes pdp-spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pdp-error">
        <div className="pdp-error-icon">🌿</div>
        <h3>Product Not Found</h3>
        <p>{error || 'The requested product does not exist.'}</p>
        <button onClick={() => navigate('/')}>← Back to Home</button>
        <style>{`
          .pdp-error { display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:16px;text-align:center;padding:40px; }
          .pdp-error-icon { font-size:3rem; }
          .pdp-error h3 { font-size:1.5rem;color:#1F2937;font-weight:700; }
          .pdp-error p { color:#6B7280;max-width:400px; }
          .pdp-error button { background:#15803D;color:#fff;border:none;padding:12px 28px;border-radius:8px;cursor:pointer;font-weight:600;font-size:0.95rem; }
        `}</style>
      </div>
    );
  }

  const customSections = (() => {
    let secs = product.custom_sections || [];
    if (typeof secs === 'string') {
      try { secs = JSON.parse(secs); } catch { secs = []; }
    }
    return secs;
  })();

  const gallery = product.gallery || [];
  const discountPct = product.compare_price
    ? Math.round((1 - Number(product.price) / Number(product.compare_price)) * 100)
    : 0;

  const handleAddToCart = () => {
    if (stockInfo.disabled) return;
    if (!selectedVariant && product.variants?.length > 0) return;
    addToCart({
      id: product.id,
      variantId: selectedVariant?.id || product.id,
      name: product.name,
      variantLabel: selectedVariant?.label || '1 Unit',
      price: Number(selectedVariant?.price || product.price),
      imageUrl: activeImg
    }, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const toggleFaq = (id: string) => {
    setFaqOpen(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const prevImg = () => {
    if (gallery.length < 2) return;
    const idx = (activeImgIdx - 1 + gallery.length) % gallery.length;
    setActiveImgIdx(idx);
    setActiveImg(gallery[idx].url);
  };

  const nextImg = () => {
    if (gallery.length < 2) return;
    const idx = (activeImgIdx + 1) % gallery.length;
    setActiveImgIdx(idx);
    setActiveImg(gallery[idx].url);
  };

  return (
    <div className="pdp-page">

      {/* ── BREADCRUMB ───────────────────────────────── */}
      <nav className="pdp-breadcrumb">
        <span onClick={() => navigate('/')}>Home</span>
        <span className="pdp-bc-sep">›</span>
        {product.category && (
          <>
            <span onClick={() => navigate(`/categories/${product.category.slug}`)}>{product.category.name}</span>
            <span className="pdp-bc-sep">›</span>
          </>
        )}
        <span className="pdp-bc-current">{product.name}</span>
      </nav>

      {/* ── HERO GRID ────────────────────────────────── */}
      <div className="pdp-hero-grid">

        {/* LEFT: Gallery */}
        <div className="pdp-gallery" ref={galleryRef}>
          {/* Thumbnails (vertical) */}
          {gallery.length > 1 && (
            <div className="pdp-thumbs">
              {gallery.map((img: any, idx: number) => (
                <div
                  key={img.id || idx}
                  className={`pdp-thumb ${activeImgIdx === idx ? 'active' : ''}`}
                  onClick={() => { setActiveImg(img.url); setActiveImgIdx(idx); }}
                >
                  <img src={img.url} alt={img.alt_text || `view ${idx + 1}`} />
                </div>
              ))}
            </div>
          )}

          {/* Main image */}
          <div className="pdp-main-img-wrap">
            {discountPct > 0 && (
              <span className="pdp-discount-badge">-{discountPct}%</span>
            )}
            {gallery.length > 1 && (
              <>
                <button className="pdp-img-nav pdp-img-nav-prev" onClick={prevImg} aria-label="Previous">‹</button>
                <button className="pdp-img-nav pdp-img-nav-next" onClick={nextImg} aria-label="Next">›</button>
              </>
            )}
            {activeImg ? (
              <img
                src={activeImg}
                alt={product.name}
                className={`pdp-main-img ${imgZoomed ? 'zoomed' : ''}`}
                onClick={() => setImgZoomed(!imgZoomed)}
                onError={(e) => {
                  (e.target as any).src = 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=80';
                }}
              />
            ) : (
              <div className="pdp-no-img">
                <span>🌿</span>
                <p>No image available</p>
              </div>
            )}
            {gallery.length > 1 && (
              <div className="pdp-img-dots">
                {gallery.map((_: any, idx: number) => (
                  <button
                    key={idx}
                    className={`pdp-dot ${activeImgIdx === idx ? 'active' : ''}`}
                    onClick={() => { setActiveImg(gallery[idx].url); setActiveImgIdx(idx); }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Info */}
        <div className="pdp-info">
          {/* Category + Brand pill */}
          <div className="pdp-pills">
            {product.category && (
              <span className="pdp-pill pdp-pill-cat" onClick={() => navigate(`/categories/${product.category.slug}`)}>
                {product.category.name}
              </span>
            )}
            {product.brand && (
              <span className="pdp-pill pdp-pill-brand">{product.brand.name}</span>
            )}
          </div>

          <h1 className="pdp-name">{product.name}</h1>

          {/* Rating bar */}
          <div className="pdp-rating">
            <div className="pdp-stars">
              {[1,2,3,4,5].map(i => (
                <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill={i <= 4 ? '#F59E0B' : '#D1D5DB'} xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>
            <span className="pdp-rating-count">{product.reviews?.length || 0} reviews</span>
            <span 
              className="pdp-in-stock"
              style={{
                color: stockInfo.color,
                background: `${stockInfo.color}15`,
                borderColor: `${stockInfo.color}35`,
                border: '1.5px solid'
              }}
            >
              {stockInfo.text}
            </span>
          </div>

          {/* Price block */}
          <div className="pdp-price-block">
            <span className="pdp-price">₹{Number(selectedVariant?.price || product.price).toFixed(2)}</span>
            {product.compare_price && (
              <>
                <span className="pdp-compare">₹{Number(product.compare_price).toFixed(2)}</span>
                <span className="pdp-save-tag">Save ₹{(Number(product.compare_price) - Number(selectedVariant?.price || product.price)).toFixed(0)}</span>
              </>
            )}
          </div>

          {/* Short description */}
          {product.short_desc && (
            <p className="pdp-short-desc">{product.short_desc}</p>
          )}

          {/* Divider */}
          <hr className="pdp-divider" />

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="pdp-variants">
              <p className="pdp-variants-label">
                Size / Pack: <strong>{selectedVariant?.label || '—'}</strong>
              </p>
              <div className="pdp-variants-grid">
                {product.variants.map((v: any) => (
                  <button
                    key={v.id}
                    className={`pdp-variant-btn ${selectedVariant?.id === v.id ? 'active' : ''} ${v.stock_qty <= 0 ? 'out-of-stock' : ''}`}
                    onClick={() => {
                      setSelectedVariant(v);
                      if (v.image_url) { setActiveImg(v.image_url); }
                    }}
                  >
                    {v.label}
                    {v.stock_qty <= 0 ? ' (Out of Stock)' : ''}
                    {v.price && Number(v.price) !== Number(product.price) && (
                      <span className="pdp-variant-price"> · ₹{Number(v.price).toFixed(0)}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Actions */}
          <div className="pdp-actions-row">
            <div className="pdp-qty">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={stockInfo.disabled || quantity <= 1}
              >
                −
              </button>
              <span>{quantity}</span>
              <button 
                onClick={() => setQuantity(q => {
                  if (stockInfo.maxQty !== undefined && q >= stockInfo.maxQty) {
                    return stockInfo.maxQty;
                  }
                  return q + 1;
                })}
                disabled={stockInfo.disabled || (stockInfo.maxQty !== undefined && quantity >= stockInfo.maxQty)}
              >
                +
              </button>
            </div>

            <button
              className={`pdp-btn-cart ${addedToCart ? 'success' : ''}`}
              onClick={handleAddToCart}
              disabled={stockInfo.disabled}
            >
              {addedToCart ? (
                <>✓ Added to Cart</>
              ) : stockInfo.disabled ? (
                <>Sold Out</>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  Add to Cart
                </>
              )}
            </button>

            <button
              className="pdp-btn-buy"
              onClick={() => { handleAddToCart(); navigate('/checkout'); }}
              disabled={stockInfo.disabled}
            >
              {stockInfo.disabled ? 'Out of Stock' : 'Buy Now →'}
            </button>
          </div>

          {/* Trust badges */}
          <div className="pdp-trust-bar">
            {[
              { icon: '🌿', label: '100% Natural' },
              { icon: '✓', label: 'GMP Certified' },
              { icon: '🚚', label: 'Free Delivery' },
              { icon: '↩', label: 'Easy Returns' },
            ].map(b => (
              <div key={b.label} className="pdp-trust-item">
                <span className="pdp-trust-icon">{b.icon}</span>
                <span>{b.label}</span>
              </div>
            ))}
          </div>

          {/* SKU */}
          {product.master_sku && (
            <p className="pdp-sku">SKU: <code>{product.master_sku}</code></p>
          )}
        </div>
      </div>

      {/* ── DESCRIPTION ──────────────────────────────── */}
      {product.description && (
        <div className="pdp-description-section">
          <div className="pdp-section-label">About this product</div>
          <p className="pdp-description">{product.description}</p>
        </div>
      )}

      {/* ── CUSTOM SECTIONS TABS ─────────────────────── */}
      {customSections.length > 0 && (
        <div className="pdp-tabs-block">
          <div className="pdp-tabs-nav">
            {customSections.map((sec: any) => (
              <button
                key={sec.id}
                className={`pdp-tab-btn ${activeTab === sec.id ? 'active' : ''}`}
                onClick={() => setActiveTab(sec.id)}
              >
                {sec.title}
              </button>
            ))}
          </div>

          <div className="pdp-tab-body">
            {customSections.map((sec: any) => {
              if (activeTab !== sec.id) return null;

              if (sec.type === 'bullets') {
                return (
                  <div key={sec.id} className="pdp-tab-content pdp-anim">
                    <ul className="pdp-bullets">
                      {(sec.content || []).map((bullet: string, idx: number) => (
                        <li key={idx}>
                          <span className="pdp-bullet-check">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                          </span>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              }

              if (sec.type === 'cards') {
                return (
                  <div key={sec.id} className="pdp-tab-content pdp-anim">
                    <div className="pdp-cards-grid">
                      {(sec.content || []).map((card: any, idx: number) => (
                        <div key={idx} className="pdp-ing-card">
                          {card.image_url ? (
                            <img src={card.image_url} alt={card.name} className="pdp-ing-img" />
                          ) : (
                            <div className="pdp-ing-placeholder">🌿</div>
                          )}
                          <h4>{card.name}</h4>
                          <p>{card.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              if (sec.type === 'details') {
                const d = sec.content || {};
                return (
                  <div key={sec.id} className="pdp-tab-content pdp-anim">
                    <div className="pdp-details-grid">
                      <div className="pdp-details-col">
                        {d.frequency && (
                          <div className="pdp-detail-row">
                            <span className="pdp-detail-label">🕐 Frequency</span>
                            <span>{d.frequency}</span>
                          </div>
                        )}
                        {d.follow_up && (
                          <div className="pdp-detail-row">
                            <span className="pdp-detail-label">💡 Follow-up Tips</span>
                            <span>{d.follow_up}</span>
                          </div>
                        )}
                        {d.shelf_life && (
                          <div className="pdp-detail-row">
                            <span className="pdp-detail-label">📦 Storage</span>
                            <span>{d.shelf_life}</span>
                          </div>
                        )}
                        {d.results && d.results.length > 0 && (
                          <div className="pdp-detail-row">
                            <span className="pdp-detail-label">✨ Expected Results</span>
                            <ul className="pdp-results-list">
                              {d.results.map((r: string, i: number) => <li key={i}>{r}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                      {d.image_url && (
                        <img src={d.image_url} alt="Usage" className="pdp-details-side-img" />
                      )}
                    </div>
                  </div>
                );
              }

              if (sec.type === 'steps') {
                return (
                  <div key={sec.id} className="pdp-tab-content pdp-anim">
                    <div className="pdp-steps-wrap">
                      {(sec.content || []).map((step: any, idx: number) => (
                        <div key={step.step || idx} className="pdp-step">
                          <div className="pdp-step-num">{step.step}</div>
                          <div className="pdp-step-line" />
                          <div className="pdp-step-info">
                            <h5>{step.title}</h5>
                            <p>{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      )}

      {/* ── FAQs ─────────────────────────────────────── */}
      {product.faqs && product.faqs.length > 0 && (
        <div className="pdp-faqs-section">
          <h2 className="pdp-section-title">Frequently Asked Questions</h2>
          <div className="pdp-faqs-list">
            {product.faqs.map((faq: any, idx: number) => (
              <div key={faq.id || idx} className={`pdp-faq-item ${faqOpen[faq.id] ? 'open' : ''}`}>
                <button className="pdp-faq-q" onClick={() => toggleFaq(faq.id)}>
                  <span>{faq.question}</span>
                  <svg
                    className="pdp-faq-icon"
                    width="20" height="20" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                  >
                    <polyline points={faqOpen[faq.id] ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
                  </svg>
                </button>
                <div className="pdp-faq-a">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── REVIEWS ──────────────────────────────────── */}
      <div className="pdp-reviews-section">
        <div className="pdp-reviews-header">
          <h2 className="pdp-section-title">Customer Reviews</h2>
          {product.reviews && product.reviews.length > 0 && (
            <div className="pdp-reviews-summary">
              <span className="pdp-reviews-avg">4.8</span>
              <div>
                <div className="pdp-stars-sm">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i <= 4 ? '#F59E0B' : '#D1D5DB'}>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <span className="pdp-reviews-count-sm">{product.reviews.length} verified reviews</span>
              </div>
            </div>
          )}
        </div>

        {product.reviews && product.reviews.length > 0 ? (
          <div className="pdp-reviews-grid">
            {product.reviews.map((rev: any) => (
              <div key={rev.id} className="pdp-review-card">
                <div className="pdp-review-top">
                  <div className="pdp-reviewer-avatar">
                    {(rev.reviewer_name || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="pdp-reviewer-name">{rev.reviewer_name || 'Verified Buyer'}</p>
                    <div className="pdp-review-stars">
                      {'★'.repeat(rev.rating || 5)}{'☆'.repeat(5 - (rev.rating || 5))}
                    </div>
                  </div>
                  <span className="pdp-review-date">
                    {new Date(rev.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                {rev.title && <h4 className="pdp-review-title">{rev.title}</h4>}
                <p className="pdp-review-body">{rev.body}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="pdp-no-reviews">
            <span>🌟</span>
            <p>No reviews yet. Be the first to purchase and share your experience!</p>
          </div>
        )}
      </div>

      {/* ── STYLES ───────────────────────────────────── */}
      <style>{`
        /* ─── Page Shell ───────────────────────────── */
        .pdp-page {
          background: var(--sf-bg, #FAF7F2);
          min-height: 100vh;
          padding: 0 0 80px 0;
          font-family: var(--font-sans, 'Inter', sans-serif);
        }

        /* ─── Breadcrumb ───────────────────────────── */
        .pdp-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 18px 5%;
          font-size: 0.82rem;
          color: #6B7280;
          flex-wrap: wrap;
        }
        .pdp-breadcrumb span:not(.pdp-bc-sep):not(.pdp-bc-current) {
          cursor: pointer;
          transition: color 0.2s;
        }
        .pdp-breadcrumb span:not(.pdp-bc-sep):not(.pdp-bc-current):hover { color: #15803D; }
        .pdp-bc-sep { opacity: 0.5; }
        .pdp-bc-current { color: #1F2937; font-weight: 600; }

        /* ─── Hero Grid ────────────────────────────── */
        .pdp-hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          padding: 20px 5% 60px;
          align-items: start;
        }

        /* ─── Gallery ──────────────────────────────── */
        .pdp-gallery {
          display: flex;
          gap: 14px;
          position: sticky;
          top: 90px;
        }

        .pdp-thumbs {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .pdp-thumb {
          width: 68px;
          height: 68px;
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          transition: border-color 0.2s, transform 0.2s;
          flex-shrink: 0;
        }
        .pdp-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .pdp-thumb:hover { border-color: #15803D; transform: scale(1.04); }
        .pdp-thumb.active { border-color: #15803D; }

        .pdp-main-img-wrap {
          flex: 1;
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          background: #FFFFFF;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          aspect-ratio: 1;
          max-height: 560px;
        }

        .pdp-main-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          cursor: zoom-in;
          transition: transform 0.4s ease;
        }
        .pdp-main-img.zoomed {
          transform: scale(1.12);
          cursor: zoom-out;
        }

        .pdp-no-img {
          width: 100%; height: 100%;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 12px; color: #9CA3AF;
          font-size: 3rem;
        }

        .pdp-discount-badge {
          position: absolute;
          top: 16px; left: 16px;
          background: #DC2626;
          color: #fff;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 6px;
          z-index: 2;
          letter-spacing: 0.03em;
        }

        .pdp-img-nav {
          position: absolute;
          top: 50%; transform: translateY(-50%);
          background: rgba(255,255,255,0.9);
          border: none;
          width: 40px; height: 40px;
          border-radius: 50%;
          font-size: 1.5rem;
          cursor: pointer;
          z-index: 3;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 12px rgba(0,0,0,0.12);
          transition: background 0.2s, transform 0.2s;
          color: #1F2937;
          line-height: 1;
        }
        .pdp-img-nav:hover { background: #fff; transform: translateY(-50%) scale(1.08); }
        .pdp-img-nav-prev { left: 12px; }
        .pdp-img-nav-next { right: 12px; }

        .pdp-img-dots {
          position: absolute;
          bottom: 14px; left: 50%; transform: translateX(-50%);
          display: flex; gap: 6px; z-index: 2;
        }
        .pdp-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          border: none;
          background: rgba(255,255,255,0.5);
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
          padding: 0;
        }
        .pdp-dot.active { background: #fff; transform: scale(1.3); }

        /* ─── Product Info ──────────────────────────── */
        .pdp-info {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .pdp-pills {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .pdp-pill {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 99px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .pdp-pill-cat {
          background: #DCFCE7;
          color: #15803D;
          cursor: pointer;
        }
        .pdp-pill-cat:hover { background: #BBF7D0; }
        .pdp-pill-brand { background: #FEF3C7; color: #92400E; }

        .pdp-name {
          font-family: var(--font-serif, 'Playfair Display', serif);
          font-size: 2.4rem;
          line-height: 1.2;
          color: #111827;
          margin: 0;
          font-weight: 700;
        }

        .pdp-rating {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .pdp-stars { display: flex; gap: 2px; }
        .pdp-rating-count { font-size: 0.85rem; color: #6B7280; }
        .pdp-in-stock { 
          font-size: 0.8rem; font-weight: 600; color: #15803D;
          background: #DCFCE7; padding: 3px 10px; border-radius: 99px;
        }

        .pdp-price-block {
          display: flex;
          align-items: baseline;
          gap: 12px;
          flex-wrap: wrap;
        }
        .pdp-price {
          font-size: 2rem;
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.02em;
        }
        .pdp-compare {
          font-size: 1.1rem;
          color: #9CA3AF;
          text-decoration: line-through;
        }
        .pdp-save-tag {
          background: #DCFCE7;
          color: #15803D;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 99px;
        }

        .pdp-short-desc {
          font-size: 1rem;
          color: #4B5563;
          line-height: 1.7;
          margin: 0;
        }

        .pdp-divider {
          border: none;
          border-top: 1px solid #E5E7EB;
          margin: 4px 0;
        }

        /* ─── Variants ─────────────────────────────── */
        .pdp-variants { display: flex; flex-direction: column; gap: 12px; }
        .pdp-variants-label {
          font-size: 0.9rem;
          color: #374151;
          margin: 0;
        }
        .pdp-variants-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .pdp-variant-btn {
          padding: 9px 18px;
          border-radius: 8px;
          border: 1.5px solid #D1D5DB;
          background: #fff;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          color: #374151;
        }
        .pdp-variant-btn:hover { border-color: #15803D; color: #15803D; }
        .pdp-variant-btn.active {
          border-color: #15803D;
          background: #15803D;
          color: #fff;
          font-weight: 600;
        }
        .pdp-variant-price { font-size: 0.8rem; opacity: 0.8; }

        /* ─── Actions Row ───────────────────────────── */
        .pdp-actions-row {
          display: flex;
          gap: 12px;
          align-items: stretch;
          flex-wrap: wrap;
        }

        .pdp-qty {
          display: flex;
          align-items: center;
          border: 1.5px solid #D1D5DB;
          border-radius: 10px;
          overflow: hidden;
          background: #fff;
        }
        .pdp-qty button {
          width: 42px; height: 48px;
          border: none; background: none;
          font-size: 1.3rem;
          cursor: pointer;
          color: #374151;
          transition: background 0.15s;
        }
        .pdp-qty button:hover { background: #F3F4F6; }
        .pdp-qty span {
          width: 36px; text-align: center;
          font-weight: 700; font-size: 1rem;
          color: #111827;
        }

        .pdp-btn-cart {
          flex: 1;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 0 24px;
          height: 50px;
          background: #111827;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          min-width: 160px;
        }
        .pdp-btn-cart:hover:not(:disabled) { background: #1F2937; transform: translateY(-1px); }
        .pdp-btn-cart.success { background: #15803D; }
        .pdp-btn-cart:disabled {
          background: #E5E7EB;
          color: #9CA3AF;
          cursor: not-allowed;
          transform: none;
        }

        .pdp-btn-buy {
          padding: 0 28px;
          height: 50px;
          background: #15803D;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.02em;
          transition: background 0.2s, transform 0.15s;
          white-space: nowrap;
        }
        .pdp-btn-buy:hover:not(:disabled) { background: #166534; transform: translateY(-1px); }
        .pdp-btn-buy:disabled {
          background: #E5E7EB;
          color: #9CA3AF;
          cursor: not-allowed;
          transform: none;
        }
        .pdp-variant-btn.out-of-stock {
          text-decoration: line-through;
          opacity: 0.6;
          border-style: dashed;
        }

        /* ─── Trust Bar ─────────────────────────────── */
        .pdp-trust-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 16px;
          background: #F9FAFB;
        }
        .pdp-trust-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #374151;
          text-align: center;
        }
        .pdp-trust-icon { font-size: 1.3rem; }

        .pdp-sku {
          font-size: 0.78rem;
          color: #9CA3AF;
          margin: 0;
        }
        .pdp-sku code { font-size: 0.78rem; background: #F3F4F6; padding: 2px 6px; border-radius: 4px; }

        /* ─── Description Section ───────────────────── */
        .pdp-description-section {
          margin: 0 5% 60px;
          padding: 36px;
          background: #fff;
          border-radius: 20px;
          border: 1px solid #E5E7EB;
        }
        .pdp-section-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #15803D;
          margin-bottom: 14px;
        }
        .pdp-description {
          font-size: 1rem;
          color: #4B5563;
          line-height: 1.8;
          margin: 0;
          white-space: pre-line;
        }

        /* ─── Custom Tabs Block ─────────────────────── */
        .pdp-tabs-block {
          margin: 0 5% 60px;
          background: #fff;
          border-radius: 20px;
          border: 1px solid #E5E7EB;
          overflow: hidden;
          box-shadow: 0 2px 20px rgba(0,0,0,0.04);
        }

        .pdp-tabs-nav {
          display: flex;
          border-bottom: 1px solid #E5E7EB;
          background: #F9FAFB;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .pdp-tabs-nav::-webkit-scrollbar { display: none; }

        .pdp-tab-btn {
          flex-shrink: 0;
          padding: 16px 28px;
          border: none;
          background: transparent;
          font-size: 0.95rem;
          font-weight: 600;
          color: #6B7280;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
          font-family: inherit;
          white-space: nowrap;
        }
        .pdp-tab-btn:hover { color: #111827; background: #F3F4F6; }
        .pdp-tab-btn.active {
          color: #15803D;
          border-bottom-color: #15803D;
          background: #fff;
        }

        .pdp-tab-body { padding: 36px; }

        .pdp-anim {
          animation: pdp-fade-in 0.3s ease;
        }
        @keyframes pdp-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Bullets Tab */
        .pdp-bullets {
          list-style: none;
          margin: 0; padding: 0;
          display: flex; flex-direction: column; gap: 14px;
        }
        .pdp-bullets li {
          display: flex; align-items: flex-start; gap: 12px;
          font-size: 1rem; color: #374151; line-height: 1.5;
        }
        .pdp-bullet-check {
          flex-shrink: 0;
          width: 24px; height: 24px;
          background: #DCFCE7;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin-top: 1px;
        }

        /* Cards Tab */
        .pdp-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }
        .pdp-ing-card {
          background: #F9FAFB;
          border: 1px solid #E5E7EB;
          border-radius: 14px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 12px;
          transition: box-shadow 0.2s;
        }
        .pdp-ing-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .pdp-ing-img {
          width: 72px; height: 72px;
          object-fit: cover;
          border-radius: 50%;
          border: 3px solid #DCFCE7;
        }
        .pdp-ing-placeholder {
          width: 72px; height: 72px;
          background: #DCFCE7;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 2rem;
        }
        .pdp-ing-card h4 { font-size: 1rem; font-weight: 700; color: #111827; margin: 0; }
        .pdp-ing-card p { font-size: 0.85rem; color: #6B7280; margin: 0; line-height: 1.5; }

        /* Details Tab */
        .pdp-details-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 36px;
          align-items: center;
        }
        .pdp-details-col { display: flex; flex-direction: column; gap: 24px; }
        .pdp-detail-row { display: flex; flex-direction: column; gap: 6px; }
        .pdp-detail-label {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #15803D;
        }
        .pdp-detail-row span { font-size: 1rem; color: #374151; }
        .pdp-results-list {
          margin: 4px 0 0 0;
          padding-left: 20px;
          display: flex; flex-direction: column; gap: 4px;
        }
        .pdp-results-list li { font-size: 0.95rem; color: #374151; }
        .pdp-details-side-img {
          width: 100%; border-radius: 16px;
          object-fit: cover; max-height: 260px;
        }

        /* Steps Tab */
        .pdp-steps-wrap { display: flex; flex-direction: column; gap: 0; }
        .pdp-step {
          display: flex;
          gap: 20px;
          align-items: flex-start;
          position: relative;
          padding-bottom: 28px;
        }
        .pdp-step:last-child { padding-bottom: 0; }
        .pdp-step-num {
          flex-shrink: 0;
          width: 40px; height: 40px;
          background: #15803D;
          color: #fff;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 1rem;
          z-index: 1;
          position: relative;
        }
        .pdp-step-line {
          position: absolute;
          left: 20px; top: 40px; bottom: 0;
          width: 2px;
          background: #E5E7EB;
          transform: translateX(-50%);
        }
        .pdp-step:last-child .pdp-step-line { display: none; }
        .pdp-step-info { padding-top: 6px; }
        .pdp-step-info h5 { font-size: 1rem; font-weight: 700; color: #111827; margin: 0 0 6px; }
        .pdp-step-info p { font-size: 0.9rem; color: #6B7280; margin: 0; line-height: 1.55; }

        /* ─── FAQs ──────────────────────────────────── */
        .pdp-faqs-section {
          margin: 0 5% 60px;
        }
        .pdp-section-title {
          font-family: var(--font-serif, 'Playfair Display', serif);
          font-size: 1.8rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 28px;
        }
        .pdp-faqs-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .pdp-faq-item {
          border: 1px solid #E5E7EB;
          border-radius: 14px;
          background: #fff;
          overflow: hidden;
          transition: box-shadow 0.2s;
        }
        .pdp-faq-item.open { box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
        .pdp-faq-q {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          padding: 20px 24px;
          background: transparent;
          border: none;
          text-align: left;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
          font-family: inherit;
          transition: background 0.15s;
        }
        .pdp-faq-q:hover { background: #F9FAFB; }
        .pdp-faq-icon { flex-shrink: 0; color: #6B7280; transition: transform 0.2s; }
        .pdp-faq-item.open .pdp-faq-icon { color: #15803D; }
        .pdp-faq-a {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease, padding 0.3s ease;
          padding: 0 24px;
        }
        .pdp-faq-item.open .pdp-faq-a {
          max-height: 400px;
          padding: 0 24px 20px;
        }
        .pdp-faq-a p {
          margin: 0;
          color: #6B7280;
          line-height: 1.7;
          font-size: 0.95rem;
        }

        /* ─── Reviews ───────────────────────────────── */
        .pdp-reviews-section {
          margin: 0 5%;
          padding-top: 60px;
          border-top: 1px solid #E5E7EB;
        }
        .pdp-reviews-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }
        .pdp-reviews-summary {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #F9FAFB;
          border: 1px solid #E5E7EB;
          border-radius: 14px;
          padding: 14px 20px;
        }
        .pdp-reviews-avg {
          font-size: 2.5rem;
          font-weight: 800;
          color: #111827;
          line-height: 1;
        }
        .pdp-stars-sm { display: flex; gap: 2px; }
        .pdp-reviews-count-sm { font-size: 0.8rem; color: #6B7280; margin-top: 4px; display: block; }

        .pdp-reviews-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        .pdp-review-card {
          background: #fff;
          border: 1px solid #E5E7EB;
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: box-shadow 0.2s;
        }
        .pdp-review-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .pdp-review-top {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .pdp-reviewer-avatar {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #15803D, #22C55E);
          color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 1rem;
          flex-shrink: 0;
        }
        .pdp-reviewer-name { font-size: 0.9rem; font-weight: 600; color: #111827; margin: 0; }
        .pdp-review-stars { color: #F59E0B; font-size: 0.85rem; }
        .pdp-review-date { margin-left: auto; font-size: 0.75rem; color: #9CA3AF; white-space: nowrap; }
        .pdp-review-title { font-size: 0.95rem; font-weight: 700; color: #111827; margin: 0; }
        .pdp-review-body { font-size: 0.9rem; color: #4B5563; line-height: 1.6; margin: 0; }

        .pdp-no-reviews {
          display: flex; flex-direction: column; align-items: center; gap: 14px;
          padding: 60px 20px;
          text-align: center;
          color: #9CA3AF;
        }
        .pdp-no-reviews span { font-size: 2.5rem; }
        .pdp-no-reviews p { font-size: 1rem; max-width: 380px; margin: 0; }

        /* ─── Responsive ────────────────────────────── */
        @media (max-width: 1024px) {
          .pdp-hero-grid { grid-template-columns: 1fr 1fr; gap: 36px; }
          .pdp-name { font-size: 2rem; }
        }

        @media (max-width: 768px) {
          .pdp-hero-grid {
            grid-template-columns: 1fr;
            gap: 24px;
            padding: 12px 4% 40px;
          }
          .pdp-gallery { position: static; }
          .pdp-thumbs { flex-direction: row; }
          .pdp-thumb { width: 60px; height: 60px; }
          .pdp-name { font-size: 1.75rem; }
          .pdp-price { font-size: 1.6rem; }
          .pdp-actions-row { flex-direction: column; }
          .pdp-btn-cart, .pdp-btn-buy { width: 100%; height: 50px; }
          .pdp-trust-bar { grid-template-columns: repeat(2, 1fr); }
          .pdp-description-section { margin: 0 4% 40px; padding: 24px; }
          .pdp-tabs-block { margin: 0 4% 40px; }
          .pdp-tab-body { padding: 24px 20px; }
          .pdp-details-grid { grid-template-columns: 1fr; }
          .pdp-cards-grid { grid-template-columns: 1fr 1fr; }
          .pdp-faqs-section { margin: 0 4% 40px; }
          .pdp-reviews-section { margin: 0 4%; }
          .pdp-reviews-grid { grid-template-columns: 1fr; }
          .pdp-reviews-header { flex-direction: column; }
        }

        @media (max-width: 480px) {
          .pdp-cards-grid { grid-template-columns: 1fr; }
          .pdp-hero-grid { padding: 8px 4% 32px; }
        }
      `}</style>
    </div>
  );
};
