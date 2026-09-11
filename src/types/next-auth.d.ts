import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      profileId?: string;
      username?: string;
      displayName?: string;
      avatarUrl?: string;
      role?: "user" | "admin";
      cashBalance?: number;
      welcomeSeen?: boolean;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
