import { Request, Response, NextFunction } from "express";
import { handleError } from "../../../src/Infrastructure/http/middleware/handleError";
import { ConflictError, NotFoundError, ValidationError as DomainValidationError, WriteError } from "../../../src/domain/errors";
import { RepositoryWriteError } from "../../../src/Infrastructure/errors";

describe("handleError", () => {
  interface RequestLogMocks {
    error: jest.Mock;
    warn: jest.Mock;
  }

  function createResponse(): Partial<Response> {
    return {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  }

  function createRequest(): { req: Request; log: RequestLogMocks } {
    const log = {
      error: jest.fn(),
      warn: jest.fn(),
    };

    const req = {
      path: "/api/seasons/test",
      method: "GET",
      log,
    } as unknown as Request;

    return { req, log };
  }

  it("maps season not found errors to 404 responses", () => {
    const { req, log } = createRequest();
    const res = createResponse();

    handleError(
      new NotFoundError("Season missing", { resource: "season", seasonId: "season-1" }),
      req as Request,
      res as Response,
      jest.fn() as NextFunction,
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        status: 404,
        statusText: "NOT_FOUND",
        message: "Season missing",
      }),
    );
    expect(log.warn).toHaveBeenCalled();
  });

  it("maps domain conflicts to 409 responses", () => {
    const { req, log } = createRequest();
    const res = createResponse();

    handleError(
      new ConflictError("Racer already registered", { seasonId: "season-1", racerId: "r1" }),
      req as Request,
      res as Response,
      jest.fn() as NextFunction,
    );

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        status: 409,
        statusText: "CONFLICT",
      }),
    );
    expect(log.warn).toHaveBeenCalled();
  });

  it("maps domain validation errors to 400 responses", () => {
    const { req, log } = createRequest();
    const res = createResponse();

    handleError(
      new DomainValidationError("Invalid bootstrap token", { reason: "tokenInvalid" }),
      req as Request,
      res as Response,
      jest.fn() as NextFunction,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        status: 400,
        statusText: "VALIDATION_ERROR",
      }),
    );
    expect(log.warn).toHaveBeenCalled();
  });

  it("maps season write errors to 500 responses and preserves the error chain", () => {
    const { req, log } = createRequest();
    const res = createResponse();
    const rootCause = new Error("sqlite locked");
    const repositoryError = new RepositoryWriteError(
      "Failed to create season",
      { operation: "create" },
      rootCause,
    );

    handleError(
      new WriteError("Failed to create season", { operation: "create" }, repositoryError),
      req as Request,
      res as Response,
      jest.fn() as NextFunction,
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        status: 500,
        statusText: "INTERNAL_SERVER_ERROR",
        message: "Failed to create season",
      }),
    );
    expect(log.error).toHaveBeenCalledWith(
      expect.objectContaining({
        err: expect.objectContaining({
          cause: expect.objectContaining({
            cause: repositoryError,
          }),
        }),
        path: "/api/seasons/test",
        method: "GET",
      }),
      "Failed to create season",
    );
  });
});