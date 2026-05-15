interface PlaceholderProps {
  title: string;
  description: string;
}

export default function Placeholder({ title, description }: PlaceholderProps) {
  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </header>
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
        <div className="text-sm font-medium text-slate-700">
          Coming in Phase 2
        </div>
        <div className="mt-1 text-xs text-slate-500">
          List, create, edit, and delete operations land in the next milestone.
        </div>
      </div>
    </div>
  );
}
