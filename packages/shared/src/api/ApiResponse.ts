export interface ApiResponse<T> {
  success: boolean;
  status: number;
  statusText: string;
  timestamp: Date;
  message?: string;
  error?: string;
  data: T;
}
