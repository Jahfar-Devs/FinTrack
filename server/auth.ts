import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { connectDB } from "./db";

// Same contract as the Express backend: HS256, 7d expiry, payload { userId }
// where userId is the app-level UUID (never the Mongo _id).
export function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || typeof secret !== "string") {
    throw new Error("JWT_SECRET is missing or invalid");
  }
  return secret;
}

export function signToken(userId: string): string {
  return jwt.sign({ userId }, getJWTSecret(), {
    expiresIn: "7d",
    algorithm: "HS256",
  });
}

export type AuthResult =
  | { userId: string; error?: undefined }
  | { userId?: undefined; error: NextResponse };

/**
 * Mirrors the Express authMiddleware:
 * - missing/malformed Authorization header -> 401 {"message":"Unauthorized"}
 * - verify failure -> 401 {"message":"Invalid token"}
 * Also ensures the DB connection is established before handlers run.
 */
export async function requireAuth(req: Request): Promise<AuthResult> {
  try {
    await connectDB();
  } catch {
    // Mirror the Express catch-all: storage-layer failures surface as
    // 500 {"message":"Server error"} rather than a bare framework 500.
    return {
      error: NextResponse.json({ message: "Server error" }, { status: 500 }),
    };
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, getJWTSecret(), {
      algorithms: ["HS256"],
    }) as { userId: string };
    return { userId: decoded.userId };
  } catch {
    return {
      error: NextResponse.json({ message: "Invalid token" }, { status: 401 }),
    };
  }
}
