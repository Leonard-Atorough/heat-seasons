import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { LinkedRacerCard } from "src/components/features/Profile/LinkedRacerCard";
import { createMockRacer } from "../../../../utils/fixtures/racer.fixture";

describe("LinkedRacerCard Component", () => {
  let onEdit: any;

  beforeEach(() => {
    onEdit = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders racer name, team, and nationality", () => {
    render(<LinkedRacerCard racer={createMockRacer()} />);
    expect(screen.getByText("Lewis Hamilton")).toBeInTheDocument();
    expect(screen.getByText("Mercedes AMG")).toBeInTheDocument();
    expect(screen.getByText("British")).toBeInTheDocument();
  });

  it("renders racer age", () => {
    render(<LinkedRacerCard racer={createMockRacer()} />);
    expect(screen.getByText("39")).toBeInTheDocument();
  });

  it("shows 'Active' when racer is active", () => {
    render(<LinkedRacerCard racer={createMockRacer({ active: true })} />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("shows 'Inactive' when racer is inactive", () => {
    render(<LinkedRacerCard racer={createMockRacer({ active: false })} />);
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("renders points, races, wins, and podiums stats", () => {
    render(<LinkedRacerCard racer={createMockRacer()} />);
    expect(screen.getByText("180")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
  });

  it("renders avg position formatted to 1 decimal when greater than 0", () => {
    render(<LinkedRacerCard racer={createMockRacer()} />);
    expect(screen.getByText("2.5")).toBeInTheDocument();
  });

  it("renders '—' for avg position when avgPosition is 0", () => {
    render(
      <LinkedRacerCard
        racer={createMockRacer({ stats: { totalPoints: 0, totalRaces: 0, wins: 0, podiums: 0, avgPosition: 0 } })}
      />,
    );
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("shows Edit button when onEdit is provided", () => {
    render(<LinkedRacerCard racer={createMockRacer()} onEdit={onEdit} />);
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
  });

  it("hides Edit button when onEdit is not provided", () => {
    render(<LinkedRacerCard racer={createMockRacer()} />);
    expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
  });

  it("calls onEdit when Edit button is clicked", async () => {
    render(<LinkedRacerCard racer={createMockRacer()} onEdit={onEdit} />);
    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});
