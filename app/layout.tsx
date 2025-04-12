import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'CampusConnect',
  description: 'The Heritage University - CampusConnect Portal',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        {children}
      </body>
    </html>
  );
}