/**
 * Core API Client - Handles all HTTP requests
 * No React dependencies, no business logic
 */
import { ApiResponse } from "@shared/index";

export interface RequestConfig {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: any;
  signal?: AbortSignal;
}

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Set a default header for all requests
   *
   * @param key
   * @param value
   */
  setDefaultHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  /**
   * Remove a default header
   */
  removeDefaultHeader(key: string): void {
    delete this.defaultHeaders[key];
  }

  /**
   * Perform a fetch request
   */
  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const { method = "GET", headers = {}, body, signal } = config;

    const url = `${this.baseUrl}${endpoint}`;
    const finalHeaders = { ...this.defaultHeaders, ...headers };

    console.log(`Making ${method} request to ${url}`);
    const requestInit: RequestInit = {
      method,
      headers: finalHeaders,
      signal,
    };

    if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
      requestInit.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestInit);

      if (!response.ok) {
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          response.statusText,
        );
      }

      const data: ApiResponse<T> = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new ApiError("Request cancelled", 0, "AbortError");
      }

      throw new ApiError(
        error instanceof Error ? error.message : "Unknown error",
        0,
        "UnknownError",
      );
    }
  }

  /**
   * GET request
   */
  async get<T>(
    endpoint: string,
    signal?: AbortSignal,
    headers?: Record<string, string>,
  ): Promise<T> {
    const response = await this.request<T>(endpoint, { method: "GET", signal, headers });
    return response.data;
  }

  /**
   * POST request
   */
  async post<T, B = any>(
    endpoint: string,
    body: B,
    signal?: AbortSignal,
    headers?: Record<string, string>,
  ): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: "POST",
      body,
      signal,
      headers,
    });
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T, B = any>(
    endpoint: string,
    body: B,
    signal?: AbortSignal,
    headers?: Record<string, string>,
  ): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: "PUT",
      body,
      signal,
      headers,
    });
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T>(
    endpoint: string,
    signal?: AbortSignal,
    headers?: Record<string, string>,
  ): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: "DELETE",
      signal,
      headers,
    });
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T, B = any>(
    endpoint: string,
    body: B,
    signal?: AbortSignal,
    headers?: Record<string, string>,
  ): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: "PATCH",
      body,
      signal,
      headers,
    });
    return response.data;
  }
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
  ) {
    super(message);
    this.name = "ApiError";
  }

  isNetworkError(): boolean {
    return this.status === 0;
  }

  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  isServerError(): boolean {
    return this.status >= 500;
  }
}

/**
 * Create and export a singleton instance
 */
const apiClient = new ApiClient(import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api");

export default apiClient;
