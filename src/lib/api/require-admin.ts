import { auth } from "@/auth";
import type { Session } from "next-auth";

export class AdminAuthError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "AdminAuthError";
    this.status = status;
  }
}

export async function requireAdmin(): Promise<Session> {
  const session = await auth();
  if (!session?.user?.profileId) {
    throw new AdminAuthError(401, "Sign in required.");
  }
  if (session.user.role !== "admin") {
    throw new AdminAuthError(403, "Admin access required.");
  }
  return session;
}
