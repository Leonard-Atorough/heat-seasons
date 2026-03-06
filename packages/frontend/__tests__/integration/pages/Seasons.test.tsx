import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Seasons from "src/pages/Seasons";
import { useSeasons } from "src/hooks/data/useSeason";
import { useAuth } from "src/hooks/useAuth";
import { createSeason, createUserFixture } from "tests/utils/fixtures";
import { createUseAuthMock } from "tests/utils/mocks/useAuth.mock";
import {
  createSeason as createSeasonApi,
  deleteSeason,
  getSeasonParticipants,
  joinSeason,
  updateSeason,
} from "src/services/api/season";

vi.mock("src/hooks/data/useSeason", () => ({
  useSeasons: vi.fn(),
}));

vi.mock("src/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("src/services/api/season", () => ({
  createSeason: vi.fn(),
  updateSeason: vi.fn(),
  deleteSeason: vi.fn(),
  getSeasonParticipants: vi.fn(),
  joinSeason: vi.fn(),
}));

const mockedUseSeasons = vi.mocked(useSeasons);
const mockedUseAuth = vi.mocked(useAuth);
const mockedGetSeasonParticipants = vi.mocked(getSeasonParticipants);
const mockedJoinSeason = vi.mocked(joinSeason);
const mockedDeleteSeason = vi.mocked(deleteSeason);
const mockedCreateSeasonApi = vi.mocked(createSeasonApi);
const mockedUpdateSeason = vi.mocked(updateSeason);

const refresh = vi.fn();

function renderPage() {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Seasons />
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
  refresh.mockReset();
});

describe("Seasons page integration", () => {
  // 1. Renders seasons sorted by start date descending
  // 2. Shows create action for admins and opens the add-season modal
  // 3. Hides create action for non-admin users
  // 4. Calls refresh on mount and when user clicks refresh
  // 5. Handles successful join for authenticated users with a linked racer
  // 6. Shows API error message when join fails

  it("renders seasons sorted by newest start date first", async () => {
    mockedUseSeasons.mockReturnValue({
      data: [
        createSeason({
          id: "s1",
          name: "Older",
          startDate: new Date("2024-01-01"),
          status: "active",
        }),
        createSeason({
          id: "s2",
          name: "Newest",
          startDate: new Date("2026-01-01"),
          status: "active",
        }),
      ],
      isLoading: false,
      error: null,
      refresh,
    });

    mockedUseAuth.mockReturnValue(createUseAuthMock({ isAdmin: false, isAuthenticated: false }));
    mockedGetSeasonParticipants.mockResolvedValue([]);

    renderPage();

    const cards = await screen.findAllByRole("heading", { level: 2 });
    expect(cards[0]).toHaveTextContent("NEWEST");
    expect(cards[1]).toHaveTextContent("OLDER");
  });

  it("shows create action for admins and opens add season modal", async () => {
    const adminUser = createUserFixture({ role: "admin", racerId: "racer-1" });
    const user = userEvent.setup();

    mockedUseSeasons.mockReturnValue({
      data: [createSeason({ id: "s1", status: "upcoming" })],
      isLoading: false,
      error: null,
      refresh,
    });

    mockedUseAuth.mockReturnValue(
      createUseAuthMock({
        user: adminUser,
        isAdmin: true,
        isAuthenticated: true,
      }),
    );
    mockedGetSeasonParticipants.mockResolvedValue([]);

    renderPage();

    const createButton = await screen.findByRole("button", { name: /create season/i });
    expect(createButton).toBeInTheDocument();

    await user.click(createButton);

    expect(await screen.findByRole("heading", { name: /add new season/i })).toBeInTheDocument();
  });

  it("hides create action for non-admin users", async () => {
    mockedUseSeasons.mockReturnValue({
      data: [createSeason({ id: "s1", status: "upcoming" })],
      isLoading: false,
      error: null,
      refresh,
    });

    mockedUseAuth.mockReturnValue(
      createUseAuthMock({
        isAdmin: false,
        isAuthenticated: true,
        user: createUserFixture({ racerId: "racer-1" }),
      }),
    );
    mockedGetSeasonParticipants.mockResolvedValue([]);

    renderPage();

    await screen.findByText(/participants:/i);

    expect(screen.queryByRole("button", { name: /create season/i })).not.toBeInTheDocument();
  });

  it("calls refresh on mount and when refresh button is clicked", async () => {
    const user = userEvent.setup();

    mockedUseSeasons.mockReturnValue({
      data: [createSeason({ id: "s1", status: "upcoming" })],
      isLoading: false,
      error: null,
      refresh,
    });

    mockedUseAuth.mockReturnValue(createUseAuthMock({ isAdmin: false, isAuthenticated: false }));
    mockedGetSeasonParticipants.mockResolvedValue([]);

    renderPage();

    expect(refresh).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: /refresh/i }));

    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it("joins season successfully for authenticated users with a linked racer", async () => {
    const user = userEvent.setup();

    mockedUseSeasons.mockReturnValue({
      data: [createSeason({ id: "s1", status: "active" })],
      isLoading: false,
      error: null,
      refresh,
    });

    mockedUseAuth.mockReturnValue(
      createUseAuthMock({
        isAdmin: false,
        isAuthenticated: true,
        user: createUserFixture({ racerId: "racer-42" }),
      }),
    );

    mockedGetSeasonParticipants.mockResolvedValue([]);
    mockedJoinSeason.mockResolvedValue({
      racerId: "racer-42",
      seasonId: "s1",
      registeredAt: new Date(),
    });

    renderPage();

    const joinButton = await screen.findByRole("button", { name: /join season/i });
    await user.click(joinButton);

    expect(mockedJoinSeason).toHaveBeenCalledWith("s1", "racer-42");
    expect(await screen.findByText(/✓ joined/i)).toBeInTheDocument();
  });

  it("shows error toast when join fails", async () => {
    const user = userEvent.setup();

    mockedUseSeasons.mockReturnValue({
      data: [createSeason({ id: "s1", status: "active" })],
      isLoading: false,
      error: null,
      refresh,
    });

    mockedUseAuth.mockReturnValue(
      createUseAuthMock({
        isAdmin: false,
        isAuthenticated: true,
        user: createUserFixture({ racerId: "racer-42" }),
      }),
    );

    mockedGetSeasonParticipants.mockResolvedValue([]);
    mockedJoinSeason.mockRejectedValue({ data: { message: "Already joined" } });

    renderPage();

    const joinButton = await screen.findByRole("button", { name: /join season/i });
    await user.click(joinButton);

    expect(await screen.findByText(/already joined/i)).toBeInTheDocument();
  });

  it("shows generic error message when join fails without a message", async () => {
    const user = userEvent.setup();
    mockedUseSeasons.mockReturnValue({
      data: [createSeason({ id: "s1", status: "active" })],
      isLoading: false,
      error: null,
      refresh,
    });

    mockedUseAuth.mockReturnValue(
      createUseAuthMock({
        isAdmin: false,
        isAuthenticated: true,
        user: createUserFixture({ racerId: "racer-42" }),
      }),
    );
    mockedGetSeasonParticipants.mockResolvedValue([]);
    mockedJoinSeason.mockRejectedValue({});

    renderPage();

    const joinButton = await screen.findByRole("button", { name: /join season/i });
    await user.click(joinButton);
    expect(await screen.findByText(/failed to join season/i)).toBeInTheDocument();
  });

  it("shows error message when join throws an unexpected error", async () => {
    const user = userEvent.setup();
    mockedUseSeasons.mockReturnValue({
      data: [createSeason({ id: "s1", status: "active" })],
      isLoading: false,
      error: null,
      refresh,
    });

    mockedUseAuth.mockReturnValue(
      createUseAuthMock({
        isAdmin: false,
        isAuthenticated: true,
        user: createUserFixture({ racerId: "racer-42" }),
      }),
    );
    mockedGetSeasonParticipants.mockResolvedValue([]);
    mockedJoinSeason.mockRejectedValue(new Error("Network error"));

    renderPage();

    const joinButton = await screen.findByRole("button", { name: /join season/i });
    await user.click(joinButton);
    expect(await screen.findByText(/network error/i)).toBeInTheDocument();
  });

  it("when onDelete is called successfully deletes the season and refreshes the list", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    mockedUseSeasons.mockReturnValue({
      data: [createSeason({ id: "s1", status: "upcoming" })],
      isLoading: false,
      error: null,
      refresh,
    });

    mockedUseAuth.mockReturnValue(
      createUseAuthMock({
        isAdmin: true,
        isAuthenticated: true,
        user: createUserFixture({ racerId: "racer-1" }),
      }),
    );
    mockedGetSeasonParticipants.mockResolvedValue([]);
    mockedDeleteSeason.mockResolvedValue({ success: true });

    renderPage();

    const deleteButton = await screen.findByRole("button", { name: /delete/i });
    await user.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockedDeleteSeason).toHaveBeenCalledWith("s1");
    expect(refresh).toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it("shows error message when onDelete fails", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    mockedUseSeasons.mockReturnValue({
      data: [createSeason({ id: "s1", status: "upcoming" })],
      isLoading: false,
      error: null,
      refresh,
    });

    mockedUseAuth.mockReturnValue(
      createUseAuthMock({
        isAdmin: true,
        isAuthenticated: true,
        user: createUserFixture({ racerId: "racer-1" }),
      }),
    );
    mockedGetSeasonParticipants.mockResolvedValue([]);
    mockedDeleteSeason.mockRejectedValue({ data: { message: "Delete failed" } });

    renderPage();

    const deleteButton = await screen.findByRole("button", { name: /delete/i });
    await user.click(deleteButton);

    expect(await screen.findByText(/delete failed/i)).toBeInTheDocument();

    confirmSpy.mockRestore();
  });

  it("opens add season modal when create button is clicked", async () => {
    const user = userEvent.setup();
    mockedUseSeasons.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refresh,
    });

    mockedUseAuth.mockReturnValue(
      createUseAuthMock({
        isAdmin: true,
        isAuthenticated: true,
        user: createUserFixture({ racerId: "racer-1" }),
      }),
    );
    mockedGetSeasonParticipants.mockResolvedValue([]);

    renderPage();

    const createButton = await screen.findByRole("button", { name: /create season/i });
    await user.click(createButton);
    expect(await screen.findByRole("heading", { name: /add new season/i })).toBeInTheDocument();
  });

  it("calls API and refreshes list when season is created", async () => {
    const user = userEvent.setup();
    mockedUseSeasons.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refresh,
    });

    mockedUseAuth.mockReturnValue(
      createUseAuthMock({
        isAdmin: true,
        isAuthenticated: true,
        user: createUserFixture({ racerId: "racer-1" }),
      }),
    );
    mockedGetSeasonParticipants.mockResolvedValue([]);
    mockedCreateSeasonApi.mockResolvedValue(createSeason({ id: "new-season" }));

    renderPage();

    const createButton = await screen.findByRole("button", { name: /create season/i });
    await user.click(createButton);
    const nameInput = await screen.findByLabelText(/season name/i);
    const startDateInput = screen.getByLabelText(/start date/i);
    const submitButton = screen
      .getAllByRole("button", { name: /create season/i })
      .find((button) => button.getAttribute("type") === "submit");
    expect(submitButton).toBeDefined();
    fireEvent.change(nameInput, { target: { value: "New Season" } });
    fireEvent.change(startDateInput, { target: { value: "2024-12-01" } });
    expect(nameInput).toHaveValue("New Season");
    expect(startDateInput).toHaveValue("2024-12-01");
    await user.click(submitButton!);

    await waitFor(() => {
      expect(mockedCreateSeasonApi).toHaveBeenCalledWith(
        "New Season",
        expect.stringMatching(/^2024-12-01T/),
      );
    });
    expect(refresh).toHaveBeenCalled();
  });
});
