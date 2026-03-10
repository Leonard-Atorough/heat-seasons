import { render, screen } from "@testing-library/react";
import { PageHeader, PageHeaderProps } from "src/components/common";

const defaultProps: PageHeaderProps = {
  title: "Test Title",
};

describe("PageHeader Component", () => {
  it("renders with default props (title only)", () => {
    render(<PageHeader {...defaultProps} />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders with subtitle", () => {
    render(<PageHeader {...defaultProps} subtitle="Test Subtitle" />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Subtitle")).toBeInTheDocument();
  });

  it("renders minimal variant", () => {
    render(<PageHeader {...defaultProps} variant="minimal" />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    const heading = screen.getByText("Test Title");
    expect(heading.tagName).toBe("H1");
  });

  it("renders default variant", () => {
    render(<PageHeader {...defaultProps} variant="default" />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    const heading = screen.getByText("Test Title");
    expect(heading.tagName).toBe("H1");
  });

  it("renders hero variant", () => {
    render(<PageHeader {...defaultProps} variant="hero" />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    const heading = screen.getByText("Test Title");
    expect(heading.tagName).toBe("H2");
  });

  it("renders hero variant with subtitle", () => {
    render(<PageHeader {...defaultProps} variant="hero" subtitle="Hero Subtitle" />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Hero Subtitle")).toBeInTheDocument();
  });

  it("renders hero variant with background image", () => {
    const bgImage = "https://example.com/image.jpg";
    const { container } = render(
      <PageHeader {...defaultProps} variant="hero" backgroundImage={bgImage} />,
    );
    const section = container.querySelector("section");
    expect(section).toHaveStyle({
      backgroundImage: expect.stringContaining("url(https://example.com/image.jpg)"),
    });
  });

  it("renders hero variant with custom height", () => {
    const { container } = render(<PageHeader {...defaultProps} variant="hero" height="50vh" />);
    const section = container.querySelector("section");
    expect(section).toHaveStyle({ height: "50vh" });
  });

  it("renders hero variant with default height when not specified", () => {
    const { container } = render(<PageHeader {...defaultProps} variant="hero" />);
    const section = container.querySelector("section");
    expect(section).toHaveStyle({ height: "80vh" });
  });

  it("renders hero variant with action node", () => {
    render(<PageHeader {...defaultProps} variant="hero" action={<button>Hero Action</button>} />);
    expect(screen.getByText("Hero Action")).toBeInTheDocument();
  });

  it("does not render subtitle in minimal variant", () => {
    render(<PageHeader {...defaultProps} variant="minimal" subtitle="Should not appear" />);
    expect(screen.queryByText("Should not appear")).not.toBeInTheDocument();
  });
});
