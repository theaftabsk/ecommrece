import React, { useEffect, useState } from 'react';
import { Button } from '@oaksol/shared-ui';
import { useNavigate } from 'react-router-dom';
import { catalogApi } from '@oaksol/api-client';

export const Success: React.FC = () => {
  const navigate = useNavigate();
  const [shopName, setShopName] = useState('our store');

  useEffect(() => {
    catalogApi.getHomepage()
      .then((data: any) => {
        if (data?.shop?.name) setShopName(data.shop.name);
      })
      .catch(() => {/* ignore */});
  }, []);

  return (
    <div className="success-page">
      <div className="success-card animate-pop">

        {/* Animated checkmark */}
        <div className="success-checkmark-wrapper">
          <svg viewBox="0 0 52 52" className="checkmark-svg">
            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>

        <h1>Order Confirmed!</h1>
        <p>Thank you for shopping with <strong>{shopName}</strong>. Your payment has been received and your order has been placed successfully.</p>
        <span className="order-tracking-info">A confirmation notification with your tracking details will be sent shortly.</span>

        <div className="success-actions">
          <Button variant="storefront" onClick={() => navigate('/')} style={{ marginTop: '8px' }}>
            Continue Shopping
          </Button>
        </div>
      </div>

      <style>{`
        .success-page {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--sf-bg);
          padding: 20px;
        }

        .success-card {
          background: #FFFFFF;
          border: 1px solid var(--sf-border);
          border-radius: var(--radius-lg);
          padding: 56px 44px;
          max-width: 520px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .animate-pop {
          animation: pop 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        @keyframes pop {
          from { opacity: 0; transform: scale(0.88) translateY(16px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* SVG Checkmark */
        .success-checkmark-wrapper {
          margin-bottom: 8px;
        }

        .checkmark-svg {
          width: 88px;
          height: 88px;
        }

        .checkmark-circle {
          stroke: var(--sf-accent);
          stroke-width: 2;
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          animation: strokeDraw 0.7s cubic-bezier(0.65, 0, 0.45, 1) 0.2s forwards;
        }

        .checkmark-check {
          stroke: var(--sf-accent);
          stroke-width: 3.5;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 50;
          stroke-dashoffset: 50;
          animation: strokeDraw 0.4s cubic-bezier(0.65, 0, 0.45, 1) 0.7s forwards;
        }

        @keyframes strokeDraw {
          to { stroke-dashoffset: 0; }
        }

        .success-card h1 {
          font-family: var(--font-serif);
          font-size: 2.25rem;
          color: var(--sf-text-main);
          margin: 0;
        }

        .success-card p {
          font-size: 1rem;
          color: var(--sf-text-muted);
          line-height: 1.6;
          margin: 0;
          max-width: 380px;
        }

        .success-card strong {
          color: var(--sf-accent);
        }

        .order-tracking-info {
          font-size: 0.85rem;
          color: var(--sf-accent);
          font-weight: 500;
          background: var(--sf-accent-light);
          padding: 8px 16px;
          border-radius: var(--radius-full);
        }

        .success-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          width: 100%;
        }

        @media (max-width: 576px) {
          .success-card {
            padding: 36px 22px;
            gap: 14px;
          }
          .success-card h1 {
            font-size: 1.7rem;
          }
          .success-card p {
            font-size: 0.9rem;
          }
          .checkmark-svg {
            width: 68px;
            height: 68px;
          }
        }
      `}</style>
    </div>
  );
};
