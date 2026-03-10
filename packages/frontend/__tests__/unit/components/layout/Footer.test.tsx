import { render, screen } from "@testing-library/react";
import Footer from "src/components/layout/Footer";

describe("Footer Component", () => {
  it("renders the footer element", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();
  });

  it("displays the current year in copyright text", () => {
    const currentYear = new Date().getFullYear();
    render(<Footer />);
    const copyrightText = screen.getByText(new RegExp(`©\\s*${currentYear}\\s*Heat Seasons`));
    expect(copyrightText).toBeInTheDocument();
  });

  it("displays company name", () => {
    render(<Footer />);
    expect(screen.getByText(/Heat Seasons/)).toBeInTheDocument();
  });

  it("displays all rights reserved text", () => {
    render(<Footer />);
    expect(screen.getByText(/All rights reserved/)).toBeInTheDocument();
  });

  it("uses semantic footer HTML", () => {
    const { container } = render(<Footer />);
    const footerElement = container.querySelector("footer");
    expect(footerElement).toBeInTheDocument();
    expect(footerElement?.tagName).toBe("FOOTER");
  });

  it("has correct styling classes applied", () => {
    const { container } = render(<Footer />);
    const footerElement = container.querySelector("footer");
    expect(footerElement?.className).toContain("footer");
  });
});
