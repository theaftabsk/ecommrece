import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { catalogApi } from '@oaksol/api-client';
import { Button } from '@oaksol/shared-ui';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [banners, setBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedCategory = searchParams.get('category');
  const setSelectedCategory = (slug: string | null) => {
    if (slug) {
      setSearchParams({ category: slug });
    } else {
      setSearchParams({});
    }
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        // Load homepage layout (banners & sections)
        const homeData = await catalogApi.getHomepage();
        setBanners(homeData.banners || []);

        if (homeData.shop) {
          document.title = `${homeData.shop.name} | Pure Botanical Skincare`;
        }

        // Load categories
        const catData = await catalogApi.getCategories();
        setCategories(catData || []);
      } catch (err: any) {
        console.error('Failed to load store data:', err);
        setError(err.message || 'Failed to load store content. Please check your domain context.');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params: any = {};
        if (selectedCategory) {
          params.category_slug = selectedCategory;
        }
        const prodData = await catalogApi.getProducts(params);
        setProducts(prodData?.products || prodData || []);
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    };
    fetchProducts();
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="store-loading">
        <div className="spinner"></div>
        <p>Loading brand experience...</p>
        <style>{`
          .store-loading {
            min-height: 70vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: var(--font-sans);
            color: var(--sf-text-muted);
          }
          .spinner {
            border: 3px solid rgba(0,0,0,0.05);
            border-top: 3px solid var(--sf-accent);
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin-bottom: 15px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <div className="store-error">
          <div className="store-error-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h3>Store Not Found</h3>
          <p>{error}</p>
          <p className="hint">Make sure this subdomain is registered in the platform admin.<br />Visit <code>admin.localhost:3000</code> to provision this store.</p>
          <div className="error-actions">
            <button onClick={() => window.location.reload()} className="err-btn-retry">Retry</button>
            <button onClick={() => window.location.href = 'http://localhost:3000'} className="err-btn-home">OakSol Platform →</button>
          </div>
        </div>
        <style>{`
          .store-error {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 40px 20px;
            background: var(--sf-bg);
            font-family: var(--font-sans);
          }
          .store-error-icon {
            color: #D97706;
            margin-bottom: 20px;
          }
          .store-error h3 {
            font-family: var(--font-serif);
            font-size: 2rem;
            color: var(--sf-text-main);
            margin-bottom: 12px;
          }
          .store-error p {
            color: var(--sf-text-muted);
            margin-bottom: 8px;
            max-width: 480px;
            line-height: 1.6;
          }
          .hint {
            font-size: 0.85rem;
            background: #FEF9C3;
            border: 1px solid #FDE68A;
            padding: 12px 18px;
            border-radius: 8px;
            margin: 8px 0 24px !important;
            color: #92400E !important;
          }
          .error-actions { display: flex; gap: 12px; }
          .err-btn-retry {
            background: var(--sf-accent); color: white; border: none;
            padding: 10px 22px; border-radius: 6px; cursor: pointer;
            font-size: 0.9rem; font-weight: 600;
          }
          .err-btn-home {
            background: transparent; color: var(--sf-text-muted);
            border: 1px solid var(--sf-border); padding: 10px 22px;
            border-radius: 6px; cursor: pointer; font-size: 0.9rem;
          }
        `}</style>
      </>
    );
  }

  // Flatten categories list to search for active category (both root and subcategories)
  const flattenCategories = (list: any[]): any[] => {
    return list.flatMap(c => [c, ...flattenCategories(c.children || [])]);
  };
  const allFlattenedCategories = flattenCategories(categories);
  const activeCategoryObj = allFlattenedCategories.find(c => c.slug === selectedCategory);

  // Products are filtered dynamically by the API
  const filteredProducts = products;

  const menuCategories = categories.filter((cat: any) => cat.show_in_menu !== false);

  return (
    <div className="brand-homepage">
      {/* Dynamic Category Header or Hero Banner */}
      {selectedCategory && activeCategoryObj ? (
        <section className="category-header-banner">
          <div className="category-header-container">
            <span className="category-header-badge">Collection</span>
            <h1>{activeCategoryObj.name}</h1>
            <p>Explore our selection of {activeCategoryObj.name.toLowerCase()} formulated with active organic botanicals.</p>
          </div>
        </section>
      ) : (
        banners.length > 0 && (
          <section className="hero-banner">
            <div className="banner-slide">
              <img src={banners[0].image_url} alt={banners[0].title} />
              <div className="banner-overlay"></div>
              <div className="banner-content">
                <h1>{banners[0].title || 'Natural Skincare Crafted For You'}</h1>
                <p>Experience the pure goodness of botanical extracts and essential oils.</p>
                {banners[0].link_url && (
                  <Button
                    variant="storefront"
                    onClick={() => {
                      // Extract slug from link_url /products/slug
                      const slug = banners[0].link_url.split('/').pop();
                      navigate(`/products/${slug}`);
                    }}
                    style={{ backgroundColor: 'var(--sf-accent)', borderColor: 'var(--sf-accent)' }}
                  >
                    Shop Now &rarr;
                  </Button>
                )}
              </div>
            </div>
          </section>
        )
      )}

      {/* 2. Category Navigation Ribbon */}
      {menuCategories.length > 0 && (
        <section className="category-ribbon">
          <div className="ribbon-container">
            <button
              className={`ribbon-item ${selectedCategory === null ? 'active' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              All Products
            </button>
            {menuCategories.map((cat: any) => (
              <button
                key={cat.id}
                className={`ribbon-item ${selectedCategory === cat.slug ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.slug)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 3. Product Catalog Grid */}
      <section className="catalog-grid-section">
        <div className="section-container">
          <h2 className="section-title">{activeCategoryObj ? `${activeCategoryObj.name} Collection` : 'Our Collection'}</h2>
          {filteredProducts.length === 0 ? (
            <p className="no-products">No products found in this category.</p>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product: any) => {
                const coverImage = product.gallery?.find((g: any) => g.is_cover)?.url ||
                  product.gallery?.[0]?.url ||
                  'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=1000';
                return (
                  <div
                    key={product.id}
                    className="product-card"
                    onClick={() => navigate(`/products/${product.slug}`)}
                  >
                    <div className="product-image-wrapper">
                      <img src={coverImage} alt={product.name} />
                      {product.compare_price && (
                        <span className="sale-tag">Sale</span>
                      )}
                    </div>
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p className="product-category">{product.category?.name || 'Skincare'}</p>
                      <div className="product-price-row">
                        <span className="price">₹{parseFloat(product.price).toFixed(2)}</span>
                        {product.compare_price && (
                          <span className="compare-price">₹{parseFloat(product.compare_price).toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <style>{`
        .category-header-banner {
          background: linear-gradient(135deg, #F0F5F2 0%, #E3EBE7 100%);
          padding: 70px 5%;
          text-align: center;
          border-bottom: 1px solid var(--sf-border);
        }

        .category-header-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .category-header-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--sf-accent);
          margin-bottom: 12px;
          background: rgba(21, 128, 61, 0.08);
          padding: 4px 12px;
          border-radius: 100px;
        }

        .category-header-banner h1 {
          font-family: var(--font-serif);
          font-size: 3rem;
          color: var(--sf-text-main);
          margin-bottom: 12px;
        }

        .category-header-banner p {
          font-size: 1.1rem;
          color: var(--sf-text-muted);
          line-height: 1.6;
          margin: 0;
        }

        .brand-homepage {
          background: var(--sf-bg);
          color: var(--sf-text-main);
          font-family: var(--font-sans);
          min-height: 100vh;
        }

        .hero-banner {
          position: relative;
          height: 550px;
          overflow: hidden;
          background: #000;
        }

        .banner-slide {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .banner-slide img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.8;
        }

        .banner-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4));
        }

        .banner-content {
          position: absolute;
          bottom: 10%;
          left: 5%;
          z-index: 10;
          max-width: 600px;
          color: #FFFFFF;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 20px;
        }

        .banner-content h1 {
          font-family: var(--font-serif);
          font-size: 3.5rem;
          line-height: 1.1;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .banner-content p {
          font-size: 1.2rem;
          color: rgba(255,255,255,0.9);
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }

        /* Category ribbon styles */
        .category-ribbon {
          background: #FFFFFF;
          border-bottom: 1px solid var(--sf-border);
          padding: 15px 5%;
          position: sticky;
          top: 70px;
          z-index: 50;
        }

        .ribbon-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          gap: 15px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .ribbon-container::-webkit-scrollbar {
          display: none;
        }

        .ribbon-item {
          background: transparent;
          border: 1px solid transparent;
          padding: 8px 18px;
          border-radius: var(--radius-full);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          color: var(--sf-text-muted);
          transition: all var(--transition-fast);
          white-space: nowrap;
        }

        .ribbon-item.active, .ribbon-item:hover {
          background: var(--sf-accent);
          color: #FFFFFF;
        }

        /* Product catalog grid styles */
        .catalog-grid-section {
          padding: 80px 5%;
        }

        .section-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-title {
          font-family: var(--font-serif);
          font-size: 2.25rem;
          margin-bottom: 40px;
          position: relative;
        }

        .section-title::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -10px;
          width: 50px;
          height: 2px;
          background: var(--sf-accent);
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 40px 30px;
        }

        .product-card {
          background: #FFFFFF;
          border: 1px solid var(--sf-border);
          border-radius: var(--radius-md);
          overflow: hidden;
          cursor: pointer;
          transition: transform var(--transition-normal), box-shadow var(--transition-normal);
        }

        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-md);
        }

        .product-image-wrapper {
          position: relative;
          height: 300px;
          background: #F9F9F9;
        }

        .product-image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sale-tag {
          position: absolute;
          top: 15px;
          left: 15px;
          background: #D97706;
          color: #FFFFFF;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          text-transform: uppercase;
        }

        .product-info {
          padding: 20px;
        }

        .product-info h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 5px;
          color: var(--sf-text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .product-category {
          font-size: 0.8rem;
          color: var(--sf-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
        }

        .product-price-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .price {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--sf-accent);
        }

        .compare-price {
          font-size: 0.95rem;
          text-decoration: line-through;
          color: var(--sf-text-muted);
        }

        .no-products {
          font-size: 1rem;
          color: var(--sf-text-muted);
          text-align: center;
          padding: 40px 0;
        }

        @media (max-width: 768px) {
          .category-header-banner {
            padding: 45px 4%;
          }
          .category-header-banner h1 {
            font-size: 1.85rem;
            margin-bottom: 8px;
          }
          .category-header-banner p {
            font-size: 0.95rem;
          }
          .hero-banner {
            height: 340px;
          }
          .banner-content {
            bottom: 8%;
            left: 6%;
            max-width: 90%;
            gap: 12px;
          }
          .banner-content h1 {
            font-size: 1.85rem;
          }
          .banner-content p {
            font-size: 0.95rem;
          }
          .category-ribbon {
            top: 70px;
            padding: 10px 4%;
          }
          .ribbon-item {
            padding: 6px 14px;
            font-size: 0.8rem;
          }
          .catalog-grid-section {
            padding: 40px 4%;
          }
          .section-title {
            font-size: 1.65rem;
            margin-bottom: 25px;
          }
          .product-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px 12px;
          }
          .product-image-wrapper {
            height: 180px;
          }
          .product-info {
            padding: 12px;
          }
          .product-info h3 {
            font-size: 0.95rem;
            margin-bottom: 3px;
          }
          .product-category {
            font-size: 0.75rem;
            margin-bottom: 8px;
          }
          .product-price-row {
            gap: 6px;
          }
          .price {
            font-size: 0.95rem;
          }
          .compare-price {
            font-size: 0.85rem;
          }
          .sale-tag {
            top: 8px;
            left: 8px;
            font-size: 0.65rem;
            padding: 2px 6px;
          }
        }
      `}</style>
    </div>
  );
};
