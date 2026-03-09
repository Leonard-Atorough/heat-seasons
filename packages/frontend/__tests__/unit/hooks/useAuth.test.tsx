import { cleanup, renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { useAuth } from "src/hooks/useAuth";
import { AuthContext, AuthContextType } from "src/contexts";
import { createMockAuthContext } from "tests/utils/mocks/authContext.mock";

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe("useAuth hook", () => {
  // 1. Throws when used outside AuthProvider
  // 2. Returns auth context value when used within AuthProvider

  it("throws when called outside AuthContext provider", () => {
    const { result } = renderHook(() => {
      try {
        return useAuth();
      } catch (error) {
        return error as Error;
      }
    });

    expect(result.current).toBeInstanceOf(Error);
    expect((result.current as Error).message).toBe("useAuth must be used within an AuthProvider");
  });

  it("returns auth context value from provider", () => {
    const mockAuth = createMockAuthContext({ isAuthenticated: true, isAdmin: true });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthContext.Provider value={mockAuth as AuthContextType}>{children}</AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toEqual(mockAuth);
    expect(result.current.isAdmin).toBe(true);
  });
});
