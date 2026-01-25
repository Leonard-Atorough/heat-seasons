// Generic API response interface
export interface ApiResponse<T> {
  success: boolean;
  timestamp: Date;
  message?: string;
  error?: string;
  data: T;
}

// Validation result interface
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// API Error interfaces
export interface ApiError {
  code: string;
  statusCode: 400 | 401 | 403 | 404 | 500;
  message: string;
  details?: any;
  timestamp: string;
}

export interface ValidationError extends ApiError {
  code: "VALIDATION_ERROR";
  details: {
    field: string;
    message: string;
  }[];
}

// Pagination interfaces
export interface PaginationParams {
  limit?: number;
  offset?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}
