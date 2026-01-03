import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
    return (
        <footer className="py-12 border-t border-border/50 bg-muted/10">
            <div className="container-app">
                <div className="grid md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 rounded flex items-center justify-center overflow-hidden">
                                <Image
                                    src="/logos/Rasid_Logo.png"
                                    alt="Rasid Logo"
                                    width={24}
                                    height={24}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="text-lg font-bold font-display">Rasid</span>
                        </div>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            The modern standard for digital invoicing and financial management.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/#features" className="hover:text-primary">Features</Link></li>
                            <li><Link href="/#pricing" className="hover:text-primary">Pricing</Link></li>
                            <li><Link href="#" className="hover:text-primary">API</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/#about" className="hover:text-primary">About</Link></li>
                            <li><Link href="#" className="hover:text-primary">Blog</Link></li>
                            <li><Link href="#" className="hover:text-primary">Careers</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                    <p>© {new Date().getFullYear()} Rasid Platform. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
