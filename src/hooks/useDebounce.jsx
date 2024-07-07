// Hooks 
import { useState, useEffect } from 'react';

// Custom Hook for Debouncing
const useDebounce = (value, delay) => {
  // State Variable to store search box value
  const [debouncedValue, setDebouncedValue] = useState(value);

  //  useEffect run whenever value or delay time change
  useEffect(() => {
    // setTimeout take few seconds to set the value for state variable
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clear timeout effect after delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
