// components/dashboard/SuggestionCard.tsx
import Link from "next/link";

export default function SuggestionCard({
  href = "/directory",
  name,
  avatar,
  meta,
}: {
  href?: string;
  name: string;
  avatar?: string | null;
  meta?: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border hover:border-primary/30 transition-colors p-3 flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatar}
          alt={name}
          className="h-10 w-10 rounded-full object-cover border"
        />
      ) : (
        <div className="h-10 w-10 rounded-full grid place-items-center border bg-muted text-xs font-semibold">
          {name.slice(0, 1).toUpperCase()}
        </div>
      )}
      <div className="min-w-0">
        <div className="font-medium truncate">{name}</div>
        {meta ? (
          <div className="text-xs text-muted-foreground truncate">{meta}</div>
        ) : null}
      </div>
    </Link>
  );
}
