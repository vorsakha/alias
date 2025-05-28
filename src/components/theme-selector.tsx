"use client";

import { getThemesByCategory, type ThemeConfig } from "@/app/_constants/theme";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "./ui/badge";

interface ThemeSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function ThemeSelector({ value, onValueChange }: ThemeSelectorProps) {
  const categories = [
    "minimal",
    "vibrant",
    "professional",
    "creative",
    "retro",
    "futuristic",
  ] as const;

  return (
    <div className="space-y-4">
      <Tabs defaultValue="minimal" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category}>
            <RadioGroup
              value={value}
              onValueChange={onValueChange}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {getThemesByCategory(category).map((theme) => (
                <ThemeCard key={theme.id} theme={theme} />
              ))}
            </RadioGroup>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function ThemeCard({ theme }: { theme: ThemeConfig }) {
  return (
    <div>
      <RadioGroupItem value={theme.id} id={theme.id} className="peer sr-only" />
      <label
        htmlFor={theme.id}
        className="peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-primary/20 hover:bg-muted/50 flex cursor-pointer flex-col space-y-3 rounded-lg border p-4 transition-all peer-data-[state=checked]:ring-2"
      >
        <div
          className={`${theme.background} relative h-28 w-full overflow-hidden rounded-lg border ${theme.borderColor}`}
        >
          {theme.hasAnimatedBackground && (
            <div className="absolute inset-0">
              {theme.id === "neon-cyber" && (
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/8 via-transparent to-blue-500/8" />
                  <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />
                </div>
              )}
              {theme.id === "electric-purple" && (
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/8 via-violet-500/5 to-indigo-500/8" />
                  <div className="absolute top-1/4 left-1/4 h-8 w-8 rounded-full bg-purple-500/20 blur-lg" />
                  <div className="absolute right-1/4 bottom-1/3 h-6 w-6 rounded-full bg-violet-500/20 blur-md" />
                </div>
              )}
              {theme.id === "retro-synthwave" && (
                <div className="absolute inset-0">
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `
                      linear-gradient(rgba(236, 72, 153, 0.2) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(236, 72, 153, 0.2) 1px, transparent 1px)
                    `,
                      backgroundSize: "15px 15px",
                    }}
                  />
                  <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-pink-500/60 to-transparent" />
                </div>
              )}
              {theme.id === "holographic" && (
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-950/15 via-purple-950/15 to-blue-950/15" />
                  <div className="absolute top-1/4 left-1/3 h-10 w-10 rounded-full bg-blue-400/10 blur-lg" />
                  <div className="absolute right-1/3 bottom-1/3 h-8 w-8 rounded-full bg-cyan-400/10 blur-md" />
                </div>
              )}
              {theme.id === "quantum-matrix" && (
                <div className="absolute inset-0">
                  <div
                    className="absolute inset-0 opacity-15"
                    style={{
                      backgroundImage: `
                      linear-gradient(rgba(34, 197, 94, 0.15) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(34, 197, 94, 0.15) 1px, transparent 1px)
                    `,
                      backgroundSize: "12px 12px",
                    }}
                  />
                  <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-green-400/40 to-transparent" />
                </div>
              )}
              {theme.id === "artist-palette" && (
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-400/10 via-purple-500/10 to-indigo-600/10" />
                  <div className="absolute top-1/4 left-1/4 h-6 w-6 rounded-full bg-yellow-400/15 blur-sm" />
                  <div className="absolute right-1/4 bottom-1/4 h-4 w-4 rounded-full bg-pink-400/15 blur-sm" />
                </div>
              )}
              {theme.id === "forest-nature" && (
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-800/10 via-green-700/10 to-teal-800/10" />
                  <div className="absolute top-1/3 left-1/4 h-8 w-8 rounded-full bg-emerald-500/10 blur-md" />
                  <div className="absolute right-1/3 bottom-1/4 h-6 w-6 rounded-full bg-teal-500/10 blur-sm" />
                </div>
              )}
              {theme.id === "cosmic-dream" && (
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 via-purple-900/10 to-pink-900/10" />
                  <div className="absolute top-1/4 left-1/3 h-8 w-8 rounded-full bg-pink-500/15 blur-md" />
                  <div className="absolute right-1/4 bottom-1/3 h-6 w-6 rounded-full bg-purple-500/15 blur-sm" />
                  <div className="absolute top-2/3 left-1/4 h-4 w-4 rounded-full bg-indigo-500/15 blur-sm" />
                </div>
              )}
            </div>
          )}

          <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
            <div
              className={`mb-2 h-10 w-10 rounded-full border ${theme.cardBg} ${theme.borderColor}`}
              style={{
                background: theme.hasGlowEffects
                  ? `${theme.cardBg.replace("bg-", "")} radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)`
                  : undefined,
              }}
            />
            <div
              className={`mb-2 h-2 w-20 rounded ${
                theme.hasGradientText
                  ? "bg-gradient-to-r from-current to-current opacity-80"
                  : theme.headingColor.replace("text-", "bg-")
              }`}
            />
            <div
              className={`mb-1 h-1 w-16 rounded ${theme.textColor.replace("text-", "bg-")} opacity-70`}
            />
            <div
              className={`h-1 w-12 rounded ${theme.mutedColor.replace("text-", "bg-")} opacity-50`}
            />
          </div>

          {theme.hasGlowEffects && (
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                boxShadow:
                  theme.id === "neon-cyber"
                    ? "inset 0 0 20px rgba(34,211,238,0.15)"
                    : theme.id === "luxury-gold"
                      ? "inset 0 0 20px rgba(245,158,11,0.15)"
                      : theme.id === "retro-synthwave"
                        ? "inset 0 0 20px rgba(236,72,153,0.15)"
                        : theme.id === "holographic"
                          ? "inset 0 0 20px rgba(59,130,246,0.15)"
                          : theme.id === "cosmic-dream"
                            ? "inset 0 0 20px rgba(244,114,182,0.15)"
                            : theme.id === "quantum-matrix"
                              ? "inset 0 0 20px rgba(34,197,94,0.15)"
                              : theme.id === "electric-purple"
                                ? "inset 0 0 20px rgba(147,51,234,0.15)"
                                : "none",
              }}
            />
          )}

          {theme.hasParticles && (
            <div className="absolute inset-0">
              <div className="absolute top-2 right-2 h-1 w-1 rounded-full bg-current opacity-60" />
              <div className="absolute bottom-3 left-3 h-1 w-1 rounded-full bg-current opacity-40" />
              <div className="absolute top-1/2 left-1/2 h-1 w-1 rounded-full bg-current opacity-50" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">{theme.name}</h3>
            <Badge variant="secondary" className="text-xs capitalize">
              {theme.category}
            </Badge>
          </div>
          <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
            {theme.description}
          </p>

          <div className="flex flex-wrap gap-1">
            {theme.hasGradientText && (
              <Badge variant="outline" className="text-xs">
                Gradient
              </Badge>
            )}
            {theme.hasAnimatedBackground && (
              <Badge variant="outline" className="text-xs">
                Animated
              </Badge>
            )}
            {theme.hasGlowEffects && (
              <Badge variant="outline" className="text-xs">
                Glow
              </Badge>
            )}
            {theme.hasParticles && (
              <Badge variant="outline" className="text-xs">
                Particles
              </Badge>
            )}
          </div>
        </div>
      </label>
    </div>
  );
}
