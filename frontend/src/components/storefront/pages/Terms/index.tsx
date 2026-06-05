import React, { useEffect, useState } from 'react';
import { customerApi } from '../../../../lib/api-client';

export const Terms: React.FC = () => {
  const [data, setData] = useState<{ shop: any; content: Record<string, string> } | null>(null);
  useEffect(() => { customerApi.getPages().then(setData).catch(() => {}); }, []);
  const shop = data?.shop;
  const c = data?.content || {};

  const defaultSections = [
    { title: 'Acceptance of Terms', body: 'By accessing and using this website, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our service.' },
    { title: 'Use of Website', body: 'This website is intended for personal, non-commercial use. You agree not to use the site for any unlawful purpose or in any way that might harm, disable, or impair the site.' },
    { title: 'Products and Pricing', body: 'All products are subject to availability. Prices are subject to change without notice. We reserve the right to limit quantities and refuse orders. In the event of a pricing error, we reserve the right to cancel any orders.' },
    { title: 'Order and Payment', body: 'By placing an order, you are making an offer to purchase a product. All orders are subject to acceptance. Payment must be received before orders are processed and shipped.' },
    { title: 'Shipping and Delivery', body: 'Delivery times are estimates and may vary. We are not responsible for delays caused by carriers or customs. Risk of loss and title for items pass to you upon delivery.' },
    { title: 'Returns and Refunds', body: 'Items may be returned within 7 days of delivery if unused and in original packaging. Refunds will be processed within 5–7 business days after receiving the returned item.' },
    { title: 'Limitation of Liability', body: `${shop?.name || 'We'} shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of or inability to use our products or services.` },
    { title: 'Changes to Terms', body: 'We reserve the right to modify these terms at any time. Your continued use of the site after changes constitutes acceptance of the new terms.' },
    { title: 'Contact', body: `Questions about these Terms? Contact us at ${c.contact_email || 'support@ourstore.com'}.` },
  ];

  return (
    <div className="policy-page">
      <div className="policy-hero">
        <h1 className="policy-title">Terms & Conditions</h1>
        <p className="policy-meta">Last updated: {c.terms_updated || 'June 2025'} · {shop?.name || 'Our Store'}</p>
      </div>
      <div className="policy-body">
        <div className="policy-container">
          <nav className="policy-toc">
            <p className="policy-toc-label">Contents</p>
            {defaultSections.map((s, i) => (
              <a key={i} href={`#tc-${i}`} className="policy-toc-link">{s.title}</a>
            ))}
          </nav>
          <article className="policy-article">
            {c.terms_content ? (
              <div className="policy-rich" dangerouslySetInnerHTML={{ __html: c.terms_content.replace(/\n/g, '<br/>') }} />
            ) : (
              <>
                <p className="policy-intro">Please read these Terms & Conditions carefully before using {shop?.name || 'our store'}. By using the site, you agree to be bound by these terms.</p>
                {defaultSections.map((s, i) => (
                  <section key={i} id={`tc-${i}`} className="policy-section">
                    <h2 className="policy-h2">{i + 1}. {s.title}</h2>
                    <p className="policy-text">{s.body}</p>
                  </section>
                ))}
              </>
            )}
          </article>
        </div>
      </div>
      <style>{POLICY_STYLES}</style>
    </div>
  );
};

const POLICY_STYLES = `
  .policy-page { min-height: 100vh; background: var(--sf-bg); font-family: var(--font-sans); }
  .policy-hero { padding: 50px 5% 40px; border-bottom: 1px solid var(--sf-border); background: #fff; }
  .policy-title { font-family: var(--font-serif); font-size: 2.2rem; color: var(--sf-text-main); margin: 0 0 8px; }
  .policy-meta { font-size: 0.84rem; color: var(--sf-text-muted); margin: 0; }
  .policy-body { padding: 50px 5% 80px; }
  .policy-container { max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: 220px 1fr; gap: 48px; align-items: start; }
  @media(max-width: 768px) { .policy-container { grid-template-columns: 1fr; } .policy-toc { display: none; } }
  .policy-toc { position: sticky; top: 90px; background: #fff; border: 1px solid var(--sf-border); border-radius: 14px; padding: 20px 16px; display: flex; flex-direction: column; gap: 4px; }
  .policy-toc-label { font-size: 0.72rem; font-weight: 700; color: var(--sf-text-muted); text-transform: uppercase; letter-spacing: 0.07em; margin: 0 0 10px; }
  .policy-toc-link { font-size: 0.83rem; color: var(--sf-text-muted); text-decoration: none; padding: 6px 10px; border-radius: 8px; transition: all 0.15s; }
  .policy-toc-link:hover { background: var(--sf-accent-light); color: var(--sf-accent); }
  .policy-article { background: #fff; border: 1px solid var(--sf-border); border-radius: 20px; padding: 40px 44px; }
  @media(max-width: 600px) { .policy-article { padding: 28px 20px; } }
  .policy-intro { font-size: 1rem; color: var(--sf-text-muted); line-height: 1.8; margin: 0 0 36px; padding-bottom: 28px; border-bottom: 1px solid var(--sf-border); }
  .policy-section { margin-bottom: 36px; scroll-margin-top: 100px; }
  .policy-h2 { font-family: var(--font-serif); font-size: 1.2rem; color: var(--sf-text-main); margin: 0 0 12px; }
  .policy-text { font-size: 0.93rem; color: var(--sf-text-muted); line-height: 1.8; margin: 0; }
  .policy-rich { font-size: 0.93rem; color: var(--sf-text-muted); line-height: 1.8; }
`;
