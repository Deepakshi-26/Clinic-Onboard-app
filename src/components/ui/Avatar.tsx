import { avatarColor, initials } from "@/lib/labels";

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <div
      className="flex flex-shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{
        width: size,
        height: size,
        backgroundColor: avatarColor(name),
        fontSize: size * 0.36,
      }}
    >
      {initials(name)}
    </div>
  );
}
