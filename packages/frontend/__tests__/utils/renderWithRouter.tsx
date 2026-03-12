import { render, RenderOptions } from "@testing-library/react";
import { MemoryRouter, MemoryRouterProps } from "react-router-dom";
import { ReactElement } from "react";

interface RenderWithRouterOptions extends RenderOptions {
  routerProps?: MemoryRouterProps;
}

/**
 * Renders a component wrapped in a `MemoryRouter`.
 * Use this helper for components that rely on react-router-dom context (e.g. `useNavigate`, `<Link>`).
 */
export function renderWithRouter(
  ui: ReactElement,
  { routerProps, ...renderOptions }: RenderWithRouterOptions = {},
) {
  return render(ui, {
    ...renderOptions,
    wrapper: ({ children }) => <MemoryRouter {...routerProps}>{children}</MemoryRouter>,
  });
}
