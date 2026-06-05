'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Disable SSR since the SPA relies on window, localStorage, and browser APIs
const Storefront = dynamic(
  () => import('../../../components/storefront/App'),
  { ssr: false }
);

export default function Page() {
  return <Storefront />;
}
