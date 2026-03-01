"use client";
import { useState, useEffect, useCallback } from "react";

/**
 * Hook to sync state with localStorage (SSR-friendly)
 * @param key the localStorage key
 * @param initialValue the initial value if nothing in localStorage
 * @returns [state, setState] tuple
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialize with initialValue only to avoid hydration mismatch
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Failed to read from localStorage key "${key}":`, error);
    }
  }, [key]);

  // Write to localStorage whenever value changes
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const newValue =
            typeof value === "function"
              ? (value as (prev: T) => T)(prev)
              : value;
          try {
            window.localStorage.setItem(key, JSON.stringify(newValue));
          } catch (error) {
            console.error(
              `Failed to write to localStorage key "${key}":`,
              error,
            );
          }
          return newValue;
        });
      } catch (error) {
        console.error(`Failed to update state for key "${key}":`, error);
      }
    },
    [key],
  );

  return [storedValue, setValue];
}
