import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getHrEmployeeThread, getPeerThread } from "@/lib/repositories/messages";
import { locationLabel, titleLabel } from "@/lib/labels";
import { getServerLocale, getT } from "@/lib/i18n/server";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { MessageBubbleList } from "@/components/messages/MessageBubbleList";
import { HrReplyForm } from "@/components/employee/HrReplyForm";
import { PeerReplyForm } from "@/components/employee/PeerReplyForm";

export default async function EmployeeMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ peerId?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const locale = await getServerLocale();
  const t = getT(locale);

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
  });
  if (!employee) {
    return (
      <Card>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          {t("common.noRecord")}
        </p>
      </Card>
    );
  }

  const hrThread = await getHrEmployeeThread(employee.id);
  const hrBubbles = hrThread.map((m) => ({
    id: m.id,
    body: m.body,
    createdAt: m.createdAt,
    alignRight: m.senderRole === "EMPLOYEE",
    attachmentUrl: m.attachmentUrl,
    attachmentName: m.attachmentName,
  }));

  const cohort = await prisma.employee.findMany({
    where: { status: "ACTIVE", id: { not: employee.id } },
    select: { id: true, fullName: true, title: true, location: true },
    orderBy: { fullName: "asc" },
  });

  const { peerId } = await searchParams;
  const selectedPeer = peerId ? cohort.find((c) => c.id === peerId) : undefined;
  const peerThread = selectedPeer
    ? await getPeerThread(employee.id, selectedPeer.id)
    : [];
  const peerBubbles = peerThread.map((m) => ({
    id: m.id,
    body: m.body,
    createdAt: m.createdAt,
    attachmentUrl: m.attachmentUrl,
    attachmentName: m.attachmentName,
    alignRight: m.senderEmployeeId === employee.id,
  }));

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
        {t("nav.messages")}
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <Card title={`🧑‍💼 ${t("messages.staffSupport")}`}>
          <p className="mb-2.5 text-[11px] text-slate-500 dark:text-zinc-400">
            {t("messages.staffSupportNote")}
          </p>
          <MessageBubbleList messages={hrBubbles} />
          <HrReplyForm />
        </Card>

        {cohort.length > 0 && (
          <Card title={`🤝 ${t("messages.onboardingPeers")}`}>
            <p className="mb-2.5 text-[11px] text-slate-500 dark:text-zinc-400">
              {t("messages.onboardingPeersNote")}
            </p>
            <div className="flex flex-col divide-y divide-slate-100 dark:divide-zinc-800">
              {cohort.map((c) => (
                <Link
                  key={c.id}
                  href={`/employee/messages?peerId=${c.id}`}
                  className="flex items-center gap-2.5 py-2.5"
                >
                  <Avatar name={c.fullName} size={32} />
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-zinc-50">
                      {c.fullName}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                      {titleLabel(c.title, locale)} · {locationLabel(c.location, locale)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {selectedPeer && (
              <div className="mt-3.5 border-t border-slate-100 pt-3.5 dark:border-zinc-800">
                <div className="mb-2 text-xs font-semibold text-slate-900 dark:text-zinc-50">
                  💬 {selectedPeer.fullName}
                </div>
                <MessageBubbleList messages={peerBubbles} />
                <PeerReplyForm peerEmployeeId={selectedPeer.id} />
              </div>
            )}

            <div className="mt-3 rounded-lg bg-slate-100 p-2.5 text-[10px] text-slate-500 dark:bg-zinc-900 dark:text-zinc-400">
              {t("messages.visibleToHr")}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
