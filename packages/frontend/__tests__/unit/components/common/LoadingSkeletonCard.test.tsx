import { LoadingSkeletonCard, LoadingSkeletonCardProps } from "@src/components/common";
import { render, screen } from "@testing-library/react";

const defaultProps: LoadingSkeletonCardProps = {
  lines: 3,
  height: "1em",
  maxWidth: "100%",
};


describe("LoadingSkeletonCard Component", () => {
  it("renders with default props", () => {
    render(<LoadingSkeletonCard {...defaultProps} />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

    it("renders with custom props", () => {
    render(
      <LoadingSkeletonCard
        lines={5}
        height="150px"
        maxWidth="50%"
        includeTitle={false}
        includeText={false}
      />
    );
    expect(screen.getByRole("img")).toBeInTheDocument();
  });
});