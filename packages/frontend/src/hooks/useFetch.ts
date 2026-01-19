import { useState, useEffect } from "react";

// GET requests - no body required
function useFetch<T>(
  route: string,
  endpoint?: string,
  method?: "GET"
): {
  data: T | null;
  error: Error | null;
  loading: boolean;
};

// POST/PUT/DELETE requests - body required
function useFetch<T, B>(
  route: string,
  endpoint: string | undefined,
  method: "POST" | "PUT" | "DELETE",
  body: B
): {
  data: T | null;
  error: Error | null;
  loading: boolean;
};

// Implementation
function useFetch<T, B = any>(
  route: string,
  endpoint?: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: B
): {
  data: T | null;
  error: Error | null;
  loading: boolean;
} {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      try {
        const requestOptions: RequestInit = {
          method,
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
          },
        };

        if (body) {
          requestOptions.body = JSON.stringify(body);
        }

        const response = await fetch(`${route}${endpoint || ""}`, requestOptions);

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

    return () => {
      controller.abort();
    };
  }, [route, endpoint, method, body]);

  return { data, error, loading };
}

export default useFetch;
