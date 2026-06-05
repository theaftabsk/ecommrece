import React, { useState, useEffect, useCallback } from 'react';
import { customerApi } from '../../../../lib/api-client';

interface Props {
  shopInfo: any;
}

type PagesTab = 'about' | 'contact' | 'privacy' | 'terms';

const TAB_ITEMS: { id: PagesTab; label: string; icon: string; desc: string }[] = [
  { id: 'about',   label: 'About Us',          icon: '🌿', desc: 'Your store story, mission & values' },
  { id: 'contact', label: 'Contact & Social',   icon: '📬', desc: 'Contact details & social media links' },
  { id: 'privacy', label: 'Privacy Policy',     icon: '🔒', desc: 'Data & privacy disclosures' },
  { id: 'terms',   label: 'Terms & Conditions', icon: '📄', desc: 'Legal terms of service' },
];

export const PagesPage: React.FC<Props> = ({ shopInfo }) => {
  const [activeTab, setActiveTab] = useState<PagesTab>('about');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // All page content key-value pairs
  const [fields, setFields] = useState<Record<string, string>>({
    // About
    about_title: '',
    about_tagline: '',
    about_content: '',
    value_quality: '',
    value_care: '',
    value_delivery: '',
    value_security: '',
    // Contact
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    contact_hours: '',
    social_instagram: '',
    social_facebook: '',
    // Privacy
    privacy_content: '',
    privacy_updated: '',
    // Terms
    terms_content: '',
    terms_updated: '',
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFields(f => ({ ...f, [key]: e.target.value }));

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const data = await customerApi.getPages();
      if (data?.content) {
        setFields(prev => ({ ...prev, ...data.content }));
      }
    } catch { /* use defaults */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  const handleSave = async () => {
    setSaving(true); setError(null); setSaved(false);
    try {
      // Only save non-empty values for the current tab (to avoid overwriting other tabs)
      // But actually save all — it's idempotent
      await customerApi.savePages(fields);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save. Please try again.');
    } finally { setSaving(false); }
  };

  const storefront = shopInfo?.storefront_url || `http://${shopInfo?.slug}.localhost:3000`;

  return (
    <div className="pg-page">
      {/* Header */}
      <div className="pg-header">
        <div>
          <h1 className="pg-title">Pages & Content</h1>
          <p className="pg-subtitle">Customize what customers see on public storefront pages</p>
        </div>
        <div className="pg-header-actions">
          <a href={storefront} target="_blank" rel="noreferrer" className="pg-preview-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Preview Storefront
          </a>
          <button className="pg-save-btn" onClick={handleSave} disabled={saving || loading}>
            {saving ? (
              <><span className="pg-spinner" /> Saving…</>
            ) : saved ? (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> Saved!</>
            ) : (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save Changes</>
            )}
          </button>
        </div>
      </div>

      {error && <div className="pg-error">{error}</div>}
      {saved && <div className="pg-success">✅ All page content saved successfully! Changes are now live on your storefront.</div>}

      <div className="pg-layout">
        {/* Tab Sidebar */}
        <nav className="pg-tabs">
          {TAB_ITEMS.map(tab => (
            <button
              key={tab.id}
              className={`pg-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="pg-tab-icon">{tab.icon}</span>
              <span className="pg-tab-text">
                <span className="pg-tab-label">{tab.label}</span>
                <span className="pg-tab-desc">{tab.desc}</span>
              </span>
              <svg className="pg-tab-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          ))}

          {/* Storefront links */}
          <div className="pg-links-section">
            <p className="pg-links-label">Storefront Pages</p>
            {[
              { href: `${storefront}/about`, label: '/about' },
              { href: `${storefront}/contact`, label: '/contact' },
              { href: `${storefront}/privacy`, label: '/privacy' },
              { href: `${storefront}/terms`, label: '/terms' },
            ].map(l => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="pg-sf-link">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                {l.label}
              </a>
            ))}
          </div>
        </nav>

        {/* Content Panel */}
        <div className="pg-panel">
          {loading ? (
            <div className="pg-loading"><span className="pg-spinner-lg" /> Loading page content…</div>
          ) : (
            <>
              {/* ── About Us ── */}
              {activeTab === 'about' && (
                <div className="pg-form">
                  <div className="pg-form-header">
                    <h2 className="pg-form-title">🌿 About Us Page</h2>
                    <p className="pg-form-hint">This content appears on <code>/about</code> on your storefront.</p>
                  </div>

                  <div className="pg-field">
                    <label className="pg-label">Page Title</label>
                    <input className="pg-input" type="text" placeholder={`About ${shopInfo?.name || 'Us'}`} value={fields.about_title} onChange={set('about_title')} />
                    <span className="pg-hint">Displayed as the hero heading. Leave blank to use shop name.</span>
                  </div>

                  <div className="pg-field">
                    <label className="pg-label">Tagline / Subtitle</label>
                    <input className="pg-input" type="text" placeholder="Our story, our mission, our values" value={fields.about_tagline} onChange={set('about_tagline')} />
                  </div>

                  <div className="pg-field">
                    <label className="pg-label">Our Story (Main Content)</label>
                    <textarea className="pg-textarea lg" placeholder="Tell customers about your brand, founding story, mission..." value={fields.about_content} onChange={set('about_content')} rows={8} />
                    <span className="pg-hint">Basic HTML supported (e.g. &lt;b&gt;, &lt;i&gt;, &lt;br&gt;).</span>
                  </div>

                  <div className="pg-divider">
                    <span>✦ Our Values Cards</span>
                  </div>

                  {[
                    { key: 'value_quality',  label: '🌿 Quality First', placeholder: 'We source only the finest products...' },
                    { key: 'value_care',     label: '💚 Customer Care',  placeholder: 'Your satisfaction is our priority...' },
                    { key: 'value_delivery', label: '🚀 Fast Delivery',  placeholder: 'Quick and reliable shipping...' },
                    { key: 'value_security', label: '🔒 Secure Shopping',placeholder: 'Shop with confidence...' },
                  ].map(v => (
                    <div key={v.key} className="pg-field">
                      <label className="pg-label">{v.label}</label>
                      <textarea className="pg-textarea" placeholder={v.placeholder} value={fields[v.key]} onChange={set(v.key)} rows={2} />
                    </div>
                  ))}
                </div>
              )}

              {/* ── Contact & Social ── */}
              {activeTab === 'contact' && (
                <div className="pg-form">
                  <div className="pg-form-header">
                    <h2 className="pg-form-title">📬 Contact & Social</h2>
                    <p className="pg-form-hint">Shown in the sidebar of <code>/contact</code> and in the storefront footer.</p>
                  </div>

                  <div className="pg-divider"><span>Contact Details</span></div>
                  <div className="pg-grid-2">
                    <div className="pg-field">
                      <label className="pg-label">Email Address</label>
                      <input className="pg-input" type="email" placeholder="support@yourstore.com" value={fields.contact_email} onChange={set('contact_email')} />
                    </div>
                    <div className="pg-field">
                      <label className="pg-label">Phone Number</label>
                      <input className="pg-input" type="tel" placeholder="+91 98765 43210" value={fields.contact_phone} onChange={set('contact_phone')} />
                    </div>
                  </div>
                  <div className="pg-field">
                    <label className="pg-label">Address</label>
                    <input className="pg-input" type="text" placeholder="123 Main Street, City, State, PIN" value={fields.contact_address} onChange={set('contact_address')} />
                  </div>
                  <div className="pg-field">
                    <label className="pg-label">Working Hours</label>
                    <input className="pg-input" type="text" placeholder="Mon–Sat, 9am–6pm IST" value={fields.contact_hours} onChange={set('contact_hours')} />
                  </div>

                  <div className="pg-divider"><span>Social Media Links</span></div>
                  <div className="pg-grid-2">
                    <div className="pg-field">
                      <label className="pg-label">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>
                        Instagram URL
                      </label>
                      <input className="pg-input" type="url" placeholder="https://instagram.com/yourstore" value={fields.social_instagram} onChange={set('social_instagram')} />
                    </div>
                    <div className="pg-field">
                      <label className="pg-label">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                        Facebook URL
                      </label>
                      <input className="pg-input" type="url" placeholder="https://facebook.com/yourstore" value={fields.social_facebook} onChange={set('social_facebook')} />
                    </div>
                  </div>

                  <div className="pg-preview-card">
                    <p className="pg-preview-label">Footer & Contact Page Preview</p>
                    <div className="pg-contact-preview">
                      {fields.contact_email && <span>📧 {fields.contact_email}</span>}
                      {fields.contact_phone && <span>📱 {fields.contact_phone}</span>}
                      {fields.contact_address && <span>📍 {fields.contact_address}</span>}
                      {fields.contact_hours && <span>🕐 {fields.contact_hours}</span>}
                      {!fields.contact_email && !fields.contact_phone && <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Fill in contact details above to preview…</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Privacy Policy ── */}
              {activeTab === 'privacy' && (
                <div className="pg-form">
                  <div className="pg-form-header">
                    <h2 className="pg-form-title">🔒 Privacy Policy</h2>
                    <p className="pg-form-hint">Shown on <code>/privacy</code>. Leave blank to use the default template.</p>
                  </div>
                  <div className="pg-info-banner">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    If left blank, a professional default privacy policy template is shown automatically. Only override if you have a custom legal document.
                  </div>
                  <div className="pg-field">
                    <label className="pg-label">Custom Privacy Policy Content</label>
                    <textarea className="pg-textarea xl" placeholder="Enter your full Privacy Policy text here. You can use basic HTML for formatting..." value={fields.privacy_content} onChange={set('privacy_content')} rows={18} />
                  </div>
                  <div className="pg-field">
                    <label className="pg-label">Last Updated Date</label>
                    <input className="pg-input" type="text" placeholder="June 2025" value={fields.privacy_updated} onChange={set('privacy_updated')} style={{ maxWidth: 220 }} />
                  </div>
                </div>
              )}

              {/* ── Terms & Conditions ── */}
              {activeTab === 'terms' && (
                <div className="pg-form">
                  <div className="pg-form-header">
                    <h2 className="pg-form-title">📄 Terms & Conditions</h2>
                    <p className="pg-form-hint">Shown on <code>/terms</code>. Leave blank to use the default template.</p>
                  </div>
                  <div className="pg-info-banner">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    A default Terms & Conditions template is shown if left blank. Consult your legal team before publishing custom terms.
                  </div>
                  <div className="pg-field">
                    <label className="pg-label">Custom Terms Content</label>
                    <textarea className="pg-textarea xl" placeholder="Enter your full Terms & Conditions here. You can use basic HTML for formatting..." value={fields.terms_content} onChange={set('terms_content')} rows={18} />
                  </div>
                  <div className="pg-field">
                    <label className="pg-label">Last Updated Date</label>
                    <input className="pg-input" type="text" placeholder="June 2025" value={fields.terms_updated} onChange={set('terms_updated')} style={{ maxWidth: 220 }} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        .pg-page { padding: 0; font-family: var(--m-font, 'Inter', sans-serif); }
        .pg-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; }
        .pg-title { font-size: 1.5rem; font-weight: 800; color: var(--m-text, #0f172a); margin: 0 0 4px; }
        .pg-subtitle { font-size: 0.87rem; color: var(--m-text-muted, #64748b); margin: 0; }
        .pg-header-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .pg-preview-btn {
          display: inline-flex; align-items: center; gap: 7px; padding: 9px 16px;
          border: 1.5px solid var(--m-border, #e2e8f0); border-radius: 10px;
          font-size: 0.83rem; font-weight: 600; color: var(--m-text-muted, #64748b);
          text-decoration: none; background: #fff; transition: all 0.15s;
        }
        .pg-preview-btn:hover { border-color: var(--m-accent, #15803D); color: var(--m-accent, #15803D); }
        .pg-save-btn {
          display: inline-flex; align-items: center; gap: 8px; padding: 9px 20px;
          background: var(--m-accent, #15803D); color: #fff; border: none; border-radius: 10px;
          font-size: 0.87rem; font-weight: 700; cursor: pointer;
          font-family: var(--m-font, 'Inter', sans-serif);
          transition: background 0.15s, transform 0.1s;
        }
        .pg-save-btn:hover:not(:disabled) { background: #166534; }
        .pg-save-btn:active:not(:disabled) { transform: scale(0.97); }
        .pg-save-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .pg-spinner { width: 14px; height: 14px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; animation: pg-spin 0.7s linear infinite; display: inline-block; }
        .pg-spinner-lg { width: 28px; height: 28px; border-radius: 50%; border: 3px solid var(--m-border, #e2e8f0); border-top-color: var(--m-accent, #15803D); animation: pg-spin 0.8s linear infinite; display: inline-block; }
        @keyframes pg-spin { to { transform: rotate(360deg); } }
        .pg-error { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 10px; padding: 12px 16px; color: #dc2626; font-size: 0.87rem; margin-bottom: 16px; }
        .pg-success { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px 16px; color: #15803D; font-size: 0.87rem; margin-bottom: 16px; font-weight: 600; }
        .pg-layout { display: grid; grid-template-columns: 260px 1fr; gap: 24px; align-items: start; }
        @media(max-width: 900px) { .pg-layout { grid-template-columns: 1fr; } }

        /* Tabs */
        .pg-tabs {
          background: #fff; border: 1px solid var(--m-border, #e2e8f0);
          border-radius: 16px; overflow: hidden;
          position: sticky; top: 20px;
        }
        .pg-tab {
          width: 100%; display: flex; align-items: center; gap: 12px;
          padding: 14px 16px; border: none; background: none; cursor: pointer;
          border-bottom: 1px solid var(--m-border, #e2e8f0); text-align: left;
          transition: background 0.15s; font-family: var(--m-font, 'Inter', sans-serif);
        }
        .pg-tab:last-of-type { border-bottom: none; }
        .pg-tab:hover { background: var(--m-bg, #f8fafc); }
        .pg-tab.active { background: #f0fdf4; }
        .pg-tab-icon { font-size: 1.3rem; flex-shrink: 0; }
        .pg-tab-text { flex: 1; display: flex; flex-direction: column; gap: 1px; }
        .pg-tab-label { font-size: 0.87rem; font-weight: 600; color: var(--m-text, #0f172a); }
        .pg-tab.active .pg-tab-label { color: #15803D; }
        .pg-tab-desc { font-size: 0.73rem; color: var(--m-text-muted, #64748b); }
        .pg-tab-arrow { color: var(--m-text-muted, #64748b); flex-shrink: 0; opacity: 0; transition: opacity 0.15s; }
        .pg-tab:hover .pg-tab-arrow, .pg-tab.active .pg-tab-arrow { opacity: 1; color: #15803D; }

        .pg-links-section { padding: 12px 16px; border-top: 1px solid var(--m-border, #e2e8f0); }
        .pg-links-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--m-text-muted, #64748b); margin: 0 0 8px; }
        .pg-sf-link {
          display: flex; align-items: center; gap: 7px;
          font-size: 0.8rem; color: var(--m-text-muted, #64748b);
          text-decoration: none; padding: 5px 0; transition: color 0.15s;
        }
        .pg-sf-link:hover { color: #15803D; }

        /* Content Panel */
        .pg-panel { background: #fff; border: 1px solid var(--m-border, #e2e8f0); border-radius: 16px; }
        .pg-loading { display: flex; align-items: center; justify-content: center; gap: 14px; padding: 80px 40px; font-size: 0.9rem; color: var(--m-text-muted, #64748b); }
        .pg-form { padding: 28px 32px; display: flex; flex-direction: column; gap: 20px; }
        @media(max-width: 600px) { .pg-form { padding: 20px 16px; } }
        .pg-form-header { margin-bottom: 4px; }
        .pg-form-title { font-size: 1.2rem; font-weight: 800; color: var(--m-text, #0f172a); margin: 0 0 6px; }
        .pg-form-hint { font-size: 0.83rem; color: var(--m-text-muted, #64748b); margin: 0; }
        .pg-form-hint code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 0.82rem; }
        .pg-divider {
          display: flex; align-items: center; gap: 12px;
          font-size: 0.78rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.07em; color: var(--m-text-muted, #64748b);
          margin: 4px 0;
        }
        .pg-divider::before, .pg-divider::after { content: ''; flex: 1; height: 1px; background: var(--m-border, #e2e8f0); }
        .pg-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media(max-width: 600px) { .pg-grid-2 { grid-template-columns: 1fr; } }
        .pg-field { display: flex; flex-direction: column; gap: 6px; }
        .pg-label {
          font-size: 0.83rem; font-weight: 600; color: var(--m-text, #0f172a);
          display: flex; align-items: center; gap: 6px;
        }
        .pg-input {
          padding: 10px 14px; border: 1.5px solid var(--m-border, #e2e8f0);
          border-radius: 10px; font-size: 0.92rem; font-family: var(--m-font, 'Inter', sans-serif);
          color: var(--m-text, #0f172a); background: var(--m-bg, #f8fafc); outline: none;
          transition: border-color 0.2s, box-shadow 0.2s; width: 100%; box-sizing: border-box;
        }
        .pg-input:focus { border-color: #15803D; box-shadow: 0 0 0 3px rgba(21,128,61,0.1); background: #fff; }
        .pg-textarea {
          padding: 12px 14px; border: 1.5px solid var(--m-border, #e2e8f0);
          border-radius: 10px; font-size: 0.92rem; font-family: var(--m-font, 'Inter', sans-serif);
          color: var(--m-text, #0f172a); background: var(--m-bg, #f8fafc); outline: none;
          transition: border-color 0.2s, box-shadow 0.2s; resize: vertical; width: 100%; box-sizing: border-box;
          min-height: 80px; line-height: 1.6;
        }
        .pg-textarea.lg { min-height: 180px; }
        .pg-textarea.xl { min-height: 380px; }
        .pg-textarea:focus { border-color: #15803D; box-shadow: 0 0 0 3px rgba(21,128,61,0.1); background: #fff; }
        .pg-hint { font-size: 0.75rem; color: var(--m-text-muted, #64748b); }
        .pg-info-banner {
          display: flex; align-items: flex-start; gap: 10px; padding: 14px 16px;
          background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px;
          font-size: 0.84rem; color: #1d4ed8; line-height: 1.5;
        }
        .pg-info-banner svg { flex-shrink: 0; margin-top: 1px; }
        .pg-preview-card {
          background: var(--m-bg, #f8fafc); border: 1px solid var(--m-border, #e2e8f0);
          border-radius: 12px; padding: 16px 20px; margin-top: 4px;
        }
        .pg-preview-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--m-text-muted, #64748b); margin: 0 0 12px; }
        .pg-contact-preview { display: flex; flex-direction: column; gap: 8px; font-size: 0.85rem; color: var(--m-text, #0f172a); }
      `}</style>
    </div>
  );
};
