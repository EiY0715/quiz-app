'use client';

import { useState } from 'react';
import AdminLogin from '@/components/AdminLogin';
import AdminDashboard from '@/components/AdminDashboard';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);

  if (!authenticated) {
    return <AdminLogin onSuccess={() => setAuthenticated(true)} />;
  }

  return <AdminDashboard />;
}