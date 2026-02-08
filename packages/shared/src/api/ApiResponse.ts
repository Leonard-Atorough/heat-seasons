export interface ApiResponse<T> {
  success: boolean;
  timestamp: Date;
  message?: string;
  error?: string;
  data: T;
}
