import { AuthContextType } from "src/contexts";

export const mockAuthContext: AuthContextType = {
  user: {
    id: "1",
    name: "Test User",
    email: "testuser@example.com",
    role: "user",
  },
  isLoading: false,
  isAuthenticated: true,
  isContributor: false,
  isAdmin: false,
  loginWithGoogle: vi.fn(),
  logout: vi.fn(),
  refreshUser: vi.fn(),
};

export const createMockAuthContext = (overrides?: Partial<AuthContextType>): AuthContextType => {
  return {
    ...mockAuthContext,
    ...overrides,
  };
};
