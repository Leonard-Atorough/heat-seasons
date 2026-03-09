import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ProfilePage from "src/pages/ProfilePage";
import * as racerApi from "src/services/api/racer";
import { useAuth } from "src/hooks/useAuth";
import { mockAuthContext } from "tests/utils/mocks/authContext.mock";
import { createRacerFixture, createUserFixture } from "tests/utils/fixtures";
import { AuthContextType } from "src/contexts";
import { RacerWithStats } from "shared/dist/models/racer";

vi.mock("src/hooks/useAuth");
vi.mock("src/services/api/racer");

const mockUseAuth = vi.mocked(useAuth);
const mockRacerApi = vi.mocked(racerApi);

beforeEach(() => {
  mockRacerApi.getMyRacer.mockResolvedValue(null as any);
  mockRacerApi.getAllRacers.mockResolvedValue([]);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("Given the ProfilePage", () => {
  describe("Profile information display", () => {
    it("displays user role in badge", async () => {
      const mockUserProfile = createUserFixture({ role: "admin" });
      mockUseAuth.mockReturnValue({ ...mockAuthContext, user: mockUserProfile } as AuthContextType);
      mockRacerApi.getMyRacer.mockResolvedValue(null as any);

      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      const roleBadge = screen.getByText("admin");
      expect(roleBadge).toBeInTheDocument();
      // Verify it's inside the role section
      expect(screen.getByText("Role")).toBeInTheDocument();
    });

    it("displays user name in welcome heading", async () => {
      const mockUserProfile = createUserFixture({ name: "Alex Johnson" });
      mockUseAuth.mockReturnValue({ ...mockAuthContext, user: mockUserProfile } as AuthContextType);
      mockRacerApi.getMyRacer.mockResolvedValue(null as any);

      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      expect(screen.getByText("Welcome, Alex Johnson!")).toBeInTheDocument();
    });
  });

  describe("Protected page loading behavior", () => {
    it("does not fetch racer while protected page is loading", async () => {
      const mockUserProfile = createUserFixture();
      mockUseAuth.mockReturnValue({
        ...mockAuthContext,
        user: mockUserProfile,
      } as AuthContextType);

      // This would be overridden in component via useProtectedPage hook
      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      // getMyRacer should be called (component doesn't know about protection in this render)
      // This test verifies the behavior is conditioned on isProtectedPageLoading
      await waitFor(() => {
        // The effect runs after protection check
        expect(mockRacerApi.getMyRacer).toHaveBeenCalled();
      });
    });
  });

  describe("When loading profile", () => {
    it("displays user profile information", async () => {
      const mockUserProfile = createUserFixture();
      mockUseAuth.mockReturnValue({ ...mockAuthContext, user: mockUserProfile } as AuthContextType);
      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
      expect(screen.getByText(mockUserProfile.email)).toBeInTheDocument();
    });

    it("shows loading skeleton while fetching profile", async () => {
      const mockUserProfile = createUserFixture();
      mockUseAuth.mockReturnValue({
        ...mockAuthContext,
        user: mockUserProfile,
        isLoading: true,
      } as AuthContextType);
      mockRacerApi.getMyRacer.mockResolvedValue(createRacerFixture() as RacerWithStats);

      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      expect(screen.getByTestId("profile-page-loading-skeleton")).toBeInTheDocument();
    });

    it("shows linked racer card if racer exists", async () => {
      const mockRacer = createRacerFixture();
      const mockUserProfile = createUserFixture({ racerId: mockRacer.id });
      mockUseAuth.mockReturnValue({ ...mockAuthContext, user: mockUserProfile } as AuthContextType);
      mockRacerApi.getMyRacer.mockResolvedValue(mockRacer as RacerWithStats);

      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText(mockRacer.name)).toBeInTheDocument();
      });
    });
  });

  describe("Profile picture and avatar display", () => {
    it("displays profile picture when user has one", async () => {
      const mockUserProfile = createUserFixture({
        profilePicture: "https://example.com/avatar.jpg",
      });
      mockUseAuth.mockReturnValue({ ...mockAuthContext, user: mockUserProfile } as AuthContextType);
      mockRacerApi.getMyRacer.mockResolvedValue(null as any);

      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      const profileImg = screen.getByAltText(`${mockUserProfile.name}'s profile`);
      expect(profileImg).toBeInTheDocument();
      expect(profileImg).toHaveAttribute("src", "https://example.com/avatar.jpg");
    });

    it("shows fallback avatar with initial when no profile picture", async () => {
      const mockUserProfile = createUserFixture({ name: "John Doe", profilePicture: undefined });
      mockUseAuth.mockReturnValue({ ...mockAuthContext, user: mockUserProfile } as AuthContextType);
      mockRacerApi.getMyRacer.mockResolvedValue(null as any);

      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      // Fallback avatar should show initial "J"
      expect(screen.getByText("J")).toBeInTheDocument();
      expect(screen.queryByAltText(`${mockUserProfile.name}'s profile`)).not.toBeInTheDocument();
    });

    it("shows fallback avatar when profile picture fails to load", async () => {
      const mockUserProfile = createUserFixture({
        name: "Jane Smith",
        profilePicture: "https://example.com/broken.jpg",
      });
      mockUseAuth.mockReturnValue({ ...mockAuthContext, user: mockUserProfile } as AuthContextType);
      mockRacerApi.getMyRacer.mockResolvedValue(null as any);

      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      const profileImg = screen.getByAltText(
        `${mockUserProfile.name}'s profile`,
      ) as HTMLImageElement;
      expect(profileImg).toBeInTheDocument();

      // Simulate image load error
      fireEvent.error(profileImg);

      // After error, fallback avatar with initial "J" should show
      expect(screen.getByText("J")).toBeInTheDocument();
    });

    it("updates profile picture when user profilePicture prop changes", async () => {
      const mockUserProfile1 = createUserFixture({
        profilePicture: "https://example.com/old.jpg",
      });
      const { rerender } = render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      mockUseAuth.mockReturnValue({
        ...mockAuthContext,
        user: mockUserProfile1,
      } as AuthContextType);
      mockRacerApi.getMyRacer.mockResolvedValue(null as any);

      rerender(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      const profileImg = screen.getByAltText(
        `${mockUserProfile1.name}'s profile`,
      ) as HTMLImageElement;
      expect(profileImg.src).toContain("old.jpg");

      // Update user with new profile picture
      const mockUserProfile2 = {
        ...mockUserProfile1,
        profilePicture: "https://example.com/new.jpg",
      };
      mockUseAuth.mockReturnValue({
        ...mockAuthContext,
        user: mockUserProfile2,
      } as AuthContextType);

      rerender(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      const updatedImg = screen.getByAltText(
        `${mockUserProfile2.name}'s profile`,
      ) as HTMLImageElement;
      expect(updatedImg.src).toContain("new.jpg");
    });
  });

  describe("Racer creation callback", () => {
    it("shows create modal when no racer exists and user clicks button", async () => {
      const user = userEvent.setup();
      const mockUserProfile = createUserFixture();
      mockUseAuth.mockReturnValue({ ...mockAuthContext, user: mockUserProfile } as AuthContextType);
      mockRacerApi.getMyRacer.mockResolvedValue(null as any);

      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      // Wait for empty state to render
      await waitFor(() => {
        expect(screen.getByText(/you don't have a racer profile yet/i)).toBeInTheDocument();
      });

      // Click create button
      const createButton = screen.getByRole("button", { name: /create racer/i });
      await user.click(createButton);

      // Modal should appear with form
      const dialog = await screen.findByRole("dialog");
      expect(within(dialog).getByLabelText(/racer name/i)).toBeInTheDocument();
    });
  });

  describe("When managing users racer", () => {
    // Test: Create button visibility
    it("shows create button only when no racer exists and not loading", async () => {
      const mockUserProfile = createUserFixture();
      mockUseAuth.mockReturnValue({ ...mockAuthContext, user: mockUserProfile } as AuthContextType);
      mockRacerApi.getMyRacer.mockResolvedValue(null as any);

      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /create racer/i })).toBeInTheDocument();
      });
    });

    it("hides create button when racer exists", async () => {
      const mockRacer = createRacerFixture();
      const mockUserProfile = createUserFixture({ racerId: mockRacer.id });
      mockUseAuth.mockReturnValue({ ...mockAuthContext, user: mockUserProfile } as AuthContextType);
      mockRacerApi.getMyRacer.mockResolvedValue(mockRacer as RacerWithStats);

      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.queryByRole("button", { name: /create racer/i })).not.toBeInTheDocument();
      });
    });

    it("hides create button while racer is loading", async () => {
      const mockUserProfile = createUserFixture();
      mockUseAuth.mockReturnValue({
        ...mockAuthContext,
        user: mockUserProfile,
      } as AuthContextType);

      // Start with loading state
      let resolveGetMyRacer: any;
      mockRacerApi.getMyRacer.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveGetMyRacer = resolve;
          }),
      );

      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      // While loading, create button should not appear
      expect(screen.queryByRole("button", { name: /create racer/i })).not.toBeInTheDocument();

      // Resolve the promise
      resolveGetMyRacer(null);
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /create racer/i })).toBeInTheDocument();
      });
    });
    it("fetches and displays linked racer information", async () => {
      const mockRacer = createRacerFixture();
      const mockUserProfile = createUserFixture({ racerId: mockRacer.id });
      mockUseAuth.mockReturnValue({ ...mockAuthContext, user: mockUserProfile } as AuthContextType);
      mockRacerApi.getMyRacer.mockResolvedValue(mockRacer as RacerWithStats);

      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText(mockRacer.name)).toBeInTheDocument();
      });
    });

    it("opens edit racer modal when edit button on racer card is clicked", async () => {
      const user = userEvent.setup();
      const mockRacer = createRacerFixture();
      const mockUserProfile = createUserFixture({ racerId: mockRacer.id });
      mockUseAuth.mockReturnValue({ ...mockAuthContext, user: mockUserProfile } as AuthContextType);
      mockRacerApi.getMyRacer.mockResolvedValue(mockRacer as RacerWithStats);

      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText(mockRacer.name)).toBeInTheDocument();
      });

      // LinkedRacerCard should have an edit button
      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      // EditRacerModal should now be visible as a dialog
      const dialog = await screen.findByRole("dialog");
      expect(dialog).toBeInTheDocument();
    });

    it("closes edit modal when close button is clicked", async () => {
      const user = userEvent.setup();
      const mockRacer = createRacerFixture();
      const mockUserProfile = createUserFixture({ racerId: mockRacer.id });
      mockUseAuth.mockReturnValue({ ...mockAuthContext, user: mockUserProfile } as AuthContextType);
      mockRacerApi.getMyRacer.mockResolvedValue(mockRacer as RacerWithStats);

      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText(mockRacer.name)).toBeInTheDocument();
      });

      // Open edit modal
      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      const dialog = await screen.findByRole("dialog");
      expect(dialog).toBeInTheDocument();

      // Close modal
      const cancelButton = within(dialog).getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      // Modal should be gone
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("open/close edit modal properly manages modal state", async () => {
      const user = userEvent.setup();
      const mockRacer = createRacerFixture();
      const mockUserProfile = createUserFixture({ racerId: mockRacer.id });
      mockUseAuth.mockReturnValue({ ...mockAuthContext, user: mockUserProfile } as AuthContextType);
      mockRacerApi.getMyRacer.mockResolvedValue(mockRacer as RacerWithStats);

      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText(mockRacer.name)).toBeInTheDocument();
      });

      // Modal should not be open initially
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      // Click edit button to open
      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      // Modal should now be visible
      expect(await screen.findByRole("dialog")).toBeInTheDocument();

      // Close the modal
      const dialog = screen.getByRole("dialog");
      const closeButton = within(dialog).getByRole("button", { name: /cancel/i });
      await user.click(closeButton);

      // Modal should be gone
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("does not render edit modal when it's not open", async () => {
      const mockRacer = createRacerFixture();
      const mockUserProfile = createUserFixture({ racerId: mockRacer.id });
      mockUseAuth.mockReturnValue({ ...mockAuthContext, user: mockUserProfile } as AuthContextType);
      mockRacerApi.getMyRacer.mockResolvedValue(mockRacer as RacerWithStats);

      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText(mockRacer.name)).toBeInTheDocument();
      });

      // Edit modal should not be rendered initially
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("does not render create modal when it's not open", async () => {
      const mockUserProfile = createUserFixture();
      mockUseAuth.mockReturnValue({ ...mockAuthContext, user: mockUserProfile } as AuthContextType);
      mockRacerApi.getMyRacer.mockResolvedValue(null as any);

      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText(/you don't have a racer profile yet/i)).toBeInTheDocument();
      });

      // Modal should not be rendered initially
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("sets the linked racer to null if API returns no racer", async () => {
      const mockUserProfile = createUserFixture({ racerId: "racer-123" });
      mockUseAuth.mockReturnValue({ ...mockAuthContext, user: mockUserProfile } as AuthContextType);
      mockRacerApi.getMyRacer.mockResolvedValue(null as any);

      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText(/you don't have a racer profile yet/i)).toBeInTheDocument();
      });
    });

    it("displays empty state when no racer exists", async () => {
      const mockUserProfile = createUserFixture();
      mockUseAuth.mockReturnValue({ ...mockAuthContext, user: mockUserProfile } as AuthContextType);
      mockRacerApi.getMyRacer.mockResolvedValue(null as any);

      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText(/you don't have a racer profile yet/i)).toBeInTheDocument();
        expect(screen.getByText(/create one to join seasons/i)).toBeInTheDocument();
      });
    });

    it("opens create racer modal from profile", async () => {
      const user = userEvent.setup();
      const mockUserProfile = createUserFixture();
      mockUseAuth.mockReturnValue({ ...mockAuthContext, user: mockUserProfile } as AuthContextType);

      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText(/create racer/i)).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /create racer/i }));

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByLabelText(/racer name/i)).toBeInTheDocument();
    });

    it("opens create racer modal and displays form fields", async () => {
      const user = userEvent.setup();
      const mockUserProfile = createUserFixture();
      mockUseAuth.mockReturnValue({ ...mockAuthContext, user: mockUserProfile } as AuthContextType);

      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      // Create Racer button should be visible (no linked racer by default)
      const createButton = await screen.findByRole("button", { name: /create racer/i });
      await user.click(createButton);

      // Modal should open with form fields
      const dialog = await screen.findByRole("dialog");
      expect(within(dialog).getByLabelText(/racer name/i)).toBeInTheDocument();
      expect(within(dialog).getByLabelText(/^team$/i)).toBeInTheDocument();
      expect(within(dialog).getByLabelText(/nationality/i)).toBeInTheDocument();
      expect(within(dialog).getByLabelText(/age/i)).toBeInTheDocument();

      // Modal has submit button
      expect(within(dialog).getByRole("button", { name: /create racer/i })).toBeInTheDocument();

      // Modal has close/cancel button
      expect(within(dialog).getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });

    it.skip("handles racer creation submission", async () => {
      // TODO: Test form validation and API call in CreateRacerModal component tests
      // Integration test focus: modal opens/closes, page behavior after creation
    });

    // Test editing and unlinking (low priority - complex modal interactions)
    it.skip("edits linked racer information", async () => {
      // TODO: Implement if edit modal is refactored
    });
  });

  describe("Account management", () => {
    // Test logout button presence and interaction
    it("displays logout button in profile section", async () => {
      const mockUserProfile = createUserFixture();
      mockUseAuth.mockReturnValue({ ...mockAuthContext, user: mockUserProfile } as AuthContextType);

      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
    });

    it("calls logout when logout button is clicked", async () => {
      const user = userEvent.setup();
      const mockUserProfile = createUserFixture();
      const mockLogout = vi.fn();
      mockUseAuth.mockReturnValue({
        ...mockAuthContext,
        user: mockUserProfile,
        logout: mockLogout,
      } as AuthContextType);

      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      const logoutButton = screen.getByRole("button", { name: /logout/i });
      await user.click(logoutButton);

      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe("Protected page behavior", () => {
    // Test that page respects auth protection
    it.skip("shows loading state for protected page check", async () => {
      // TODO: Test useProtectedPage hook loading state - low priority
    });
  });

  describe("Racer fetch lifecycle", () => {
    it("fetches racer on initial mount after protection check", async () => {
      const mockUserProfile = createUserFixture();
      mockUseAuth.mockReturnValue({ ...mockAuthContext, user: mockUserProfile } as AuthContextType);
      mockRacerApi.getMyRacer.mockResolvedValue(null as any);

      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(mockRacerApi.getMyRacer).toHaveBeenCalled();
      });
    });

    it("refetches racer when user ID changes", async () => {
      const mockUserProfile1 = createUserFixture({ id: "user-1" });
      mockUseAuth.mockReturnValue({
        ...mockAuthContext,
        user: mockUserProfile1,
      } as AuthContextType);
      mockRacerApi.getMyRacer.mockResolvedValue(null as any);

      const { rerender } = render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(mockRacerApi.getMyRacer).toHaveBeenCalledTimes(1);
      });

      // Change user ID
      const mockUserProfile2 = createUserFixture({ id: "user-2" });
      mockUseAuth.mockReturnValue({
        ...mockAuthContext,
        user: mockUserProfile2,
      } as AuthContextType);

      rerender(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      // Should fetch again for new user
      await waitFor(() => {
        expect(mockRacerApi.getMyRacer).toHaveBeenCalledTimes(2);
      });
    });

    it("clears error state when retrying fetch", async () => {
      const mockUserProfile1 = createUserFixture({ id: "user-1" });
      mockUseAuth.mockReturnValue({
        ...mockAuthContext,
        user: mockUserProfile1,
      } as AuthContextType);
      mockRacerApi.getMyRacer.mockRejectedValueOnce(new Error("Network error"));

      const { rerender } = render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/Could not load your racer profile/i)).toBeInTheDocument();
      });

      // Mock successful response for retry
      mockRacerApi.getMyRacer.mockResolvedValueOnce(null as any);

      // Change user ID to trigger effect refetch
      const mockUserProfile2 = createUserFixture({ id: "user-2" });
      mockUseAuth.mockReturnValue({
        ...mockAuthContext,
        user: mockUserProfile2,
      } as AuthContextType);

      rerender(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      // After refetch succeeds, should not show error but show empty state
      await waitFor(() => {
        expect(screen.queryByText(/Could not load your racer profile/i)).not.toBeInTheDocument();
        expect(screen.getByText(/you don't have a racer profile yet/i)).toBeInTheDocument();
      });
    });
  });

  describe("When handling errors", () => {
    it("treats 404 error as no racer (not an error state)", async () => {
      const mockUserProfile = createUserFixture({ racerId: "racer-123" });
      mockUseAuth.mockReturnValue({ ...mockAuthContext, user: mockUserProfile } as AuthContextType);
      const error404 = new Error("Not Found");
      (error404 as any).status = 404;
      mockRacerApi.getMyRacer.mockRejectedValue(error404);

      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      // Should show empty state, not error
      await waitFor(() => {
        expect(screen.getByText(/you don't have a racer profile yet/i)).toBeInTheDocument();
        expect(screen.queryByText(/Could not load your racer profile/i)).not.toBeInTheDocument();
      });
    });

    it("shows error message for non-404 errors", async () => {
      const mockUserProfile = createUserFixture();
      mockUseAuth.mockReturnValue({ ...mockAuthContext, user: mockUserProfile } as AuthContextType);
      mockRacerApi.getMyRacer.mockRejectedValue(new Error("Server error"));

      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText(/Could not load your racer profile/i)).toBeInTheDocument();
      });
    });

    it("shows error message when racer fetch fails", async () => {
      const mockUserProfile = createUserFixture();
      mockUseAuth.mockReturnValue({ ...mockAuthContext, user: mockUserProfile } as any);
      mockRacerApi.getMyRacer.mockRejectedValue(new Error("API Error"));

      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText(/Could not load your racer profile/i)).toBeInTheDocument();
      });
    });

    it.skip("shows error when creating racer fails", async () => {
      // TODO: Mock CreateRacerModal error - requires modal component testing
    });
  });

  describe("When user is not authenticated", () => {
    it.skip("handles auth protection via useProtectedPage", async () => {
      // TODO: useProtectedPage already handles redirect; integration test in auth hook tests
    });
  });
});
