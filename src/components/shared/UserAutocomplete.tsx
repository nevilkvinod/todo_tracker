'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, UserCheck } from 'lucide-react';

export function UserAutocomplete({ 
  onSelect, 
  excludeIds = [],
  fetchUsers,
  placeholder = "Search users by name or email..."
}: { 
  onSelect: (user: any) => void; 
  excludeIds?: string[];
  fetchUsers: (query: string) => Promise<{ success: boolean; data?: any[] | null; error?: any }>;
  placeholder?: string;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await fetchUsers(query);
      if (res?.success && res?.data) {
        setResults(res.data.filter((u: any) => !excludeIds.includes(u.id)));
        setIsOpen(true);
      } else {
        setResults([]);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, excludeIds, fetchUsers]);

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          placeholder={placeholder}
          className="w-full bg-background border border-border rounded-md px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {results.map(user => (
            <button
              key={user.id}
              type="button"
              onClick={() => {
                onSelect(user);
                setQuery('');
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-secondary/40 flex items-center space-x-3 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              </div>
              <UserCheck className="h-3 w-3 text-muted-foreground opacity-50" />
            </button>
          ))}
        </div>
      )}
      
      {isOpen && !loading && results.length === 0 && query.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg px-4 py-3 text-sm text-muted-foreground">
          No users found.
        </div>
      )}
    </div>
  );
}
