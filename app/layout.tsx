'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

const inter = Inter({ subsets: ['latin'] });

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  const isLoginPage = pathname === '/login';
  const isAuthenticated = !!user && !loading;

  // Hiển thị sidebar/header chỉ khi đã đăng nhập và không ở trang login
  if (isAuthenticated && !isLoginPage) {
    return (
      <div className="flex h-screen w-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto px-10 pb-10">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Trang login hoặc chưa đăng nhập
  return (
    <main className="w-screen h-screen">
      {children}
    </main>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}