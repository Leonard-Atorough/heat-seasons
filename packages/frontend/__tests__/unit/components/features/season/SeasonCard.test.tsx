/*
Test cases to add:
1. Renders the season name and start date
2. Applies the correct status class based on season.status
3. Displays "Starts on" for upcoming seasons and "Ended on" for completed seasons
4. Does not display end date if season.endDate is undefined
5. Shows "Join Season" button when user can join
6. Shows "Joining..." button when isJoining is true
7. Shows "Joined" state when isJoined is true
8. Shows "Edit" and "Delete" buttons when user is admin
9. Calls handleJoin when "Join Season" button is clicked
10. Calls setEditingSeason with the season when "Edit" button is clicked
11. Calls handleDelete with the season when "Delete" button is clicked
*/

import { screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SeasonCard, SeasonCardProps } from "src/components/features/Season";
import { createSeason, createUser } from "tests/utils/fixtures";
import { renderWithRouter } from "tests/utils/renderWithRouter";

const defaultProps: SeasonCardProps = {
  season: createSeason(),
  isJoined: false,
  participants: undefined,
  canJoin: false,
  isJoining: false,
  isAdmin: false,
  isAuthenticated: false,
  user: null,
  handleJoin: vi.fn(),
  setEditingSeason: vi.fn(),
  handleDelete: vi.fn(),
};

describe("SeasonCard Component", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    cleanup();
  });

  it("renders the season name and start date", () => {
    const season = createSeason({ name: "Test Season", startDate: new Date("2026-06-01") });
    renderWithRouter(<SeasonCard {...defaultProps} season={season} />);
    expect(screen.getByText(/test season/i)).toBeInTheDocument();
    expect(screen.getByText(/start date:/i)).toBeInTheDocument();
    expect(screen.getByText(/Mon Jun 01 2026/i)).toBeInTheDocument();
  });

  it("applies the correct status class based on season.status", () => {
    const { rerender } = renderWithRouter(
      <SeasonCard {...defaultProps} season={createSeason({ status: "upcoming" })} />,
    );
    expect(screen.getByText("Upcoming").className).toContain("seasonStatus--upcoming");
    rerender(<SeasonCard {...defaultProps} season={createSeason({ status: "active" })} />);
    expect(screen.getByText("Active").className).toContain("seasonStatus--active");
    rerender(<SeasonCard {...defaultProps} season={createSeason({ status: "completed" })} />);
    expect(screen.getByText("Completed").className).toContain("seasonStatus--completed");
  });

  it("displays end date when season.endDate is defined", () => {
    const season = createSeason({ endDate: new Date("2026-08-31") });
    renderWithRouter(<SeasonCard {...defaultProps} season={season} />);
    expect(screen.getByText(/end date:/i)).toBeInTheDocument();
    expect(screen.getByText(/Aug 31 2026/i)).toBeInTheDocument();
  });

  it("displays 'Ongoing' when season.endDate is undefined", () => {
    const season = createSeason({ endDate: undefined });
    renderWithRouter(<SeasonCard {...defaultProps} season={season} />);
    expect(screen.getByText(/end date:/i)).toBeInTheDocument();
    expect(screen.getByText(/ongoing/i)).toBeInTheDocument();
  });

  it("shows 'Join Season' button when user can join", () => {
    renderWithRouter(<SeasonCard {...defaultProps} canJoin={true} />);
    expect(screen.getByRole("button", { name: "Join Season" })).toBeInTheDocument();
  });

  it("shows 'Joining...' button when isJoining is true", () => {
    renderWithRouter(<SeasonCard {...defaultProps} canJoin={true} isJoining={true} />);
    expect(screen.getByRole("button", { name: "Joining..." })).toBeInTheDocument();
  });

  it("shows 'Joined' badge when isJoined is true", () => {
    renderWithRouter(<SeasonCard {...defaultProps} isJoined={true} />);
    expect(screen.getByText("✓ Joined")).toBeInTheDocument();
  });

  it("shows 'Edit' and 'Delete' buttons when user is admin", () => {
    renderWithRouter(<SeasonCard {...defaultProps} isAdmin={true} />);
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("calls handleJoin when 'Join Season' button is clicked", async () => {
    const handleJoin = vi.fn();
    const user = userEvent.setup();
    renderWithRouter(<SeasonCard {...defaultProps} canJoin={true} handleJoin={handleJoin} />);
    await user.click(screen.getByRole("button", { name: "Join Season" }));
    expect(handleJoin).toHaveBeenCalledWith(defaultProps.season);
  });

  it("calls setEditingSeason with the season when 'Edit' button is clicked", async () => {
    const setEditingSeason = vi.fn();
    const user = userEvent.setup();
    renderWithRouter(
      <SeasonCard {...defaultProps} isAdmin={true} setEditingSeason={setEditingSeason} />,
    );
    await user.click(screen.getByRole("button", { name: "Edit" }));
    expect(setEditingSeason).toHaveBeenCalledWith(defaultProps.season);
  });

  it("calls handleDelete with the season when 'Delete' button is clicked", async () => {
    const handleDelete = vi.fn();
    const user = userEvent.setup();
    renderWithRouter(<SeasonCard {...defaultProps} isAdmin={true} handleDelete={handleDelete} />);
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(handleDelete).toHaveBeenCalledWith(defaultProps.season);
  });

  it("displays participant count when participants is defined", () => {
    const participants = new Set(["racer-1", "racer-2", "racer-3"]);
    renderWithRouter(<SeasonCard {...defaultProps} participants={participants} />);
    expect(screen.getByText(/participants:/i)).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows racer hint for authenticated users without a racer in joinable seasons", () => {
    const user = createUser();
    renderWithRouter(
      <SeasonCard
        {...defaultProps}
        isAuthenticated={true}
        user={user}
        season={createSeason({ status: "upcoming" })}
      />,
    );
    expect(screen.getByText(/create a racer/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /create a racer/i })).toHaveAttribute(
      "href",
      "/profile",
    );
  });

  it("does not show racer hint for users with a racer linked", () => {
    const user = createUser({ racerId: "racer-1" });
    renderWithRouter(
      <SeasonCard
        {...defaultProps}
        isAuthenticated={true}
        user={user}
        season={createSeason({ status: "upcoming" })}
      />,
    );
    expect(screen.queryByText(/create a racer/i)).not.toBeInTheDocument();
  });

  it("does not show racer hint for archived seasons", () => {
    const user = createUser({ racerId: undefined });
    renderWithRouter(
      <SeasonCard
        {...defaultProps}
        isAuthenticated={true}
        user={user}
        season={createSeason({ status: "archived" })}
      />,
    );
    expect(screen.queryByText(/create a racer/i)).not.toBeInTheDocument();
  });

  it("does not show racer hint for unauthenticated users", () => {
    renderWithRouter(
      <SeasonCard
        {...defaultProps}
        isAuthenticated={false}
        user={null}
        season={createSeason({ status: "upcoming" })}
      />,
    );
    expect(screen.queryByText(/create a racer/i)).not.toBeInTheDocument();
  });
});
