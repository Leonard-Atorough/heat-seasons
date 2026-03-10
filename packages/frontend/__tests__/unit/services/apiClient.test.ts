import { describe, it, vi } from "vitest";
import ApiClient from "src/services/apiClient";

describe("Given an API client", () => {
  let mockFetch: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    mockFetch = vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    mockFetch.mockRestore();
  });

  it("returns parsed data on successful fetch", async () => {
    const mockData = { id: 1, name: "Test" };
    const mockApiResponse = {
      success: true,
      data: mockData,
      message: "OK",
      status: 200,
      statusText: "OK",
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);
    const data = await ApiClient.get("/test");
    expect(data).toEqual(mockData);
  });
  it("throws ApiError when API returns success=false", async () => {
    const mockApiResponse = {
      success: false,
      message: "Bad request",
      status: 400,
      statusText: "Bad Request",
    };
    mockFetch.mockResolvedValueOnce({ json: async () => mockApiResponse } as Response);

    await expect(ApiClient.get("/bad")).rejects.toMatchObject({
      name: "ApiError",
      message: "Bad request",
      status: 400,
      statusText: "Bad Request",
    });
  });

  it("stringifies body for POST and includes credentials/headers", async () => {
    const mockApiResponse = { success: true, data: {}, status: 201, statusText: "Created" };
    mockFetch.mockResolvedValueOnce({ json: async () => mockApiResponse } as Response);

    const payload = { hello: "world" };
    await ApiClient.post("/items", payload, undefined, { "X-Test": "1" });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const init = (mockFetch as any).mock.calls[0][1];
    expect(init.method).toBe("POST");
    expect(init.credentials).toBe("include");
    expect(init.body).toBe(JSON.stringify(payload));
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.headers["X-Test"]).toBe("1");
  });

  it("stringifies body for PUT and includes credentials/headers", async () => {
    const mockApiResponse = { success: true, data: {}, status: 200, statusText: "OK" };
    mockFetch.mockResolvedValueOnce({ json: async () => mockApiResponse } as Response);

    const payload = { update: "data" };
    await ApiClient.put("/items/1", payload, undefined, { "X-Test": "2" });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const init = (mockFetch as any).mock.calls[0][1];
    expect(init.method).toBe("PUT");
    expect(init.credentials).toBe("include");
    expect(init.body).toBe(JSON.stringify(payload));
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.headers["X-Test"]).toBe("2");
  });

  it("stringifies body for PATCH and includes credentials/headers", async () => {
    const mockApiResponse = { success: true, data: {}, status: 200, statusText: "OK" };
    mockFetch.mockResolvedValueOnce({ json: async () => mockApiResponse } as Response);

    const payload = { patch: "value" };
    await ApiClient.patch("/items/1", payload, undefined, { "X-Test": "3" });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const init = (mockFetch as any).mock.calls[0][1];
    expect(init.method).toBe("PATCH");
    expect(init.credentials).toBe("include");
    expect(init.body).toBe(JSON.stringify(payload));
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.headers["X-Test"]).toBe("3");
  });

  it("handles DELETE method without body but includes credentials/headers", async () => {
    const mockApiResponse = { success: true, data: {}, status: 204, statusText: "No Content" };
    mockFetch.mockResolvedValueOnce({ json: async () => mockApiResponse } as Response);

    await ApiClient.delete("/items/1", undefined, { "X-Test": "4" });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const init = (mockFetch as any).mock.calls[0][1];
    expect(init.method).toBe("DELETE");
    expect(init.credentials).toBe("include");
    expect(init.body).toBeUndefined();
    expect(init.headers["X-Test"]).toBe("4");
  });

  it("maps network errors to ApiError with status 0", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network down"));

    await expect(ApiClient.get("/x")).rejects.toMatchObject({
      name: "ApiError",
      message: "Network down",
      status: 0,
      statusText: "UnknownError",
    });
  });

  it("maps AbortError to ApiError with message 'Request cancelled'", async () => {
    const abortErr = new Error("aborted");
    abortErr.name = "AbortError";
    mockFetch.mockRejectedValueOnce(abortErr);

    await expect(ApiClient.get("/x")).rejects.toMatchObject({
      name: "ApiError",
      message: "Request cancelled",
      status: 0,
      statusText: "AbortError",
    });
  });

  it("setDefaultHeader and removeDefaultHeader affect request headers", async () => {
    const mockApiResponse = { success: true, data: {}, status: 200, statusText: "OK" };
    mockFetch.mockResolvedValue({ json: async () => mockApiResponse } as Response);

    // set header and verify present
    (ApiClient as any).setDefaultHeader("Authorization", "Bearer tok");
    await ApiClient.get("/whoami");
    const firstInit = (mockFetch as any).mock.calls[0][1];
    expect(firstInit.headers["Authorization"]).toBe("Bearer tok");

    // remove header and verify absent
    (ApiClient as any).removeDefaultHeader("Authorization");
    await ApiClient.get("/whoami");
    const secondInit = (mockFetch as any).mock.calls[1][1];
    expect(secondInit.headers["Authorization"]).toBeUndefined();
  });
});
