import jwt from "jsonwebtoken";
import type { AuthUser } from "@ai-hiring/shared-types";
import { env } from "../env";

// Access token: short-lived, carries the user payload, sent on every request.
export function signAccessToken(user: AuthUser) {
  return jwt.sign(user, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES,
  });
}

// Refresh token: long-lived, carries ONLY the id, used solely to mint a new
// access token. Keeping it minimal limits what leaks if it's ever stolen.
export function signRefreshToken(userId: string) {
  return jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES,
  });
}

export function verifyAccessToken(token: string): AuthUser {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthUser;
}

export function verifyRefreshToken(token: string): { id: string } {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as { id: string };
}
