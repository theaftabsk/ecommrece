import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCustomer } from '../../context/CustomerContext';

export const Register: React.FC = () => {
  const { register } = useCustomer();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPw) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await register(name, email, password, phone || undefined);
      navigate('/account');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', '#dc2626', '#f59e0b', '#15803D'];

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-wrap">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join us and start shopping today</p>
        </div>

        {error && (
          <div className="auth-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-row">
            <div className="auth-field">
              <label className="auth-label">Full Name</label>
              <input type="text" className="auth-input" placeholder="Priya Sharma"
                value={name} onChange={e => setName(e.target.value)} required autoFocus />
            </div>
            <div className="auth-field">
              <label className="auth-label">Phone (optional)</label>
              <input type="tel" className="auth-input" placeholder="+91 98765 43210"
                value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Email Address</label>
            <input type="email" className="auth-input" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className="auth-field">
            <label className="auth-label">
              Password
              <button type="button" className="show-pw-btn" onClick={() => setShowPw(p => !p)}>
                {showPw ? 'Hide' : 'Show'}
              </button>
            </label>
            <input type={showPw ? 'text' : 'password'} className="auth-input" placeholder="Min 6 characters"
              value={password} onChange={e => setPassword(e.target.value)} required />
            {password.length > 0 && (
              <div className="pw-strength">
                <div className="pw-bar-track">
                  {[1,2,3].map(i => (
                    <div key={i} className="pw-bar" style={{ background: i <= strength ? strengthColor[strength] : '#e5e7eb' }} />
                  ))}
                </div>
                <span style={{ color: strengthColor[strength] }}>{strengthLabel[strength]}</span>
              </div>
            )}
          </div>

          <div className="auth-field">
            <label className="auth-label">Confirm Password</label>
            <input type={showPw ? 'text' : 'password'} className="auth-input" placeholder="Re-enter password"
              value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? <><span className="auth-spinner"/>&nbsp;Creating account…</> : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-link">Sign in</Link></p>
        </div>
      </div>

      <style>{`
        .auth-page { min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 40px 20px; background: var(--sf-bg); font-family: var(--font-sans); }
        .auth-card { width: 100%; max-width: 500px; background: #fff; border: 1px solid var(--sf-border); border-radius: 24px; padding: 44px 40px; box-shadow: 0 8px 48px rgba(0,0,0,0.07); animation: authIn 0.4s cubic-bezier(0.175,0.885,0.32,1.2) forwards; }
        @keyframes authIn { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: none; } }
        .auth-header { text-align: center; margin-bottom: 28px; }
        .auth-icon-wrap { width: 64px; height: 64px; border-radius: 20px; background: var(--sf-accent-light); color: var(--sf-accent); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
        .auth-title { font-family: var(--font-serif); font-size: 1.7rem; color: var(--sf-text-main); margin: 0 0 6px; }
        .auth-subtitle { font-size: 0.9rem; color: var(--sf-text-muted); margin: 0; }
        .auth-error { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 10px; padding: 12px 14px; font-size: 0.87rem; color: #dc2626; display: flex; align-items: center; gap: 8px; margin-bottom: 20px; animation: shake 0.4s ease; }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
        .auth-form { display: flex; flex-direction: column; gap: 18px; }
        .auth-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media(max-width: 480px) { .auth-row { grid-template-columns: 1fr; } .auth-card { padding: 32px 24px; } }
        .auth-field { display: flex; flex-direction: column; gap: 6px; }
        .auth-label { font-size: 0.85rem; font-weight: 600; color: var(--sf-text-main); display: flex; align-items: center; justify-content: space-between; }
        .show-pw-btn { font-size: 0.78rem; color: var(--sf-accent); background: none; border: none; cursor: pointer; font-family: var(--font-sans); font-weight: 600; }
        .auth-input { padding: 12px 14px; border: 1.5px solid var(--sf-border); border-radius: 10px; font-size: 0.95rem; font-family: var(--font-sans); color: var(--sf-text-main); background: var(--sf-bg); outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .auth-input:focus { border-color: var(--sf-accent); box-shadow: 0 0 0 3px var(--sf-accent-light); }
        .auth-input::placeholder { color: var(--sf-text-muted); }
        .pw-strength { display: flex; align-items: center; gap: 10px; margin-top: 4px; font-size: 0.78rem; font-weight: 600; }
        .pw-bar-track { display: flex; gap: 4px; flex: 1; }
        .pw-bar { height: 4px; flex: 1; border-radius: 2px; transition: background 0.3s; }
        .auth-submit-btn { width: 100%; padding: 14px; background: var(--sf-accent); color: #fff; border: none; border-radius: 12px; font-size: 1rem; font-weight: 700; font-family: var(--font-sans); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s, transform 0.15s; margin-top: 4px; }
        .auth-submit-btn:hover:not(:disabled) { background: var(--sf-accent-dark, #166534); }
        .auth-submit-btn:active:not(:disabled) { transform: scale(0.98); }
        .auth-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .auth-spinner { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; animation: spin 0.8s linear infinite; display: inline-block; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-footer { text-align: center; margin-top: 24px; font-size: 0.88rem; color: var(--sf-text-muted); }
        .auth-link { color: var(--sf-accent); font-weight: 600; text-decoration: none; }
        .auth-link:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
};
