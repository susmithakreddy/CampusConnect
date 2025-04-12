import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'CampusConnect',
  description: 'The Heritage University - CampusConnect Portal',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
