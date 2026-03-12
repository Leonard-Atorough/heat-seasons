import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { EditRacerModal } from "src/components/features/Profile/EditRacerModal";
import { createRacerWithStats } from "tests/utils/fixtures/racer.fixture";

vi.mock("src/services/api/racer");
import * as racerApi from "src/services/api/racer";
const mockedUpdateRacer = vi.mocked(racerApi.updateRacer);

const racer = createRacerWithStats();

describe("EditRacerModal Component", () => {
  let user: ReturnType<typeof userEvent.setup>;
  let onClose: any;
  let onUpdated: any;

  beforeEach(() => {
    user = userEvent.setup();
    onClose = vi.fn();
    onUpdated = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("does not render when isOpen is false", () => {
    render(<EditRacerModal racer={racer} isOpen={false} onClose={onClose} onUpdated={onUpdated} />);
    expect(screen.queryByText("Edit Racer Profile")).not.toBeInTheDocument();
  });

  it("pre-fills name, team, nationality, and age with racer data", () => {
    render(<EditRacerModal racer={racer} isOpen={true} onClose={onClose} onUpdated={onUpdated} />);
    expect(screen.getByDisplayValue("Lewis Hamilton")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Mercedes AMG")).toBeInTheDocument();
    expect(screen.getByDisplayValue("British")).toBeInTheDocument();
    expect(screen.getByDisplayValue("39")).toBeInTheDocument();
  });

  it("shows validation error when required fields are cleared before submitting", async () => {
    render(<EditRacerModal racer={racer} isOpen={true} onClose={onClose} onUpdated={onUpdated} />);
    await user.clear(screen.getByDisplayValue("Lewis Hamilton"));
    await user.click(screen.getByRole("button", { name: /^save changes$/i }));
    expect(await screen.findByText("Racer name is required")).toBeInTheDocument();
    expect(mockedUpdateRacer).not.toHaveBeenCalled();
  });

  it("shows validation error when age is out of valid range", async () => {
    render(<EditRacerModal racer={racer} isOpen={true} onClose={onClose} onUpdated={onUpdated} />);
    fireEvent.change(screen.getByDisplayValue("39"), { target: { value: "0" } });
    await user.click(screen.getByRole("button", { name: /^save changes$/i }));
    expect(await screen.findByText("Age must be at least 8")).toBeInTheDocument();
    expect(mockedUpdateRacer).not.toHaveBeenCalled();
  });

  it("calls updateRacer with the correct payload on valid submission", async () => {
    mockedUpdateRacer.mockResolvedValueOnce({} as any);
    render(<EditRacerModal racer={racer} isOpen={true} onClose={onClose} onUpdated={onUpdated} />);
    await user.click(screen.getByRole("button", { name: /^save changes$/i }));
    await waitFor(() => expect(mockedUpdateRacer).toHaveBeenCalledTimes(1));
    expect(mockedUpdateRacer).toHaveBeenCalledWith(
      racer.id,
      expect.objectContaining({
        name: "Lewis Hamilton",
        team: "Mercedes AMG",
        nationality: "British",
        age: 39,
      }),
    );
  });

  it("calls onUpdated after successful submission", async () => {
    mockedUpdateRacer.mockResolvedValueOnce({} as any);
    render(<EditRacerModal racer={racer} isOpen={true} onClose={onClose} onUpdated={onUpdated} />);
    await user.click(screen.getByRole("button", { name: /^save changes$/i }));
    await waitFor(() => expect(onUpdated).toHaveBeenCalledTimes(1));
  });

  it("shows API error message on failure", async () => {
    mockedUpdateRacer.mockRejectedValueOnce({ message: "Update failed" });
    render(<EditRacerModal racer={racer} isOpen={true} onClose={onClose} onUpdated={onUpdated} />);
    await user.click(screen.getByRole("button", { name: /^save changes$/i }));
    expect(await screen.findByText("Update failed")).toBeInTheDocument();
  });

  it("calls onClose when Cancel is clicked", async () => {
    render(<EditRacerModal racer={racer} isOpen={true} onClose={onClose} onUpdated={onUpdated} />);
    await user.click(screen.getByRole("button", { name: /^cancel$/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("toggling the Active checkbox changes the displayed status label", async () => {
    render(<EditRacerModal racer={racer} isOpen={true} onClose={onClose} onUpdated={onUpdated} />);
    const checkbox = screen.getByRole("checkbox");
    expect(screen.getByText("Active")).toBeInTheDocument();
    await user.click(checkbox);
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });
});
