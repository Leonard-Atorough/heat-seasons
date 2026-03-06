import { cleanup, renderHook } from "@testing-library/react";
import { useProtectedPage } from "src/hooks/useProtectedPage";
import { createUseAuthMock } from "tests/utils/mocks/useAuth.mock";

vi.mock("src/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
}));

import { useAuth } from "src/hooks/useAuth";
const mockedUseAuth = vi.mocked(useAuth);

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
  mockNavigate.mockReset();
});

describe("useProtectedPage hook", () => {
  // 1. Returns loading state from auth context
  // 2. Navigates to login when user is missing and loading is false
  // 3. Does not navigate while auth is loading
  // 4. Does not navigate when user is present

  it("returns isLoading from auth context", () => {
    mockedUseAuth.mockReturnValue(createUseAuthMock({ isLoading: true, user: null }));

    const { result } = renderHook(() => useProtectedPage());

    expect(result.current).toBe(true);
  });

  it("navigates to /login when there is no user and loading is false", () => {
    mockedUseAuth.mockReturnValue(createUseAuthMock({ user: null, isLoading: false }));

    renderHook(() => useProtectedPage());

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("does not navigate while loading", () => {
    mockedUseAuth.mockReturnValue(createUseAuthMock({ user: null, isLoading: true }));

    renderHook(() => useProtectedPage());

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("does not navigate when a user is present", () => {
    mockedUseAuth.mockReturnValue(createUseAuthMock({ isLoading: false }));

    renderHook(() => useProtectedPage());

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
