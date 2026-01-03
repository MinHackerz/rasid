'use client';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // The sign-in and sign-up pages now have their own complete layouts
    // This layout just acts as a simple passthrough
    return <>{children}</>;
}
