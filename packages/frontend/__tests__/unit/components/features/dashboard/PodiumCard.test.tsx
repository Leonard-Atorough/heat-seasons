import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import PodiumCard, { PodiumCardProps } from "src/components/features/Dashboard/PodiumCard";

const defaultProps: PodiumCardProps = {
  medal: "gold",
  medalImageEmoji: "🥇",
  teamColor: "#e8c200",
  racerName: "Max Verstappen",
  racerTeam: "Red Bull Racing",
  racerNationality: "NL",
  points: 420,
  imageUrl: "https://example.com/racer.png",
};

describe("PodiumCard Component", () => {
  it("renders racer name, team, and nationality", () => {
    render(<PodiumCard {...defaultProps} />);
    expect(screen.getByText("Max Verstappen")).toBeInTheDocument();
    expect(screen.getByText("Red Bull Racing")).toBeInTheDocument();
    expect(screen.getByText("NL")).toBeInTheDocument();
  });

  it("renders the medal emoji", () => {
    render(<PodiumCard {...defaultProps} />);
    expect(screen.getByText("🥇")).toBeInTheDocument();
  });

  it("renders points with 'pts' label", () => {
    render(<PodiumCard {...defaultProps} />);
    expect(screen.getByText("420 pts")).toBeInTheDocument();
  });

  it("renders racer image when imageUrl is provided", () => {
    render(<PodiumCard {...defaultProps} />);
    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/racer.png");
    expect(img).toHaveAttribute("alt", "Max Verstappen");
  });

  it("does not render an image when imageUrl is null", () => {
    render(<PodiumCard {...defaultProps} imageUrl={null} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("applies the correct CSS class for the gold medal", () => {
    const { container } = render(<PodiumCard {...defaultProps} medal="gold" />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("podiumCard--gold");
  });

  it("applies the correct CSS class for the silver medal", () => {
    const { container } = render(<PodiumCard {...defaultProps} medal="silver" />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("podiumCard--silver");
  });

  it("applies the correct CSS class for the bronze medal", () => {
    const { container } = render(<PodiumCard {...defaultProps} medal="bronze" />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("podiumCard--bronze");
  });
});
