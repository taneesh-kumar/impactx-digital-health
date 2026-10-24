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
  description: 'A secure, patient-controlled digital health platform for longitudinal record management. ABDM compliant.',
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
