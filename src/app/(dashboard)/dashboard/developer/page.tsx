import { Metadata } from 'next';
import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getApiKeys } from '@/app/actions/api-keys';
import { DeveloperPlatform } from '@/components/dashboard/DeveloperPlatform';

export const metadata: Metadata = {
    title: 'API Platform | Rasid',
    description: 'Manage your API keys and integrations',
};

export default async function DeveloperPage() {
    const session = await requireAuth();

    if (session.role !== 'OWNER') {
        redirect('/dashboard');
    }

    const keys = await getApiKeys();

    return <DeveloperPlatform initialKeys={keys} />;
}
