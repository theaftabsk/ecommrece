import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { catalogApi } from '@oaksol/api-client';
import { Button } from '@oaksol/shared-ui';

export const Categories: React.FC = () => {
  const navigate = useNavigate();
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedCategorySlug = categorySlug || searchParams.get('category');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Load categories
        const catData = await catalogApi.getCategories();
        setCategories(catData || []);

        // Load products
        const prodData = await catalogApi.getProducts();
        setProducts(prodData?.products || prodData || []);
      } catch (err: any) {
        console.error('Failed to load category data:', err);
        setError(err.message || 'Failed to load categories.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Flatten categories list to search for active category
  const flattenCategories = (list: any[]): any[] => {
    return list.flatMap(c => [c, ...flattenCategories(c.children || [])]);
  };
  const allFlattenedCategories = flattenCategories(categories);
  const activeCategoryObj = allFlattenedCategories.find(c => c.slug === selectedCategorySlug);

  const getSubcategoryIds = (cat: any): string[] => {
    if (!cat) return [];
    return [cat.id, ...(cat.children?.flatMap((child: any) => getSubcategoryIds(child)) || [])];
  };

  const activeCategoryIds = activeCategoryObj ? getSubcategoryIds(activeCategoryObj) : [];

  // Filter products by active category or its subcategories
  const filteredProducts = selectedCategorySlug
    ? products.filter(p => p.category_id && activeCategoryIds.includes(p.category_id))
    : products;

  if (loading) {
    return (
      <div className="store-loading">
        <div className="spinner"></div>
        <p>Loading categories...</p>
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
      <div className="store-error">
        <h3>Failed to Load Categories</h3>
        <p>{error}</p>
        <Button variant="storefront" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="categories-page">
      {/* 1. Header Banner */}
      <section className="categories-header">
        <div className="header-container">
          <span className="header-badge">Store Catalog</span>
          <h1>{activeCategoryObj ? activeCategoryObj.name : 'Explore Categories'}</h1>
          <p>
            {activeCategoryObj 
              ? `Browse our selection of ${activeCategoryObj.name.toLowerCase()} formulated with active botanicals.` 
              : 'Browse our collection by categories and find exactly what your skin needs.'}
          </p>
          {activeCategoryObj && (
            <button 
              className="back-btn" 
              onClick={() => navigate('/categories')}
              style={{ marginTop: 15 }}
            >
              &larr; Back to All Categories
            </button>
          )}
        </div>
      </section>

      <section className="categories-content-section">
        <div className="content-container">
          {/* Case A: No category selected - Show Root Categories Grid */}
          {!activeCategoryObj ? (
            <div className="categories-grid">
              {categories.map((cat: any) => {
                const subCount = cat.children?.length || 0;
                return (
                  <div 
                    key={cat.id} 
                    className="category-card"
                    onClick={() => navigate(`/categories/${cat.slug}`)}
                  >
                    <div className="category-icon-wrapper">
                      <span>📁</span>
                    </div>
                    <h3>{cat.name}</h3>
                    <p className="sub-count">
                      {subCount > 0 ? `${subCount} subcategories` : 'View products'}
                    </p>
                    <span className="explore-link">Explore &rarr;</span>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Case B: Category Selected */
            <div className="category-details-layout">
              {/* If it has subcategories, display them first */}
              {activeCategoryObj.children && activeCategoryObj.children.length > 0 ? (
                <div className="subcategories-section">
                  <h3 className="sub-title">Subcategories in {activeCategoryObj.name}</h3>
                  <div className="subcategories-grid">
                    {activeCategoryObj.children.map((sub: any) => (
                      <div 
                        key={sub.id} 
                        className="subcategory-card"
                        onClick={() => navigate(`/categories/${sub.slug}`)}
                      >
                        <h4>{sub.name}</h4>
                        <span>View items &rarr;</span>
                      </div>
                    ))}
                  </div>

                  <hr style={{ margin: '40px 0', borderColor: 'var(--sf-border)' }} />
                </div>
              ) : null}

              {/* Show all products under this category */}
              <div className="products-list-section">
                <h3 className="section-subtitle">Products in {activeCategoryObj.name}</h3>
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
            </div>
          )}
        </div>
      </section>

      <style>{`
        .categories-page {
          background: var(--sf-bg);
          color: var(--sf-text-main);
          font-family: var(--font-sans);
          min-height: 100vh;
        }

        .categories-header {
          background: linear-gradient(135deg, #F5F7F6 0%, #E8EFEA 100%);
          padding: 80px 5%;
          text-align: center;
          border-bottom: 1px solid var(--sf-border);
        }

        .header-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .header-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--sf-accent);
          margin-bottom: 15px;
          background: rgba(21, 128, 61, 0.08);
          padding: 4px 12px;
          border-radius: 100px;
        }

        .categories-header h1 {
          font-family: var(--font-serif);
          font-size: 3rem;
          color: var(--sf-text-main);
          margin-bottom: 15px;
        }

        .categories-header p {
          font-size: 1.1rem;
          color: var(--sf-text-muted);
          line-height: 1.6;
          margin: 0;
        }

        .back-btn {
          background: transparent;
          border: 1px solid var(--sf-accent);
          color: var(--sf-accent);
          padding: 8px 18px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .back-btn:hover {
          background: var(--sf-accent);
          color: white;
        }

        .categories-content-section {
          padding: 60px 5%;
        }

        .content-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Root Categories Grid */
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 30px;
        }

        .category-card {
          background: white;
          border: 1px solid var(--sf-border);
          border-radius: 12px;
          padding: 30px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          box-shadow: var(--shadow-sm);
        }

        .category-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: var(--sf-accent);
        }

        .category-icon-wrapper {
          font-size: 2.5rem;
          margin-bottom: 15px;
          background: #F4F7F5;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        .category-card h3 {
          font-family: var(--font-serif);
          font-size: 1.4rem;
          margin-bottom: 8px;
          color: var(--sf-text-main);
        }

        .sub-count {
          font-size: 0.85rem;
          color: var(--sf-text-muted);
          margin-bottom: 20px;
        }

        .explore-link {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--sf-accent);
        }

        /* Subcategories layout */
        .sub-title {
          font-family: var(--font-serif);
          font-size: 1.6rem;
          margin-bottom: 20px;
        }

        .subcategories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }

        .subcategory-card {
          background: white;
          border: 1px solid var(--sf-border);
          border-radius: 8px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .subcategory-card:hover {
          border-color: var(--sf-accent);
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }

        .subcategory-card h4 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
        }

        .subcategory-card span {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--sf-accent);
        }

        /* Product Catalog Grid */
        .products-list-section {
          margin-top: 20px;
        }

        .section-subtitle {
          font-family: var(--font-serif);
          font-size: 1.65rem;
          margin-bottom: 30px;
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
          .categories-header {
            padding: 50px 4%;
          }
          .categories-header h1 {
            font-size: 2rem;
          }
          .categories-header p {
            font-size: 0.95rem;
          }
          .categories-content-section {
            padding: 40px 4%;
          }
          .categories-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .category-card {
            padding: 20px;
          }
          .subcategories-grid {
            grid-template-columns: 1fr;
            gap: 12px;
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
          }
          .price {
            font-size: 0.95rem;
          }
        }
      `}</style>
    </div>
  );
};
