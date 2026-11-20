import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Ashishhh Studio AI', description: 'AI-powered Marathi and English creator studio' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
