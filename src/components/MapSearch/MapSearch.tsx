import { useState, useEffect, useRef, useCallback } from 'react';
import { geocode, type GeocodeResult } from '../../services/geocode';
import './MapSearch.css';

interface MapSearchProps {
  onSelect: (lat: number, lon: number) => void;
}

export function MapSearch({ onSelect }: MapSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await geocode(searchQuery, 50);
      setResults(data.results);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (query.length >= 2) {
      debounceRef.current = setTimeout(() => {
        performSearch(query);
      }, 500);
    } else {
      setResults([]);
      setLoading(false);
    }
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, performSearch]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery('');
        setResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
        setResults([]);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setError(null);
  };

  const handleSelect = (result: GeocodeResult) => {
    onSelect(result.lat, result.lon);
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setError(null);
  };

  if (!isOpen) {
    return (
      <button
        className="map-search-trigger"
        onClick={handleOpen}
        aria-label="Search"
        title="Search"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
    );
  }

  return (
    <div className="map-search-overlay" ref={containerRef}>
      <div className="map-search-box">
        <div className="map-search-input-row">
          <svg className="map-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="map-search-input"
            placeholder="Search places..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button
              className="map-search-clear"
              onClick={() => {
                setQuery('');
                setResults([]);
                setError(null);
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
          <button
            className="map-search-close"
            onClick={handleClose}
            aria-label="Close search"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {(loading || error || results.length > 0 || (query.length >= 2 && !loading && results.length === 0 && !error)) && (
          <div className="map-search-dropdown">
            {loading && (
              <div className="map-search-status">
                <div className="map-search-spinner" />
                <span>Searching...</span>
              </div>
            )}
            {!loading && error && (
              <div className="map-search-status map-search-error">{error}</div>
            )}
            {!loading && !error && results.length === 0 && query.length >= 2 && (
              <div className="map-search-status">No results found</div>
            )}
            {!loading && !error && results.length > 0 && (
              <ul className="map-search-results">
                {results.map(result => (
                  <li
                    key={result.id}
                    className="map-search-result"
                    onClick={() => handleSelect(result)}
                  >
                    <div className="map-search-result-name">{result.name}</div>
                    <div className="map-search-result-meta">{result.display_name}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
