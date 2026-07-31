import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "HR" | "EMPLOYEE";
    } & DefaultSession["user"];
  }

  interface User {
    role: "HR" | "EMPLOYEE";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "HR" | "EMPLOYEE";
  }
}
