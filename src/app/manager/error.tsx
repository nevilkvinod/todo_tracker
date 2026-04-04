'use client';
import { AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error('Manager page error:', error);
  }, [error]);

  return (
    <div className="p-8">
      <div className="bg-red-500/10 border border-red-500/20 text-red-700 p-6 rounded-xl max-w-lg mb-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 mt-0.5" />
          <div>
            <h2 className="text-xl font-bold mb-1">Something went wrong</h2>
            <p className="text-sm opacity-90 mb-4">{error.message}</p>
            <button 
              onClick={() => reset()}
              className="bg-red-500 text-white px-4 py-2 rounded-md font-medium hover:bg-red-600 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
