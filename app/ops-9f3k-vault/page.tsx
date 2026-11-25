import { Metadata } from 'next';
import AdminPortal from '@/components/surfaces/admin/AdminPortal';

export const metadata: Metadata = {
  title: 'Admin Command Console — Finglora',
  description: 'Manage users, manicure catalog, email deliverability, and system health for Finglora.',
};

export default function AdminPage() {
  return <AdminPortal />;
}
