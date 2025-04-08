'use client'; // 👈 Required at the top to mark this as a Client Component

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleGoToSearch = () => {
    router.push('/search');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to Model Car Center</h1>
      <p className="text-gray-600 mb-6">Find your favorite model cars from various online stores.</p>
      <button
        onClick={handleGoToSearch}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
      >
        Search Model Cars
      </button>
    </div>
  );
}
