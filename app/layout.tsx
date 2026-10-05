import './globals.css';

export const metadata = {
  title: 'JAMB CBT Platform',
  description: 'A JAMB/UTME preparation platform with CBT simulation and question practice.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
