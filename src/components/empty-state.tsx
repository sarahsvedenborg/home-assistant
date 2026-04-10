type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="emptyState">
      <span className="emptyIcon" aria-hidden="true">
        ✨
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
