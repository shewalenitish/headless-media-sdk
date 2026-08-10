import React, { useState } from 'react';

export interface SearchBarProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
}

export function SearchBar({ initialQuery = '', onSearch }: SearchBarProps) {
  const [value, setValue] = useState(initialQuery);

  return (
    <form
      className="search-bar"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(value.trim());
      }}
    >
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search Pexels (e.g. mountains, coffee, city)"
        aria-label="Search media"
      />
      <button type="submit">Search</button>
    </form>
  );
}
