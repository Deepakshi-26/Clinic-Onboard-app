import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "HR" | "EMPLOYEE" | "OWNER";
    } & DefaultSession["user"];
  }

  interface User {
    role: "HR" | "EMPLOYEE" | "OWNER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "HR" | "EMPLOYEE" | "OWNER";
  }
}
