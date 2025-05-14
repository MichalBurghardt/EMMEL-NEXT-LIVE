import React, { useState } from 'react';
import { Input } from './input';
import { Button } from './button';

export interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  initialValue?: string;
  // Neue Props zur Unterstützung des kontrollierten Komponenten-Musters
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
}

export function SearchBar({
  placeholder = 'Suchen...',
  onSearch,
  className = '',
  initialValue = '',
  value,
  onChange,
  onClear,
}: SearchBarProps) {
  // Verwende lokalen State nur, wenn wir nicht im kontrollierten Modus sind
  const [searchQuery, setSearchQuery] = useState(initialValue);
  
  // Bestimme, ob wir im kontrollierten oder unkontrollierten Modus sind
  const isControlled = value !== undefined && onChange !== undefined;
  const currentValue = isControlled ? value : searchQuery;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(currentValue);
  };

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <div className="relative w-full">
        <Input
          type="text"
          placeholder={placeholder}
          value={currentValue}
          onChange={(e) => {
            if (isControlled) {
              if (onChange) onChange(e);
            } else {
              setSearchQuery(e.target.value);
            }
          }}
          className="w-full"
        />
        {currentValue && onClear && (
          <button
            type="button"
            onClick={() => {
              onClear();
              if (!isControlled) setSearchQuery('');
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label="Löschen"
          >
            ×
          </button>
        )}
      </div>
      <Button type="submit" variant="primary">
        Suchen
      </Button>
    </form>
  );
}
