export function CreatorProfileSkeleton() {
  return (
    <div className="w-full max-w-lg animate-pulse p-6 sm:p-8">
      <div className="mb-5 flex flex-col items-center">
        <div className="mb-4 h-[100px] w-[100px] rounded-full bg-gray-700/80"></div>
        <div className="mb-2 h-7 w-3/5 rounded-md bg-gray-700/80"></div>
        <div className="mb-3 h-5 w-2/5 rounded-md bg-gray-700/80"></div>
        <div className="h-12 w-full max-w-md rounded-md bg-gray-700/80"></div>
      </div>
      <div className="mb-8 h-40 w-full rounded-xl bg-gray-700/80"></div>
      <div className="flex flex-col gap-4">
        <div className="h-24 w-full rounded-xl bg-gray-700/80"></div>
        <div className="h-24 w-full rounded-xl bg-gray-700/80"></div>
        <div className="h-16 w-full rounded-xl bg-gray-700/80"></div>
      </div>
    </div>
  );
}
