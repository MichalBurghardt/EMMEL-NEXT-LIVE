'use client';

import LoginForm from '@/components/Forms/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <LoginForm redirectTo="/dashboard" />
      </div>
    </div>
  );
}