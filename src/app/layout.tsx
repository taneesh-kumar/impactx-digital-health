import type { Metadata } from 'next';
import './globals.css';
import { DemoProvider } from '@/lib/state/demo-context';
import { AppShell } from '@/components/shell/AppShell';

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
    <html lang="en">
      <body className="antialiased min-h-screen">
        <DemoProvider>
          <AppShell>{children}</AppShell>
        </DemoProvider>
      </body>
    </html>
  );
}
