import { Card } from "@/components/ui/Card";
import { InviteForm } from "@/components/hr/InviteForm";

export default function InvitePage() {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
        Invite a New Hire
      </h2>
      <Card>
        <InviteForm />
      </Card>
    </div>
  );
}
