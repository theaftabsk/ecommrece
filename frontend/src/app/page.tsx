'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const LandingPage = dynamic(
  () => import('../components/landing-page/App'),
  { ssr: false }
);

export default function Home() {
  return <LandingPage />;
}
