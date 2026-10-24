import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';
import { DemoProvider } from '@/lib/state/demo-context';
import { AppShell } from '@/components/shell/AppShell';

const roboto = Roboto({
  weight: ['300', '400', '500', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: 'SwasthyaSetu — Patient-Controlled Health Records',
  description: 'A secure, explainable digital health record journey built for IMPACTX 2026. ABDM ready.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={roboto.variable}>
      <body className={`${roboto.className} antialiased min-h-screen`}>
        <DemoProvider>
          <AppShell>{children}</AppShell>
        </DemoProvider>
      </body>
    </html>
  );
}
