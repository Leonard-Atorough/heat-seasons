import { cleanup, render, screen } from "@testing-library/react";
import { TeamCard } from "src/components/features/Teams";
import { createRacer, createRacerWithStatsList } from "tests/utils/fixtures";

const defaultProps = {
  teamName: "Test Team",
  teamColor: "#ff0000",
};

describe("TeamCard Component", () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders team name and color", () => {
    const racer = createRacer().name;
    render(<TeamCard {...defaultProps} racers={[racer]} />);
    expect(screen.getByText("Test Team")).toBeInTheDocument();
    expect(screen.getByText("Test Team").parentElement?.parentElement).toHaveStyle(
      `background-image: linear-gradient(135deg, ${defaultProps.teamColor} 55%, white 100%)`,
    );
  });

  it("renders when no team color is provided", () => {
    const racer = createRacer().name;
    render(<TeamCard teamName="No Color Team" racers={[racer]} />);
    expect(screen.getByText("No Color Team")).toBeInTheDocument();
    expect(screen.getByText("No Color Team").parentElement?.parentElement).toHaveStyle(
      `background-image: linear-gradient(135deg, var(--card-white) 55%, white 100%)`,
    );
  });

  it("renders a list of racers", () => {
    const racers = createRacerWithStatsList(2, [
      { name: "Lewis Hamilton" },
      { name: "Max Verstappen" },
    ]).values();
    render(<TeamCard {...defaultProps} racers={Array.from(racers).map((r) => r.name)} />);
    expect(screen.getByText("Lewis Hamilton")).toBeInTheDocument();
    expect(screen.getByText("Max Verstappen")).toBeInTheDocument();
  });
});
