/**
 * validate — Zod request validation middleware.
 *
 * Usage:
 *   import { validate } from "../middleware/validate.middleware.js";
 *   import { loginSchema } from "../validators/auth.schema.js";
 *   router.post("/login", validate(loginSchema), ctrl.login);
 *
 * Validates req.body (and optionally req.params / req.query) against
 * a Zod schema. On failure returns 422 with structured error list.
 */
import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validate =
    (schema: ZodSchema) =>
    (req: Request, res: Response, next: NextFunction): void => {
        try {
            // Build a combined object from body / params / query
            const result = schema.safeParse({
                body: req.body,
                params: req.params,
                query: req.query,
            });

            if (!result.success) {
                const issues = (result.error as ZodError).issues.map((i) => ({
                    field: i.path.join("."),
                    message: i.message,
                }));

                res.status(422).json({
                    success: false,
                    code: "VALIDATION_ERROR",
                    message: "Input validation failed",
                    errors: issues,
                    requestId: req.requestId,
                });
                return;
            }

            // Attach parsed+coerced data back to the request
            req.body = (result.data as any).body ?? req.body;
            next();
        } catch (err) {
            next(err);
        }
    };
