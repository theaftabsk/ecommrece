import React, { useEffect, useState } from 'react';
import { customerApi } from '../../../../lib/api-client';

export const Privacy: React.FC = () => {
  const [data, setData] = useState<{ shop: any; content: Record<string, string> } | null>(null);
  useEffect(() => { customerApi.getPages().then(setData).catch(() => {}); }, []);
  const shop = data?.shop;
  const c = data?.content || {};

  const defaultSections = [
    { title: 'Information We Collect', body: 'We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This includes name, email, phone number, shipping address, and payment information.' },
    { title: 'How We Use Your Information', body: 'We use the information we collect to process orders, send order confirmations and updates, provide customer support, send promotional communications (with your consent), and improve our services.' },
    { title: 'Information Sharing', body: 'We do not sell, trade, or rent your personal information to third parties. We may share information with trusted service providers who assist us in operating our website and delivering our services.' },
    { title: 'Data Security', body: 'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All payment transactions are encrypted using SSL technology.' },
    { title: 'Cookies', body: 'We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie settings through your browser preferences.' },
    { title: 'Your Rights', body: 'You have the right to access, update, or delete your personal information. You may also opt out of marketing communications at any time. Contact us at the information below to exercise these rights.' },
    { title: 'Contact Us', body: `If you have any questions about this Privacy Policy, please contact us at ${c.contact_email || 'support@ourstore.com'}.` },
  ];

  return (
    <div className="policy-page">
      <div className="policy-hero">
        <h1 className="policy-title">Privacy Policy</h1>
        <p className="policy-meta">Last updated: {c.privacy_updated || 'June 2025'} · {shop?.name || 'Our Store'}</p>
      </div>
      <div className="policy-body">
        <div className="policy-container">
          {/* Sidebar TOC */}
          <nav className="policy-toc">
            <p className="policy-toc-label">Contents</p>
            {defaultSections.map((s, i) => (
              <a key={i} href={`#pp-${i}`} className="policy-toc-link">{s.title}</a>
            ))}
          </nav>
          {/* Content */}
          <article className="policy-article">
            {c.privacy_content ? (
              <div className="policy-rich" dangerouslySetInnerHTML={{ __html: c.privacy_content.replace(/\n/g, '<br/>') }} />
            ) : (
              <>
                <p className="policy-intro">At {shop?.name || 'our store'}, we value your privacy and are committed to protecting your personal information. This policy explains how we collect, use, and safeguard your data.</p>
                {defaultSections.map((s, i) => (
                  <section key={i} id={`pp-${i}`} className="policy-section">
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

export { POLICY_STYLES };
