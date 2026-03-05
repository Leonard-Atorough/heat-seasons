import { screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import RacerCard from "src/components/features/Racer/RacerCard";
import { createMockRacer } from "../../../../utils/fixtures/racer.fixture";
import { renderWithRouter } from "../../../../utils/renderWithRouter";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => ({
  ...(await vi.importActual<typeof import("react-router-dom")>("react-router-dom")),
  useNavigate: () => mockNavigate,
}));

describe("RacerCard Component", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders racer name", () => {
    renderWithRouter(<RacerCard racer={createMockRacer()} />);
    expect(screen.getByText("Lewis Hamilton")).toBeInTheDocument();
  });

  it("renders racer team", () => {
    renderWithRouter(<RacerCard racer={createMockRacer()} />);
    expect(screen.getByText("Mercedes AMG")).toBeInTheDocument();
  });

  it("renders racer nationality", () => {
    renderWithRouter(<RacerCard racer={createMockRacer()} />);
    expect(screen.getByText("British")).toBeInTheDocument();
  });

  it("renders total points with 'pts' suffix", () => {
    renderWithRouter(<RacerCard racer={createMockRacer()} />);
    expect(screen.getByText("180 pts")).toBeInTheDocument();
  });

  it("renders 0 pts when stats are absent", () => {
    renderWithRouter(<RacerCard racer={createMockRacer({ stats: undefined })} />);
    expect(screen.getByText("0 pts")).toBeInTheDocument();
  });

  it("renders the profile image with the racer's name as alt text", () => {
    renderWithRouter(
      <RacerCard racer={createMockRacer({ profileUrl: "https://example.com/lewis.jpg" })} />,
    );
    const img = screen.getByRole("img", { name: "Lewis Hamilton" });
    expect(img).toHaveAttribute("src", "https://example.com/lewis.jpg");
  });

  it("renders the default profile image when profileUrl is not provided", () => {
    renderWithRouter(<RacerCard racer={createMockRacer({ profileUrl: undefined })} />);
    const img = screen.getByRole("img", { name: "Lewis Hamilton" });
    expect(img).toHaveAttribute("src", "/default-profile.png");
  });

  it("renders without error when teamColor is not provided", () => {
    renderWithRouter(<RacerCard racer={createMockRacer({ teamColor: undefined })} />);
    expect(screen.getByText("Lewis Hamilton")).toBeInTheDocument();
  });

  it("navigates to the racer detail page with racer state on click", async () => {
    const racer = createMockRacer();
    renderWithRouter(<RacerCard racer={racer} />);
    await userEvent.click(screen.getByText("Lewis Hamilton"));
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(`/racers/${racer.id}`, { state: { racer } });
  });
});
