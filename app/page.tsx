'use client';

import { useAuth } from './context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (user) {
      // Nếu đã đăng nhập, redirect sang pending-approval
      router.replace('/pending-approval');
    } else {
      // Nếu chưa đăng nhập, redirect sang login
      router.replace('/login');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
      Đang chuyển hướng...
    </div>
  );
}
