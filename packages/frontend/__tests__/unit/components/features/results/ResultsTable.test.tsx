import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, afterEach } from "vitest";
import ResultsTable from "src/components/features/Results/ResultsTable";
import { RaceResult } from "shared";

const mockResults: RaceResult[] = [
  { racerId: "racer-1", position: 1, points: 25, constructorPoints: 25 },
  { racerId: "racer-2", position: 2, points: 18, constructorPoints: 18 },
];

const mockRacersMap = new Map([
  ["racer-1", { name: "Lewis Hamilton", team: "Mercedes AMG" }],
  ["racer-2", { name: "Max Verstappen", team: "Red Bull Racing" }],
]);

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe("ResultsTable Component", () => {
  it("renders a loading skeleton when isLoading is true", () => {
    render(
      <ResultsTable
        results={[]}
        racersMap={new Map()}
        isLoading={true}
        error={null}
      />,
    );
    expect(screen.queryByText("Position")).not.toBeInTheDocument();
  });

  it("renders an error message when error is set", () => {
    render(
      <ResultsTable
        results={[]}
        racersMap={new Map()}
        isLoading={false}
        error="Failed to load results"
      />,
    );
    expect(screen.getByText("Failed to load results")).toBeInTheDocument();
    expect(screen.queryByText("Position")).not.toBeInTheDocument();
  });

  it("renders all table column headers", () => {
    render(
      <ResultsTable
        results={[]}
        racersMap={new Map()}
        isLoading={false}
        error={null}
      />,
    );
    expect(screen.getByText("Position")).toBeInTheDocument();
    expect(screen.getByText("Racer")).toBeInTheDocument();
    expect(screen.getByText("Team")).toBeInTheDocument();
    expect(screen.getByText("Points")).toBeInTheDocument();
    expect(screen.getByText("Constructor Points")).toBeInTheDocument();
  });

  it("renders a row for each result with racer data from the map", () => {
    render(
      <ResultsTable
        results={mockResults}
        racersMap={mockRacersMap}
        isLoading={false}
        error={null}
      />,
    );
    expect(screen.getByText("Lewis Hamilton")).toBeInTheDocument();
    expect(screen.getByText("Mercedes AMG")).toBeInTheDocument();
    expect(screen.getByText("Max Verstappen")).toBeInTheDocument();
    expect(screen.getByText("Red Bull Racing")).toBeInTheDocument();
  });

  it("renders position and points values in each row", () => {
    render(
      <ResultsTable
        results={mockResults}
        racersMap={mockRacersMap}
        isLoading={false}
        error={null}
      />,
    );
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getAllByText("25")).toHaveLength(2);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getAllByText("18")).toHaveLength(2);
  });

  it("renders 'Unknown Racer' and 'Unknown Team' for racers not in the map", () => {
    const unmappedResults: RaceResult[] = [
      { racerId: "unknown-id", position: 1, points: 10, constructorPoints: 10 },
    ];
    render(
      <ResultsTable
        results={unmappedResults}
        racersMap={new Map()}
        isLoading={false}
        error={null}
      />,
    );
    expect(screen.getByText("Unknown Racer")).toBeInTheDocument();
    expect(screen.getByText("Unknown Team")).toBeInTheDocument();
  });

  it("calls onSortBy with 'position' when Position header is clicked", async () => {
    const onSortBy = vi.fn();
    render(
      <ResultsTable
        results={mockResults}
        racersMap={mockRacersMap}
        isLoading={false}
        error={null}
        onSortBy={onSortBy}
      />,
    );
    await userEvent.click(screen.getByText("Position"));
    expect(onSortBy).toHaveBeenCalledWith("position");
  });

  it("calls onSortBy with 'points' when Points header is clicked", async () => {
    const onSortBy = vi.fn();
    render(
      <ResultsTable
        results={mockResults}
        racersMap={mockRacersMap}
        isLoading={false}
        error={null}
        onSortBy={onSortBy}
      />,
    );
    await userEvent.click(screen.getByText("Points"));
    expect(onSortBy).toHaveBeenCalledWith("points");
  });

  it("calls onSortBy with 'racerId' when Racer header is clicked", async () => {
    const onSortBy = vi.fn();
    render(
      <ResultsTable
        results={mockResults}
        racersMap={mockRacersMap}
        isLoading={false}
        error={null}
        onSortBy={onSortBy}
      />,
    );
    await userEvent.click(screen.getByText("Racer"));
    expect(onSortBy).toHaveBeenCalledWith("racerId");
  });

  it("calls onSortBy with 'constructorPoints' when Constructor Points header is clicked", async () => {
    const onSortBy = vi.fn();
    render(
      <ResultsTable
        results={mockResults}
        racersMap={mockRacersMap}
        isLoading={false}
        error={null}
        onSortBy={onSortBy}
      />,
    );
    await userEvent.click(screen.getByText("Constructor Points"));
    expect(onSortBy).toHaveBeenCalledWith("constructorPoints");
  });

  it("does not throw when onSortBy is not provided and a header is clicked", async () => {
    render(
      <ResultsTable
        results={mockResults}
        racersMap={mockRacersMap}
        isLoading={false}
        error={null}
      />,
    );
    await userEvent.click(screen.getByText("Position"));
  });
});
