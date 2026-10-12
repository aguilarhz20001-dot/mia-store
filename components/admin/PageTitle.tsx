import type { ReactNode } from "react";

export default function PageTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-script text-4xl text-brand-ink sm:text-5xl">{title}</h1>
        {description && <p className="mt-1 text-brand-ink/65">{description}</p>}
      </div>
      {action}
    </div>
  );
}
