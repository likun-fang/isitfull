import { useState, useEffect, useRef, useCallback } from 'react';
import { searchAddress } from '../services/searchService';
import { AddressSuggestion } from '../types/address';

const DEBOUNCE_MS = 300;

interface UseAddressSearchResult {
  query: string;
  setQuery: (query: string) => void;
  suggestions: AddressSuggestion[];
  isLoading: boolean;
  error: string | null;
  clearSearch: () => void;
  flushSearch: () => void;
}

export function useAddressSearch(): UseAddressSearchResult {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    searchAddress(debouncedQuery)
      .then((results) => {
        if (!cancelled) {
          setSuggestions(results);
          if (results.length === 0) {
            setError(`No results found for '${debouncedQuery}'`);
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSuggestions([]);
          setError('Unable to search. Check your connection.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setSuggestions([]);
    setIsLoading(false);
    setError(null);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  const flushSearch = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (query && query.length >= 2 && query !== debouncedQuery) {
      setDebouncedQuery(query);
    }
  }, [query, debouncedQuery]);

  return {
    query,
    setQuery,
    suggestions,
    isLoading,
    error,
    clearSearch,
    flushSearch,
  };
}
