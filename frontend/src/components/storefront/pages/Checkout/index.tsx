import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { Button } from '@oaksol/shared-ui';
import { useNavigate } from 'react-router-dom';
import { catalogApi, paymentApi } from '@oaksol/api-client';

export const Checkout: React.FC = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  // Address Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  
  const [payMethod, setPayMethod] = useState<string>('');
  const [gateways, setGateways] = useState<any[]>([]);
  const [loadingGateways, setLoadingGateways] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGateways() {
      try {
        const data = await paymentApi.getPaymentGateways();
        const active = data.filter((g: any) => g.is_active);
        setGateways(active);
        if (active.length > 0) {
          setPayMethod(active[0].slug);
        }
      } catch (err: any) {
        console.error('Failed to load gateways:', err);
      } finally {
        setLoadingGateways(false);
      }
    }
    loadGateways();
  }, []);

  if (cartItems.length === 0) {
    return (
      <div className="checkout-empty">
        <h3>Your cart is empty</h3>
        <p>Please add products to your cart before checking out.</p>
        <Button variant="storefront" onClick={() => navigate('/')}>Continue Shopping</Button>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !address || !city || !state || !pincode) {
      setError('Please fill in all address details.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Place the order in the database for all payment methods
      const orderResult = await catalogApi.placeOrder({
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        shipping_address: {
          address_line1: address,
          city: city,
          state: state,
          postal_code: pincode,
          country: 'IN'
        },
        payment_method: payMethod,
        items: cartItems.map(item => ({
          variant_id: item.variantId,
          qty: item.qty
        }))
      });

      // 2. If it is Cash on Delivery, no online payment is required
      if (!orderResult.paymentRequired) {
        clearCart();
        navigate('/order-success');
        return;
      }

      // 3. For Razorpay, navigate to dedicated payment page with order context
      if (payMethod === 'razorpay') {
        clearCart();
        navigate(`/checkout/payment/${orderResult.order.id}`, {
          state: {
            customerName: name,
            customerEmail: email,
            customerPhone: phone,
          }
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize payment.');
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <h1 className="checkout-title">Checkout</h1>
      
      <div className="checkout-layout">
        {/* Left Section: Billing & Address forms */}
        <form className="checkout-form" onSubmit={handlePlaceOrder}>
          <div className="form-section">
            <h3>Shipping Details</h3>
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group-row">
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label>Address *</label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} required />
            </div>
            <div className="form-group-row">
              <div className="form-group">
                <label>City *</label>
                <input type="text" value={city} onChange={e => setCity(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>State *</label>
                <input type="text" value={state} onChange={e => setState(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Pincode *</label>
                <input type="text" value={pincode} onChange={e => setPincode(e.target.value)} required />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Payment Method</h3>
            {loadingGateways ? (
              <div style={{ color: 'var(--sf-text-muted)', fontSize: '0.9rem' }}>Loading payment options...</div>
            ) : gateways.length === 0 ? (
              <div style={{ color: '#DC2626', fontSize: '0.9rem', fontWeight: 600 }}>No active payment methods configured for this shop. Please contact the administrator.</div>
            ) : (
              <div className="payment-options">
                {gateways.map(g => (
                  <label key={g.id} className={`payment-option-card ${payMethod === g.slug ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={payMethod === g.slug}
                      onChange={() => setPayMethod(g.slug)}
                    />
                    <div className="payment-desc">
                      <strong>{g.name}</strong>
                      <span>
                        {g.slug === 'cod' 
                          ? 'Pay with cash when package is delivered' 
                          : 'Pay securely online using Cards, UPI, Netbanking or Wallet'}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {error && <div className="checkout-error-banner">{error}</div>}

          <Button 
            type="submit" 
            variant="storefront" 
            style={{ width: '100%', padding: '16px' }} 
            loading={loading}
            disabled={gateways.length === 0}
          >
            {payMethod === 'cod' ? 'Place COD Order' : 'Proceed to Payment'}
          </Button>
        </form>

        {/* Right Section: Order summary */}
        <div className="order-summary-sidebar">
          <h3>Order Summary</h3>
          <div className="summary-items">
            {cartItems.map((item) => (
              <div className="summary-item-row" key={item.variantId}>
                <span>{item.name} ({item.variantLabel}) <strong className="qty-multiplier">x{item.qty}</strong></span>
                <span>₹{(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="summary-pricing">
            <div className="pricing-row">
              <span>Cart Subtotal</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>
            <div className="pricing-row">
              <span>Shipping Fee</span>
              <span className="free-shipping-text">{cartTotal >= 500 ? 'FREE' : '₹50.00'}</span>
            </div>
            <div className="pricing-row total">
              <span>Total Payable</span>
              <span>₹{(cartTotal >= 500 ? cartTotal : cartTotal + 50).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .checkout-page {
          padding: 40px 5%;
          background: var(--sf-bg);
          min-height: 80vh;
        }

        .checkout-title {
          font-family: var(--font-serif);
          font-size: 2.5rem;
          color: var(--sf-text-main);
          margin-bottom: 30px;
        }

        .checkout-empty {
          text-align: center;
          padding: 80px 0;
          color: var(--sf-text-muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }

        .checkout-layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 40px;
          align-items: start;
        }

        @media (max-width: 992px) {
          .checkout-layout { grid-template-columns: 1fr; }
        }

        .checkout-form {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .form-section {
          background: #FFFFFF;
          border: 1px solid var(--sf-border);
          border-radius: var(--radius-md);
          padding: 30px;
        }

        .form-section h3 {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          color: var(--sf-text-main);
          margin-bottom: 20px;
          border-bottom: 1px solid var(--sf-border);
          padding-bottom: 8px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }

        .form-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--sf-text-main);
        }

        .form-group input {
          border: 1px solid var(--sf-border);
          border-radius: var(--radius-sm);
          padding: 10px 14px;
          font-family: var(--font-sans);
          font-size: 0.95rem;
          outline: none;
          transition: border-color var(--transition-fast);
        }

        .form-group input:focus {
          border-color: var(--sf-accent);
        }

        .form-group-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 15px;
        }

        .payment-options {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .payment-option-card {
          border: 1px solid var(--sf-border);
          border-radius: var(--radius-md);
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 15px;
          cursor: pointer;
          transition: border-color var(--transition-fast), background-color var(--transition-fast);
        }

        .payment-option-card.active {
          border-color: var(--sf-accent);
          background: #FAFBF9;
        }

        .payment-desc {
          display: flex;
          flex-direction: column;
        }

        .payment-desc strong {
          font-size: 0.95rem;
          color: var(--sf-text-main);
        }

        .payment-desc span {
          font-size: 0.8rem;
          color: var(--sf-text-muted);
        }

        .checkout-error-banner {
          background: #FEF2F2;
          color: #EF4444;
          border: 1px solid #FCA5A5;
          border-radius: var(--radius-sm);
          padding: 12px;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .order-summary-sidebar {
          background: #FFFFFF;
          border: 1px solid var(--sf-border);
          border-radius: var(--radius-md);
          padding: 30px;
        }

        .order-summary-sidebar h3 {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--sf-border);
          padding-bottom: 8px;
        }

        .summary-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .summary-item-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: var(--sf-text-main);
        }

        .qty-multiplier {
          color: var(--sf-accent);
        }

        .summary-pricing {
          border-top: 1px solid var(--sf-border);
          padding-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .pricing-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.95rem;
          color: var(--sf-text-muted);
        }

        .free-shipping-text {
          color: var(--sf-accent);
          font-weight: 600;
        }

        .pricing-row.total {
          border-top: 1px dashed var(--sf-border);
          padding-top: 12px;
          font-weight: 700;
          font-size: 1.15rem;
          color: var(--sf-text-main);
        }

        @media (max-width: 768px) {
          .checkout-page {
            padding: 20px 4%;
          }
          .checkout-title {
            font-size: 1.75rem;
            margin-bottom: 20px;
          }
          .form-section {
            padding: 20px 15px;
          }
          .form-group-row {
            grid-template-columns: 1fr;
            gap: 0;
          }
          .payment-option-card {
            padding: 12px;
            gap: 10px;
          }
          .order-summary-sidebar {
            padding: 20px 15px;
          }
        }
      `}</style>
    </div>
  );
};
