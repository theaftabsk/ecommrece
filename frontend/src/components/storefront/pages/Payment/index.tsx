import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { paymentApi, catalogApi } from '@oaksol/api-client';
import { Button } from '@oaksol/shared-ui';
import { Icons } from '../../icons';

const VERIFY_STEPS = [
  { icon: <Icons.Lock />, label: 'Securing client-server communication...' },
  { icon: <Icons.Signal />, label: 'Fetching Razorpay transaction signature...' },
  { icon: <Icons.Shield />, label: 'Verifying payload cryptographically on server...' },
  { icon: <Icons.Package />, label: 'Updating merchant inventory logs...' },
  { icon: <Icons.Check />, label: 'Confirming your order...' },
];

export const Payment: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as any) || {};

  const [order, setOrder] = useState<any>(null);
  const [shopName, setShopName] = useState('Our Store');
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [loadingPay, setLoadingPay] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyStep, setVerifyStep] = useState(0);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const verifyIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load order details and shop info
  useEffect(() => {
    async function load() {
      if (!orderId) { navigate('/'); return; }
      try {
        const [orderData, homeData] = await Promise.all([
          catalogApi.getPublicOrder(orderId),
          catalogApi.getHomepage().catch(() => null),
        ]);
        setOrder(orderData);
        if (homeData?.shop?.name) setShopName(homeData.shop.name);
      } catch (err: any) {
        setError(err.message || 'Failed to load order details.');
      } finally {
        setLoadingOrder(false);
      }
    }
    load();
  }, [orderId, navigate]);

  // Animate verification steps
  const startVerifyAnimation = () => {
    setVerifyStep(0);
    let step = 0;
    verifyIntervalRef.current = setInterval(() => {
      step++;
      if (step >= VERIFY_STEPS.length) {
        clearInterval(verifyIntervalRef.current!);
      } else {
        setVerifyStep(step);
      }
    }, 900);
  };

  const stopVerifyAnimation = () => {
    if (verifyIntervalRef.current) clearInterval(verifyIntervalRef.current);
  };

  useEffect(() => () => stopVerifyAnimation(), []);

  const handlePay = async () => {
    if (!orderId || !order) return;
    setLoadingPay(true);
    setError(null);

    try {
      // Initialize payment — get fresh Razorpay order
      const init = await paymentApi.initializeRazorpayPayment(orderId);

      const options = {
        key: init.razorpay_key_id,
        amount: Math.round(Number(init.total) * 100),
        currency: init.currency || 'INR',
        name: shopName,
        description: `Order #${init.order_number}`,
        order_id: init.razorpay_order_id,
        handler: async function (response: any) {
          // Show beautiful verification overlay
          setLoadingPay(false);
          setVerifying(true);
          startVerifyAnimation();

          try {
            await paymentApi.verifyPayment({
              orderId: orderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            stopVerifyAnimation();
            setVerifyStep(VERIFY_STEPS.length - 1);
            setVerified(true);
            // Small delay so user sees success animation then redirect
            setTimeout(() => navigate('/order-success'), 1800);
          } catch (err: any) {
            stopVerifyAnimation();
            setVerifying(false);
            setError(err.message || 'Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: state.customerName || '',
          email: state.customerEmail || '',
          contact: state.customerPhone || '',
        },
        theme: { color: '#15803D' },
        modal: {
          ondismiss: () => {
            setLoadingPay(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        setLoadingPay(false);
        setError(resp.error?.description || 'Payment failed. Please try again.');
      });
      rzp.open();
    } catch (err: any) {
      setLoadingPay(false);
      setError(err.message || 'Could not initialize payment. Please try again.');
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const fmt = (v: any) => `₹${Number(v || 0).toFixed(2)}`;

  // ─── Loading skeleton ─────────────────────────────────────────────────────────
  if (loadingOrder) {
    return (
      <div className="pay-loading-shell">
        <div className="pay-pulse-ring"></div>
        <p>Loading your order...</p>
        <style>{`
          .pay-loading-shell {
            min-height: 80vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 20px;
            color: var(--sf-text-muted);
            font-family: var(--font-sans);
          }
          .pay-pulse-ring {
            width: 60px; height: 60px;
            border-radius: 50%;
            border: 4px solid var(--sf-border);
            border-top-color: var(--sf-accent);
            animation: spin 0.9s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // ─── Verification Overlay ─────────────────────────────────────────────────────
  if (verifying) {
    return (
      <div className="verify-overlay">
        <div className="verify-card">
          {verified ? (
            <>
              <div className="verify-success-icon">
                <Icons.Checkmark />
              </div>
              <h2 className="verify-title success">Payment Verified!</h2>
              <p className="verify-sub">Redirecting to your order confirmation...</p>
            </>
          ) : (
            <>
              <div className="verify-spinner-wrap">
                <div className="verify-glow-ring"></div>
                <div className="verify-lock">
                  <Icons.CheckCircleLg />
                </div>
              </div>
              <h2 className="verify-title">Verifying Payment</h2>
              <p className="verify-sub">Secure cryptographic signature check in progress</p>
              <div className="verify-steps">
                {VERIFY_STEPS.map((step, i) => (
                  <div
                    key={i}
                    className={`verify-step ${i <= verifyStep ? 'active' : ''} ${i < verifyStep ? 'done' : ''}`}
                  >
                    <span className="step-icon">{i < verifyStep ? <Icons.CheckDone /> : step.icon}</span>
                    <span className="step-label">{step.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <style>{`
          .verify-overlay {
            position: fixed; inset: 0; z-index: 9999;
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(12px);
            display: flex; align-items: center; justify-content: center;
            padding: 20px;
          }

          .verify-card {
            background: linear-gradient(145deg, #0f172a, #1a2744);
            border: 1px solid rgba(21, 128, 61, 0.3);
            border-radius: 24px;
            padding: 50px 40px;
            max-width: 440px;
            width: 100%;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 24px;
            box-shadow: 0 0 60px rgba(21, 128, 61, 0.15), 0 25px 50px rgba(0,0,0,0.5);
            animation: cardPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }

          @keyframes cardPop {
            from { opacity: 0; transform: scale(0.88) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }

          .verify-spinner-wrap {
            position: relative;
            width: 90px; height: 90px;
            display: flex; align-items: center; justify-content: center;
          }

          .verify-glow-ring {
            position: absolute; inset: 0;
            border-radius: 50%;
            border: 3px solid transparent;
            border-top-color: #22c55e;
            border-right-color: rgba(34, 197, 94, 0.3);
            animation: spinGlow 1.1s linear infinite;
            box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
          }

          @keyframes spinGlow { to { transform: rotate(360deg); } }

          .verify-lock {
            font-size: 2.2rem;
            animation: pulse 2s ease-in-out infinite;
          }

          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }

          .verify-title {
            font-family: var(--font-serif);
            font-size: 1.6rem;
            color: #f1f5f9;
            margin: 0;
          }
          .verify-title.success { color: #22c55e; }

          .verify-sub {
            color: #64748b;
            font-size: 0.9rem;
            margin: -10px 0 0;
          }

          .verify-steps {
            display: flex; flex-direction: column; gap: 10px;
            width: 100%;
            text-align: left;
          }

          .verify-step {
            display: flex; align-items: center; gap: 12px;
            padding: 10px 14px;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.05);
            background: rgba(255,255,255,0.02);
            transition: all 0.4s ease;
            opacity: 0.35;
          }

          .verify-step.active {
            opacity: 1;
            border-color: rgba(34, 197, 94, 0.25);
            background: rgba(34, 197, 94, 0.06);
          }

          .verify-step.done {
            opacity: 0.7;
            border-color: rgba(34, 197, 94, 0.15);
          }

          .step-icon {
            font-size: 1.1rem;
            min-width: 24px;
            text-align: center;
          }

          .step-label {
            font-size: 0.85rem;
            color: #94a3b8;
            font-family: var(--font-sans);
          }

          .verify-step.active .step-label { color: #e2e8f0; }

          /* Success checkmark SVG animation */
          .verify-success-icon {
            display: flex; align-items: center; justify-content: center;
          }

          .checkmark-svg {
            width: 90px; height: 90px;
          }

          .checkmark-circle {
            stroke: #22c55e;
            stroke-width: 2;
            stroke-dasharray: 166;
            stroke-dashoffset: 166;
            animation: strokeDraw 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
          }

          .checkmark-check {
            stroke: #22c55e;
            stroke-width: 3;
            stroke-linecap: round;
            stroke-linejoin: round;
            stroke-dasharray: 48;
            stroke-dashoffset: 48;
            animation: strokeDraw 0.4s 0.5s cubic-bezier(0.65, 0, 0.45, 1) forwards;
          }

          @keyframes strokeDraw {
            to { stroke-dashoffset: 0; }
          }
        `}</style>
      </div>
    );
  }

  // ─── Main Payment Page ────────────────────────────────────────────────────────
  const shippingAddr = order?.shipping_address || {};
  const items: any[] = order?.items || [];

  return (
    <div className="pay-page">
      {/* Header */}
      <div className="pay-header">
        <div className="pay-header-inner">
          <button className="pay-back-btn" onClick={() => navigate(-1)}>
            <Icons.ChevronLeft />
            Back
          </button>
          <div className="pay-brand">
            <span className="pay-lock-icon"><Icons.CheckGreen /></span>
            <span>{shopName}</span>
            <span className="pay-secure-badge">Secure Checkout</span>
          </div>
        </div>
      </div>

      <div className="pay-layout">
        {/* ── Left: Order Summary ── */}
        <div className="pay-summary-card">
          <h2 className="pay-section-title">Order Summary</h2>
          <p className="pay-order-num">Order #{order?.order_number}</p>

          <div className="pay-items-list">
            {items.map((item, i) => {
              const snap = (item.product_snap as any) || {};
              return (
                <div className="pay-item-row" key={i}>
                  <div className="pay-item-thumb">
                    {snap.image_url ? (
                      <img src={snap.image_url} alt={snap.name} />
                    ) : (
                      <div className="pay-item-thumb-placeholder">
                        <Icons.Package />
                      </div>
                    )}
                  </div>
                  <div className="pay-item-details">
                    <span className="pay-item-name">{snap.name || 'Product'}</span>
                    {snap.label && <span className="pay-item-variant">{snap.label}</span>}
                    <span className="pay-item-qty">Qty: {item.qty}</span>
                  </div>
                  <div className="pay-item-price">{fmt(item.line_total)}</div>
                </div>
              );
            })}
          </div>

          <div className="pay-price-breakdown">
            <div className="pay-price-row">
              <span>Subtotal</span>
              <span>{fmt(order?.subtotal)}</span>
            </div>
            <div className="pay-price-row">
              <span>Shipping</span>
              <span className={Number(order?.shipping_amount) === 0 ? 'free-tag' : ''}>
                {Number(order?.shipping_amount) === 0 ? 'FREE' : fmt(order?.shipping_amount)}
              </span>
            </div>
            {Number(order?.discount_amount) > 0 && (
              <div className="pay-price-row discount">
                <span>Discount</span>
                <span>-{fmt(order?.discount_amount)}</span>
              </div>
            )}
            <div className="pay-price-row total">
              <span>Total Payable</span>
              <span>{fmt(order?.total)}</span>
            </div>
          </div>

          {/* Shipping Address */}
          {shippingAddr.address_line1 && (
            <div className="pay-address-box">
              <div className="pay-address-title">
                <Icons.CheckGreen />
                Delivery Address
              </div>
              <p className="pay-address-text">
                {shippingAddr.address_line1}{shippingAddr.city ? `, ${shippingAddr.city}` : ''}
                {shippingAddr.state ? `, ${shippingAddr.state}` : ''}
                {shippingAddr.postal_code ? ` - ${shippingAddr.postal_code}` : ''}
              </p>
            </div>
          )}
        </div>

        {/* ── Right: Payment Action Card ── */}
        <div className="pay-action-card">
          <div className="pay-action-header">
            <div className="pay-gateway-icon">
              <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="12" fill="#0F172A" />
                <path d="M8 18h32M8 24h20" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
                <rect x="28" y="28" width="12" height="8" rx="2" fill="#22c55e" opacity="0.7" />
              </svg>
            </div>
            <div>
              <h3 className="pay-action-title">Pay with Razorpay</h3>
              <p className="pay-action-sub">Cards · UPI · NetBanking · Wallets</p>
            </div>
          </div>

          <div className="pay-amount-display">
            <span className="pay-amount-label">Amount Due</span>
            <span className="pay-amount-value">{fmt(order?.total)}</span>
          </div>

          {error && (
            <div className="pay-error-box">
              <Icons.AlertCircle />
              <span>{error}</span>
            </div>
          )}

          <Button
            variant="storefront"
            style={{ width: '100%', padding: '16px', fontSize: '1.05rem', fontWeight: 700 }}
            loading={loadingPay}
            onClick={handlePay}
          >
            {loadingPay ? 'Initializing...' : `Pay ${fmt(order?.total)} Securely`}
          </Button>

          <div className="pay-security-badges">
            <div className="pay-badge"><Icons.LockSm /> 256-bit SSL</div>
            <div className="pay-badge"><Icons.ShieldSm /> PCI DSS Compliant</div>
            <div className="pay-badge"><Icons.CheckSm /> Signature Verified</div>
          </div>

          <p className="pay-footer-note">
            By completing this purchase you agree to our terms. Your payment is processed securely via Razorpay.
          </p>
        </div>
      </div>

      <style>{`
        .pay-page {
          min-height: 100vh;
          background: var(--sf-bg);
          font-family: var(--font-sans);
        }

        /* ── Header ── */
        .pay-header {
          background: #0F172A;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding: 16px 5%;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .pay-header-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }
        .pay-back-btn {
          display: flex; align-items: center; gap: 6px;
          background: none; border: none;
          color: #64748b; font-size: 0.9rem; cursor: pointer;
          transition: color 0.2s;
          font-family: var(--font-sans);
        }
        .pay-back-btn:hover { color: #f1f5f9; }
        .pay-brand {
          display: flex; align-items: center; gap: 10px;
          color: #f1f5f9;
          font-size: 1.05rem;
          font-weight: 600;
          font-family: var(--font-serif);
        }
        .pay-lock-icon { font-size: 1.1rem; }
        .pay-secure-badge {
          font-size: 0.72rem;
          font-family: var(--font-sans);
          font-weight: 600;
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #22c55e;
          padding: 3px 9px;
          border-radius: 20px;
          letter-spacing: 0.05em;
        }

        /* ── Layout ── */
        .pay-layout {
          max-width: 1100px;
          margin: 40px auto;
          padding: 0 5% 60px;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 32px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .pay-layout { grid-template-columns: 1fr; }
        }

        /* ── Summary Card ── */
        .pay-summary-card {
          background: #fff;
          border: 1px solid var(--sf-border);
          border-radius: 20px;
          padding: 36px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .pay-section-title {
          font-family: var(--font-serif);
          font-size: 1.4rem;
          color: var(--sf-text-main);
          margin: 0;
        }
        .pay-order-num {
          font-size: 0.82rem;
          color: var(--sf-text-muted);
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin: -16px 0 0;
        }

        /* ── Items ── */
        .pay-items-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .pay-item-row {
          display: flex; align-items: center; gap: 14px;
        }
        .pay-item-thumb {
          width: 56px; height: 56px;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid var(--sf-border);
          flex-shrink: 0;
          background: var(--sf-bg);
          display: flex; align-items: center; justify-content: center;
        }
        .pay-item-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .pay-item-thumb-placeholder { font-size: 1.4rem; }
        .pay-item-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .pay-item-name { font-size: 0.9rem; font-weight: 600; color: var(--sf-text-main); }
        .pay-item-variant { font-size: 0.8rem; color: var(--sf-text-muted); }
        .pay-item-qty { font-size: 0.78rem; color: var(--sf-accent); font-weight: 600; }
        .pay-item-price { font-size: 0.95rem; font-weight: 700; color: var(--sf-text-main); }

        /* ── Price Breakdown ── */
        .pay-price-breakdown {
          border-top: 1px dashed var(--sf-border);
          padding-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .pay-price-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: var(--sf-text-muted);
        }
        .pay-price-row.total {
          border-top: 1px solid var(--sf-border);
          padding-top: 12px;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--sf-text-main);
        }
        .pay-price-row.discount span:last-child { color: #22c55e; }
        .free-tag { color: #22c55e; font-weight: 700; }

        /* ── Address Box ── */
        .pay-address-box {
          background: var(--sf-bg);
          border: 1px solid var(--sf-border);
          border-radius: 12px;
          padding: 16px;
        }
        .pay-address-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--sf-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 8px;
          display: flex; align-items: center; gap: 6px;
        }
        .pay-address-text {
          font-size: 0.9rem;
          color: var(--sf-text-main);
          line-height: 1.5;
          margin: 0;
        }

        /* ── Action Card ── */
        .pay-action-card {
          background: #fff;
          border: 1px solid var(--sf-border);
          border-radius: 20px;
          padding: 36px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          gap: 24px;
          position: sticky;
          top: 90px;
        }
        .pay-action-header {
          display: flex; align-items: center; gap: 16px;
        }
        .pay-gateway-icon {
          flex-shrink: 0;
          border-radius: 12px;
          overflow: hidden;
        }
        .pay-action-title {
          font-family: var(--font-serif);
          font-size: 1.2rem;
          color: var(--sf-text-main);
          margin: 0 0 4px;
        }
        .pay-action-sub {
          font-size: 0.8rem;
          color: var(--sf-text-muted);
          margin: 0;
        }

        .pay-amount-display {
          background: linear-gradient(135deg, #0f172a, #1e293b);
          border-radius: 14px;
          padding: 22px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .pay-amount-label {
          font-size: 0.85rem;
          color: #64748b;
          font-weight: 500;
        }
        .pay-amount-value {
          font-size: 1.8rem;
          font-weight: 800;
          color: #f1f5f9;
          font-family: var(--font-serif);
        }

        .pay-error-box {
          background: #fef2f2;
          border: 1px solid #fca5a5;
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 0.87rem;
          color: #dc2626;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          animation: shake 0.4s ease;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }

        .pay-security-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .pay-badge {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--sf-text-muted);
          background: var(--sf-bg);
          border: 1px solid var(--sf-border);
          border-radius: 20px;
          padding: 5px 12px;
          display: flex; align-items: center; gap: 5px;
        }

        .pay-footer-note {
          font-size: 0.75rem;
          color: var(--sf-text-muted);
          text-align: center;
          line-height: 1.5;
          margin: 0;
        }

        @media (max-width: 768px) {
          .pay-summary-card, .pay-action-card { padding: 24px 20px; }
          .pay-amount-value { font-size: 1.4rem; }
          .pay-action-card { position: static; }
        }
      `}</style>
    </div>
  );
};
