import Link from "next/link";
import { Frown } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="rounded-xl border border-dashed border-gray-700 bg-gray-800/30 p-8 text-center">
        <Frown className="mx-auto mb-3 h-10 w-10 text-gray-600" />
        <h1 className="mb-2 text-2xl font-bold text-white">
          Profile Not Found
        </h1>
        <p className="mb-4 text-gray-400">
          The profile you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
