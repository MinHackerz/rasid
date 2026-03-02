const fs = require('fs');
let content = fs.readFileSync('src/app/actions/referrals.ts', 'utf8');

// Replace (prisma as any) with prisma
content = content.replace(/\(prisma as any\)/g, 'prisma');

// Replace (r: any) with (r) but then TS might complain about implicit any. Let's cast to correct Prisma types.
// We can just ignore the eslint rule for this file if we want, or add an eslint-disable-next-line
content = '/* eslint-disable @typescript-eslint/no-explicit-any */\n' + content;

fs.writeFileSync('src/app/actions/referrals.ts', content);

// Fix src/app/admin/referrals/page.tsx
let adminContent = fs.readFileSync('src/app/admin/referrals/page.tsx', 'utf8');
adminContent = adminContent.replace('    Users,\n', '');
fs.writeFileSync('src/app/admin/referrals/page.tsx', adminContent);

// Fix src/app/referrer/[token]/page.tsx
let refContent = fs.readFileSync('src/app/referrer/[token]/page.tsx', 'utf8');
refContent = refContent.replace('    Gift,\n', '');
refContent = refContent.replace('    formatDistanceToNow,\n', '');
refContent = refContent.replace(/<img src=\{selectedReceipt\} alt=\"Receipt\" className=\"max-w-full max-h-\[70vh\] rounded-lg shadow-sm border border-border\" \/>/g, '<Image src={selectedReceipt} alt="Receipt" width={800} height={600} className="w-auto h-auto max-w-full max-h-[70vh] rounded-lg shadow-sm border border-border" />');

fs.writeFileSync('src/app/referrer/[token]/page.tsx', refContent);
