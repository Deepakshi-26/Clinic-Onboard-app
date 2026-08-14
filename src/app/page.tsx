import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LandingPage } from "@/components/marketing/LandingPage";

export default async function RootPage() {
  const session = await auth();

  if (!session?.user) return <LandingPage />;
  redirect(session.user.role === "HR" ? "/hr" : "/employee");
}
