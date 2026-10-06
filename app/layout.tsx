import './globals.css';
import { PwaRegister } from '@/components/pwa-register';

export const metadata = {
  title: 'JAMB CBT Platform',
  description: 'A JAMB/UTME preparation platform with CBT simulation and question practice.',
  manifest: '/manifest.webmanifest',
  themeColor: '#0f172a',
  applicationName: 'JAMB CBT Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
