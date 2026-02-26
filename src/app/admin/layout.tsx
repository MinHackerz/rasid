import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/admin';
import AdminLayoutShell from './AdminLayoutShell';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const adminUser = await getAdminUser();

    if (!adminUser) {
        redirect('/');
    }

    return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
