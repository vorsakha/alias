import { PageContainer } from "./_components/profile-container";
import { CreatorProfileError } from "./_components/profile-error";
import { ThemeProvider } from "@/components/theme-provider";
import { db } from "@/server/db";
import { getThemeConfig } from "@/app/_constants/theme";

// Default theme
const defaultThemeId = "minimal-dark"; // TODO: unsafe change later

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}

async function getCreatorByUsername(username: string) {
  const creator = await db.creator.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      displayName: true,
      theme: true,
    },
  });

  return creator;
}

export default async function ProfileLayout({ children, params }: LayoutProps) {
  const { username } = await params;
  const creator = await getCreatorByUsername(username);

  if (!creator) {
    const defaultTheme = getThemeConfig(defaultThemeId);
    if (!defaultTheme) {
      throw new Error("Default theme not found");
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 p-4">
        <PageContainer theme={defaultTheme}>
          <CreatorProfileError message="Creator not found or failed to load." />
        </PageContainer>
      </div>
    );
  }

  const themeId = creator?.theme ?? defaultThemeId;
  const theme = getThemeConfig(themeId);
  const backgroundClass = theme?.background ?? "bg-neutral-950";

  if (!theme) {
    const defaultTheme = getThemeConfig(defaultThemeId);
    if (!defaultTheme) {
      throw new Error("Default theme not found");
    }

    return (
      <div
        className={`${backgroundClass} flex min-h-screen flex-col items-center justify-center p-4`}
      >
        <ThemeProvider themeId={themeId}>
          {children}
          <footer className="relative z-20 mt-4 flex items-center justify-center">
            <p className={`text-sm text-gray-400`}>
              <a
                href="https://sat.sip"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Join {creator?.displayName ?? username} on{" "}
                <span className={`font-bold text-white`}>SatSip</span> &mdash;
                Sip, Tip, Connect.
              </a>
            </p>
          </footer>
        </ThemeProvider>
      </div>
    );
  }

  return (
    <div
      className={`${backgroundClass} flex min-h-screen flex-col items-center justify-center p-4`}
    >
      <ThemeProvider themeId={themeId}>
        {children}
        <footer className="relative z-20 mt-4 flex items-center justify-center">
          <p className={`text-sm ${theme?.mutedColor ?? "text-gray-400"}`}>
            <a
              href="https://sat.sip"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Join {creator?.displayName ?? username} on{" "}
              <span
                className={`font-bold ${theme?.headingColor ?? "text-white"}`}
              >
                SatSip
              </span>{" "}
              &mdash; Sip, Tip, Connect.
            </a>
          </p>
        </footer>
      </ThemeProvider>
    </div>
  );
}
