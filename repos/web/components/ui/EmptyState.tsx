interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-16 py-40">
      {!compact && (
        <span className="material-symbols-outlined text-48 text-concrete select-none">
          {icon}
        </span>
      )}
      {compact && (
        <span className="material-symbols-outlined text-28 text-concrete select-none">
          {icon}
        </span>
      )}
      <div className="flex flex-col items-center gap-8">
        <p className="text-15 font-medium text-ash-graphite text-center">{title}</p>
        {description && (
          <p className="text-13 text-sage-green text-center max-w-320 mx-auto leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="rounded-full bg-plain-green text-canvas-white text-13 font-medium px-20 py-10 hover:opacity-90 transition-opacity cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
