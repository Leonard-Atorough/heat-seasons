import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Routes, Route } from "react-router-dom";
import NotFound from "src/pages/NotFound";
import { renderWithRouter } from "tests/utils/renderWithRouter";

describe("NotFound Page", () => {
  it("renders the 404 code", () => {
    renderWithRouter(<NotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("renders the page-not-found heading", () => {
    renderWithRouter(<NotFound />);
    expect(screen.getByRole("heading", { name: /page not found/i })).toBeInTheDocument();
  });

  it("renders a descriptive message", () => {
    renderWithRouter(<NotFound />);
    expect(screen.getByText(/doesn't exist or has been moved/i)).toBeInTheDocument();
  });

  it("renders a 'Go to Dashboard' button", () => {
    renderWithRouter(<NotFound />);
    expect(screen.getByRole("button", { name: /go to dashboard/i })).toBeInTheDocument();
  });

  it("navigates to / when 'Go to Dashboard' is clicked", async () => {
    const user = userEvent.setup();

    renderWithRouter(
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<div>Dashboard Page</div>} />
      </Routes>,
      { routerProps: { initialEntries: ["/some/unknown/route"] } },
    );

    await user.click(screen.getByRole("button", { name: /go to dashboard/i }));

    expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
  });
});
