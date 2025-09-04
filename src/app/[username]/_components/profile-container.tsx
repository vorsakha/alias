import { applyThemeClasses, type ThemeConfig } from "@/app/_constants/theme";

interface PageContainerProps {
  children: React.ReactNode;
  theme: ThemeConfig;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  theme,
}) => {
  const containerClasses = applyThemeClasses(theme, "container");

  return (
    <div
      className={`relative mx-auto my-8 w-full overflow-hidden border md:min-w-[350px] ${theme.containerMaxWidth} ${containerClasses} sm:p-8`}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
};
