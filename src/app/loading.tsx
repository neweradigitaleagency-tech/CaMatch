export default function Loading() {
  return (
    <div className="min-h-screen bg-background p-4 space-y-4">
      <div className="skeleton h-8 w-48" />
      <div className="skeleton h-14 w-full rounded-2xl" />
      <div className="grid grid-cols-4 gap-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="skeleton aspect-square rounded-2xl" />
        ))}
      </div>
      <div className="skeleton h-40 w-full rounded-2xl" />
    </div>
  );
}
