import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";
import { ValidationError } from "../errors/appError.js";

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

/**
 * Creates Express middleware to validate request body against a zod schema
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 *
 * Usage:
 *   router.post("/path", validateRequestBody(mySchema), controller.handler);
 */
export function validateRequestBody(schema: ZodType<any, any, any>) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        next(
          new ValidationError(
            "Request validation failed",
            { invalidFields: validationErrors },
            validationErrors,
          ),
        );
      } else {
        next(error);
      }
    }
  };
}

/**
 * Creates Express middleware to validate route parameters against a zod schema
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 *
 * Usage:
 *   router.get("/:id", validateParams(z.object({ id: z.string() })), controller.handler);
 */
export function validateParams(schema: ZodType<any, any, any>) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = schema.parse(req.params);
      Object.assign(req.params, validated);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.issues.map((err) => ({
          field: `param: ${err.path.join(".")}`,
          message: err.message,
        }));
        next(
          new ValidationError(
            "Route parameter validation failed",
            { invalidFields: validationErrors },
            validationErrors,
          ),
        );
      } else {
        next(error);
      }
    }
  };
}

/**
 * Creates Express middleware to validate query parameters against a zod schema
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 *
 * Usage:
 *   router.get("/path", validateQuery(z.object({ page: z.string() })), controller.handler);
 */
export function validateQuery(schema: ZodType<any, any, any>) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = schema.parse(req.query);
      Object.assign(req.query, validated);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.issues.map((err) => ({
          field: `query: ${err.path.join(".")}`,
          message: err.message,
        }));
        next(
          new ValidationError(
            "Query parameter validation failed",
            { invalidFields: validationErrors },
            validationErrors,
          ),
        );
      } else {
        next(error);
      }
    }
  };
}
