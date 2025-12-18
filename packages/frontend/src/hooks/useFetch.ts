import { useState, useEffect } from "react";

export default function useFetch<T>(url: string): {
  data: T | null;
  error: Error | null;
  loading: boolean;
} {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const result: T = await response.json();
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [url]);

  return { data, error, loading };
}
