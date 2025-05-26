export const PageContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="relative mx-auto my-8 w-full max-w-580 overflow-hidden rounded-3xl border border-gray-700/50 bg-gradient-to-br from-gray-800/40 via-gray-800/40 to-gray-900/40 p-6 shadow-2xl shadow-black/30 backdrop-blur-lg sm:max-w-lg sm:p-8">
    <div className="relative z-10">{children}</div>
  </div>
);
