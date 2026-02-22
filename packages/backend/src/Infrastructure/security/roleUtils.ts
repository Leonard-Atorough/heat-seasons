/**
 * Utility functions for safely accessing user role
 * Use these for type-safe role extraction and checking
 */

import { Request } from "express";
import { TokenPayload } from "src/Infrastructure/security/jwt";
import { UserRole, USER_ROLES } from "shared";

/**
 * Safely extract user role from request
 * Returns null if user not authenticated
 */
export function getUserRole(req: Request): UserRole | null {
  const payload = req.user as TokenPayload | undefined;
  return (payload?.role as UserRole | undefined) || null;
}

/**
 * Check if user has a specific role
 */
export function hasRole(req: Request, role: UserRole): boolean {
  return getUserRole(req) === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(req: Request, ...roles: UserRole[]): boolean {
  const userRole = getUserRole(req);
  return userRole ? roles.includes(userRole) : false;
}

/**
 * Check if user is admin
 * Shorthand for hasRole(req, "admin")
 */
export function isAdmin(req: Request): boolean {
  return hasRole(req, USER_ROLES.ADMIN);
}

/**
 * Assert user has role, throw if not
 * Useful in service layer when you expect role to exist
 */
export function assertRole(req: Request, role: UserRole): void {
  const userRole = getUserRole(req);
  if (!userRole || userRole !== role) {
    throw new Error(`Access denied: ${role} role required`);
  }
}

/**
 * Guard function: throws if user is not authenticated or lacks role
 */
export function requireUserRole(req: Request, role: UserRole): void {
  const payload = req.user as TokenPayload | undefined;

  if (!payload) {
    throw new Error("User not authenticated");
  }

  if (payload.role !== role) {
    throw new Error(`Access denied: ${role} role required`);
  }
}
