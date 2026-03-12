import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { CreateRacerModal } from "src/components/features/Profile/CreateRacerModal";
import { createRacer } from "tests/utils/fixtures";
import { Racer } from "shared";

vi.mock("src/services/api/racer");
import * as racerApi from "src/services/api/racer";
const mockedCreateRacer = vi.mocked(racerApi.createRacer);

describe("CreateRacerModal Component", () => {
  let user: ReturnType<typeof userEvent.setup>;
  let onClose: any;
  let onCreated: any;

  beforeEach(() => {
    user = userEvent.setup();
    onClose = vi.fn();
    onCreated = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  function fillForm(mockRacer: Racer) {
    fireEvent.change(screen.getByLabelText(/racer name/i), { target: { value: mockRacer.name } });
    fireEvent.change(screen.getByLabelText(/^team$/i), { target: { value: mockRacer.team } });
    fireEvent.change(screen.getByLabelText(/nationality/i), { target: { value: mockRacer.nationality } });
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: mockRacer.age } });
  }

  it("does not render when isOpen is false", () => {
    render(<CreateRacerModal isOpen={false} onClose={onClose} onCreated={onCreated} />);
    expect(screen.queryByText("Create Your Racer")).not.toBeInTheDocument();
  });

  it("renders the modal title and all form fields when isOpen is true", () => {
    render(<CreateRacerModal isOpen={true} onClose={onClose} onCreated={onCreated} />);
    expect(screen.getByText("Create Your Racer")).toBeInTheDocument();
    expect(screen.getByLabelText(/racer name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^team$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nationality/i)).toBeInTheDocument();
    expect(screen.getByRole("spinbutton")).toBeInTheDocument();
  });

  it("shows validation error when submitting with empty required fields", async () => {
    render(<CreateRacerModal isOpen={true} onClose={onClose} onCreated={onCreated} />);
    await user.click(screen.getByRole("button", { name: /^create racer$/i }));
    expect(await screen.findByText("Racer name is required")).toBeInTheDocument();
    expect(mockedCreateRacer).not.toHaveBeenCalled();
  });

  it("shows validation error when age is out of valid range", async () => {
    render(<CreateRacerModal isOpen={true} onClose={onClose} onCreated={onCreated} />);
    const mockRacer = createRacer();
    mockRacer.age = 999;
    await fillForm(mockRacer);
    await user.click(screen.getByRole("button", { name: /^create racer$/i }));
    expect(await screen.findByText("Age cannot exceed 120")).toBeInTheDocument();
    expect(mockedCreateRacer).not.toHaveBeenCalled();
  });

  it("calls createRacer with the correct payload on valid submission", async () => {
    mockedCreateRacer.mockResolvedValueOnce({} as any);
    render(<CreateRacerModal isOpen={true} onClose={onClose} onCreated={onCreated} />);
    const mockRacer = createRacer();
    await fillForm(mockRacer);
    await user.click(screen.getByRole("button", { name: /^create racer$/i }));
    await waitFor(() => expect(mockedCreateRacer).toHaveBeenCalledTimes(1));
    expect(mockedCreateRacer).toHaveBeenCalledWith(
      expect.objectContaining({
        name: mockRacer.name,
        team: mockRacer.team,
        nationality: mockRacer.nationality,
        age: mockRacer.age,
        active: true,
      }),
    );
  });

  it("calls onCreated after successful submission", async () => {
    mockedCreateRacer.mockResolvedValueOnce({} as any);
    render(<CreateRacerModal isOpen={true} onClose={onClose} onCreated={onCreated} />);
    const mockRacer = createRacer();
    await fillForm(mockRacer);
    await user.click(screen.getByRole("button", { name: /^create racer$/i }));
    await waitFor(() => expect(onCreated).toHaveBeenCalledTimes(1));
  });

  it("shows 'already linked' error on a 409 API response", async () => {
    mockedCreateRacer.mockRejectedValueOnce({ status: 409, message: "Conflict" });
    render(<CreateRacerModal isOpen={true} onClose={onClose} onCreated={onCreated} />);
    const mockRacer = createRacer();
    await fillForm(mockRacer);
    await user.click(screen.getByRole("button", { name: /^create racer$/i }));
    expect(
      await screen.findByText("You already have a racer linked to your account."),
    ).toBeInTheDocument();
  });

  it("shows a generic API error message on failure", async () => {
    mockedCreateRacer.mockRejectedValueOnce({ message: "Server error" });
    render(<CreateRacerModal isOpen={true} onClose={onClose} onCreated={onCreated} />);
    const mockRacer = createRacer();
    await fillForm(mockRacer);
    await user.click(screen.getByRole("button", { name: /^create racer$/i }));
    expect(await screen.findByText("Server error")).toBeInTheDocument();
  });

  it("calls onClose when Cancel is clicked", async () => {
    render(<CreateRacerModal isOpen={true} onClose={onClose} onCreated={onCreated} />);
    await user.click(screen.getByRole("button", { name: /^cancel$/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
