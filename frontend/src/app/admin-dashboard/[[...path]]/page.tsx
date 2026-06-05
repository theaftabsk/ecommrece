'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Disable SSR since the SPA relies on window, localStorage, and browser APIs
const AdminDashboard = dynamic(
  () => import('../../../components/admin-dashboard/App'),
  { ssr: false }
);

export default function Page() {
  return <AdminDashboard />;
}
