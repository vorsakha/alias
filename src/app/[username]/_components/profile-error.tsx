interface CreatorProfileErrorProps {
  message?: string;
}

export function CreatorProfileError({
  message = "Could not load profile.",
}: CreatorProfileErrorProps) {
  return (
    <div className="w-full max-w-lg p-8 text-center text-red-400">
      <p>{message}</p>
      <p>Please try again later.</p>
    </div>
  );
}
