import React, { useEffect, useState } from 'react';
import { customerApi } from '../../../../lib/api-client';

export const Contact: React.FC = () => {
  const [pageData, setPageData] = useState<{ shop: any; content: Record<string, string> } | null>(null);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { customerApi.getPages().then(setPageData).catch(() => {}); }, []);

  const shop = pageData?.shop;
  const c = pageData?.content || {};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true); setError(null);
    try {
      await customerApi.submitContact(form);
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send message. Please try again.');
    } finally { setSending(false); }
  };

  return (
    <div className="sp-page">
      <div className="sp-hero contact-hero">
        <div className="sp-hero-inner">
          <div className="contact-hero-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--sf-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.63 19.79 19.79 0 0 1 0 1.99 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/>
            </svg>
          </div>
          <h1 className="sp-hero-title">Contact Us</h1>
          <p className="sp-hero-sub">We'd love to hear from you. Send us a message!</p>
        </div>
      </div>

      <div className="sp-body">
        <div className="contact-grid">
          {/* Contact Info */}
          <div className="contact-info">
            <h2 className="sp-section-title" style={{ textAlign: 'left', marginBottom: '24px' }}>Get in Touch</h2>
            {[
              { icon: '📧', label: 'Email', val: c.contact_email || 'support@' + (shop?.name?.toLowerCase().replace(/\s/g,'') || 'shop') + '.com' },
              { icon: '📱', label: 'Phone', val: c.contact_phone || '+91 98765 43210' },
              { icon: '📍', label: 'Address', val: c.contact_address || 'India' },
              { icon: '🕐', label: 'Working Hours', val: c.contact_hours || 'Mon–Sat, 9am–6pm' },
            ].map(info => (
              <div key={info.label} className="contact-info-row">
                <span className="contact-info-icon">{info.icon}</span>
                <div>
                  <div className="contact-info-label">{info.label}</div>
                  <div className="contact-info-val">{info.val}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="contact-form-card">
            {sent ? (
              <div className="contact-success">
                <div className="contact-success-icon">✉️</div>
                <h3>Message Sent!</h3>
                <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
                <button className="contact-again-btn" onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}>
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <h2 className="contact-form-title">Send a Message</h2>
                {error && <div className="contact-error">{error}</div>}
                <div className="contact-row">
                  <div className="acct-field">
                    <label className="acct-label">Your Name</label>
                    <input className="acct-input" type="text" required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Priya Sharma" />
                  </div>
                  <div className="acct-field">
                    <label className="acct-label">Email</label>
                    <input className="acct-input" type="email" required value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="you@example.com" />
                  </div>
                </div>
                <div className="acct-field">
                  <label className="acct-label">Subject</label>
                  <input className="acct-input" type="text" value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))} placeholder="How can we help?" />
                </div>
                <div className="acct-field">
                  <label className="acct-label">Message</label>
                  <textarea className="acct-input contact-textarea" required value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))} placeholder="Tell us more…" rows={5} />
                </div>
                <button type="submit" className="auth-submit-btn" disabled={sending}>
                  {sending ? <><span className="auth-spinner"/>&nbsp;Sending…</> : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .sp-page { min-height: 100vh; background: var(--sf-bg); font-family: var(--font-sans); }
        .sp-hero { padding: 60px 5%; text-align: center; }
        .contact-hero { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%); border-bottom: 1px solid #bfdbfe; }
        .sp-hero-inner { max-width: 640px; margin: 0 auto; }
        .contact-hero-icon { width: 68px; height: 68px; background: #fff; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; box-shadow: 0 4px 20px rgba(59,130,246,0.15); }
        .sp-hero-title { font-family: var(--font-serif); font-size: 2.4rem; color: var(--sf-text-main); margin: 0 0 10px; }
        .sp-hero-sub { font-size: 1rem; color: var(--sf-text-muted); margin: 0; }
        .sp-body { padding: 60px 5% 80px; }
        .contact-grid { max-width: 980px; margin: 0 auto; display: grid; grid-template-columns: 320px 1fr; gap: 40px; align-items: start; }
        @media(max-width: 768px) { .contact-grid { grid-template-columns: 1fr; } }
        .contact-info { display: flex; flex-direction: column; gap: 20px; }
        .sp-section-title { font-family: var(--font-serif); font-size: 1.6rem; color: var(--sf-text-main); }
        .contact-info-row { display: flex; align-items: flex-start; gap: 14px; padding: 16px; background: #fff; border: 1px solid var(--sf-border); border-radius: 14px; }
        .contact-info-icon { font-size: 1.4rem; flex-shrink: 0; }
        .contact-info-label { font-size: 0.76rem; font-weight: 700; color: var(--sf-text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
        .contact-info-val { font-size: 0.9rem; color: var(--sf-text-main); font-weight: 500; }
        .contact-form-card { background: #fff; border: 1px solid var(--sf-border); border-radius: 24px; padding: 36px; }
        .contact-form { display: flex; flex-direction: column; gap: 18px; }
        .contact-form-title { font-family: var(--font-serif); font-size: 1.4rem; color: var(--sf-text-main); margin: 0 0 4px; }
        .contact-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media(max-width: 480px) { .contact-row { grid-template-columns: 1fr; } }
        .contact-error { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 10px; padding: 12px; color: #dc2626; font-size: 0.87rem; }
        .contact-textarea { resize: vertical; min-height: 120px; }
        .contact-success { text-align: center; padding: 40px 20px; display: flex; flex-direction: column; align-items: center; gap: 14px; }
        .contact-success-icon { font-size: 3rem; }
        .contact-success h3 { font-family: var(--font-serif); font-size: 1.6rem; color: var(--sf-text-main); margin: 0; }
        .contact-success p { font-size: 0.9rem; color: var(--sf-text-muted); margin: 0; }
        .contact-again-btn { padding: 12px 28px; background: var(--sf-accent-light); color: var(--sf-accent); border: 1.5px solid var(--sf-accent); border-radius: 50px; font-weight: 700; font-size: 0.9rem; cursor: pointer; font-family: var(--font-sans); transition: all 0.2s; }
        .contact-again-btn:hover { background: var(--sf-accent); color: #fff; }
        .acct-field { display: flex; flex-direction: column; gap: 6px; }
        .acct-label { font-size: 0.85rem; font-weight: 600; color: var(--sf-text-main); }
        .acct-input { padding: 11px 14px; border: 1.5px solid var(--sf-border); border-radius: 10px; font-size: 0.95rem; font-family: var(--font-sans); color: var(--sf-text-main); background: var(--sf-bg); outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .acct-input:focus { border-color: var(--sf-accent); box-shadow: 0 0 0 3px var(--sf-accent-light); }
        .auth-submit-btn { width: 100%; padding: 14px; background: var(--sf-accent); color: #fff; border: none; border-radius: 12px; font-size: 1rem; font-weight: 700; font-family: var(--font-sans); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s; }
        .auth-submit-btn:hover:not(:disabled) { background: var(--sf-accent-dark, #166534); }
        .auth-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .auth-spinner { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; animation: spin 0.8s linear infinite; display: inline-block; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
