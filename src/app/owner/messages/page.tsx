import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOwnerThread, markOwnerThreadRead } from "@/lib/repositories/ownerMessages";
import { getServerLocale, getT } from "@/lib/i18n/server";
import { Card } from "@/components/ui/Card";
import { MessageBubbleList } from "@/components/messages/MessageBubbleList";
import { OwnerReplyForm } from "@/components/owner/OwnerReplyForm";

export default async function OwnerMessagesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const t = getT(await getServerLocale());

  await markOwnerThreadRead(session.user.id, "OWNER");
  const thread = await getOwnerThread(session.user.id);
  const bubbles = thread.map((m) => ({
    id: m.id,
    body: m.body,
    createdAt: m.createdAt,
    alignRight: m.senderRole === "OWNER",
    attachmentUrl: m.attachmentUrl,
    attachmentName: m.attachmentName,
    read: m.readAt !== null,
  }));

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
        {t("nav.messages")}
      </h2>

      <Card title={`🧑‍💼 ${t("owner.messagesHeading")}`}>
        <p className="mb-2.5 text-[11px] text-slate-500 dark:text-zinc-400">
          {t("owner.messagesNote")}
        </p>
        <MessageBubbleList messages={bubbles} />
        <OwnerReplyForm />
      </Card>
    </div>
  );
}
