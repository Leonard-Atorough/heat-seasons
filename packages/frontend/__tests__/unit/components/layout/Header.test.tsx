import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import Header from "src/components/layout/Header";
import { useAuth } from "src/hooks/useAuth";
import { createUseAuthMock } from "../../../utils/mocks/useAuth.mock";

// Mock hooks at module level, before any imports that use them
vi.mock("src/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderHeader = (authValue = {}) => {
  (useAuth as ReturnType<typeof vi.fn>).mockReturnValue(createUseAuthMock(authValue));

  return render(
    <BrowserRouter>
      <Header />
    </BrowserRouter>,
  );
};

describe("Header Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe("Rendering", () => {
    it("renders logo and navigation links", () => {
      renderHeader();
      expect(screen.getByText("🏁 HEAT SEASONS")).toBeInTheDocument();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Racers")).toBeInTheDocument();
      expect(screen.getByText("Teams")).toBeInTheDocument();
      expect(screen.getByText("Results")).toBeInTheDocument();
      expect(screen.getByText("Seasons")).toBeInTheDocument();
    });

    it("renders logo with proper attributes", () => {
      renderHeader();
      const logo = screen.getByText("🏁 HEAT SEASONS").parentElement;
      expect(logo).toHaveAttribute("aria-label", "Heat Seasons Home");
      expect(logo).toHaveAttribute("role", "heading");
      expect(logo).toHaveAttribute("aria-level", "1");
    });

    it("has accessible navigation", () => {
      renderHeader();
      const nav = screen.getByRole("navigation");
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveAttribute("aria-label", "Main Navigation");
    });
  });

  describe("Authentication States", () => {
    it("shows user name when authenticated", () => {
      renderHeader({ isAuthenticated: true });
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });

    it("shows login button when not authenticated", () => {
      renderHeader({ isAuthenticated: false, user: null });
      expect(screen.getByText("Login")).toBeInTheDocument();
    });

    it("navigates to login when login button is clicked", async () => {
      renderHeader({ isAuthenticated: false, user: null });
      const loginButton = screen.getByText("Login");
      await userEvent.click(loginButton);
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  describe("Hamburger Menu", () => {
    it("toggles hamburger menu on click", async () => {
      const { container } = renderHeader();
      const nav = container.querySelector("nav");

      expect(nav?.className).not.toContain("nav--open");

      const hamburger = screen.getByRole("button", { name: "" }); // Ghost button with icon
      await userEvent.click(hamburger);
      expect(nav?.className).toContain("nav--open");

      await userEvent.click(hamburger);
      expect(nav?.className).not.toContain("nav--open");
    });

    it("closes hamburger when clicking a navigation link", async () => {
      const { container } = renderHeader();
      const hamburger = screen.getByRole("button", { name: "" });

      await userEvent.click(hamburger);
      expect(container.querySelector("nav")?.className).toContain("nav--open");

      // Click Racers link (unique text in nav)
      const racersLink = screen.getByText("Racers");
      await userEvent.click(racersLink);

      expect(container.querySelector("nav")?.className).not.toContain("nav--open");
    });

    it("closes hamburger when clicking logo", async () => {
      const { container } = renderHeader();
      const hamburger = screen.getByRole("button", { name: "" });

      await userEvent.click(hamburger);
      expect(container.querySelector("nav")?.className).toContain("nav--open");

      const logo = screen.getByText("🏁 HEAT SEASONS");
      await userEvent.click(logo);

      expect(container.querySelector("nav")?.className).not.toContain("nav--open");
    });
  });

  describe("Keyboard Navigation", () => {
    it("allows keyboard navigation through links", async () => {
      renderHeader();
      const dashboardLink = screen.getByText("Dashboard");

      dashboardLink.focus();
      expect(dashboardLink).toHaveFocus();

      await userEvent.keyboard("{Tab}");
      const racersLink = screen.getByText("Racers");
      expect(racersLink).toHaveFocus();

      await userEvent.keyboard("{Tab}");
      const teamsLink = screen.getByText("Teams");
      expect(teamsLink).toHaveFocus();
    });
  });

  describe("Scroll Behaviour", () => {
    afterEach(() => {
      Object.defineProperty(window, "scrollY", { value: 0, writable: true });
    });

    it("adds scrolled class when scrollY exceeds 50px", async () => {
      const { container } = renderHeader();
      Object.defineProperty(window, "scrollY", { value: 100, writable: true });
      window.dispatchEvent(new Event("scroll"));
      await screen.findByRole("banner");
      expect(container.querySelector("header")?.className).toContain("header--scrolled");
    });

    it("removes scrolled class when scrollY drops back to 0", async () => {
      const { container } = renderHeader();
      Object.defineProperty(window, "scrollY", { value: 100, writable: true });
      window.dispatchEvent(new Event("scroll"));
      Object.defineProperty(window, "scrollY", { value: 0, writable: true });
      window.dispatchEvent(new Event("scroll"));
      await screen.findByRole("banner");
      expect(container.querySelector("header")?.className).not.toContain("header--scrolled");
    });

    it("closes the hamburger menu when scrollY exceeds 50px", async () => {
      const { container } = renderHeader();
      const hamburger = screen.getByRole("button", { name: "" });
      await userEvent.click(hamburger);
      expect(container.querySelector("nav")?.className).toContain("nav--open");

      Object.defineProperty(window, "scrollY", { value: 100, writable: true });
      window.dispatchEvent(new Event("scroll"));
      await screen.findByRole("banner");
      expect(container.querySelector("nav")?.className).not.toContain("nav--open");
    });

    it("removes scroll listener on unmount", () => {
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
      const { unmount } = renderHeader();
      unmount();
      expect(removeEventListenerSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
      removeEventListenerSpy.mockRestore();
    });
  });

  describe("UserProfileBadge", () => {
    it("navigates to /profile when the badge is clicked", async () => {
      renderHeader({ isAuthenticated: true });
      await userEvent.click(screen.getByText("Test User"));
      expect(mockNavigate).toHaveBeenCalledWith("/profile");
    });

    it("renders initials when profilePicture is empty", () => {
      renderHeader({
        isAuthenticated: true,
        user: { id: "1", name: "Test User", email: "t@test.com", role: "user", profilePicture: "" },
      });
      expect(screen.getByText("TU")).toBeInTheDocument();
    });

    it("renders profile image when profilePicture is provided", () => {
      renderHeader({
        isAuthenticated: true,
        user: {
          id: "1",
          name: "Test User",
          email: "t@test.com",
          role: "user",
          profilePicture: "https://example.com/pic.jpg",
        },
      });
      expect(screen.getByRole("img", { name: "Test User" })).toHaveAttribute(
        "src",
        "https://example.com/pic.jpg",
      );
    });

    it("falls back to initials when the profile image errors", async () => {
      renderHeader({
        isAuthenticated: true,
        user: {
          id: "1",
          name: "Test User",
          email: "t@test.com",
          role: "user",
          profilePicture: "https://example.com/pic.jpg",
        },
      });
      const img = screen.getByRole("img", { name: "Test User" });
      await userEvent.unhover(img);
      img.dispatchEvent(new Event("error"));
      expect(await screen.findByText("TU")).toBeInTheDocument();
    });
  });
});
