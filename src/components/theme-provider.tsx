"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getThemeConfig, type ThemeConfig } from "@/app/_constants/theme";

interface ThemeContextType {
  theme: ThemeConfig | null;
  setTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: null,
  setTheme: () => {
    // Default empty implementation
  },
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  themeId?: string;
  className?: string;
  applyBackground?: boolean;
}

export function ThemeProvider({
  children,
  themeId,
  className = "",
  applyBackground = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeConfig | null>(null);

  useEffect(() => {
    if (themeId) {
      const themeConfig = getThemeConfig(themeId);
      setThemeState(themeConfig ?? null);
    }
  }, [themeId]);

  const setTheme = (newThemeId: string) => {
    const themeConfig = getThemeConfig(newThemeId);
    setThemeState(themeConfig ?? null);
  };

  if (!theme) {
    return <div className={className}>{children}</div>;
  }

  const backgroundClass = applyBackground ? theme.background : "";

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div
        className={`${backgroundClass} ${theme.fontFamily} ${theme.textColor} ${theme.animations} ${className} relative`}
        style={{
          fontFamily: theme.fontFamily.includes("mono")
            ? 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
            : theme.fontFamily.includes("serif")
              ? 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif'
              : 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
        }}
      >
        {theme.hasAnimatedBackground && <AnimatedBackground theme={theme} />}

        {theme.hasParticles && <ParticleEffect theme={theme} />}

        <div className="relative z-10">{children}</div>
      </div>
    </ThemeContext.Provider>
  );
}

function AnimatedBackground({ theme }: { theme: ThemeConfig }) {
  if (theme.id === "neon-cyber") {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/3 via-transparent to-blue-500/3" />
        <div className="absolute top-0 left-0 h-px w-full animate-pulse bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
        <div
          className="absolute bottom-0 left-0 h-px w-full animate-pulse bg-gradient-to-r from-transparent via-blue-400/60 to-transparent"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-0 left-0 h-full w-px animate-pulse bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent"
          style={{ animationDelay: "0.5s" }}
        />
        <div
          className="absolute top-0 right-0 h-full w-px animate-pulse bg-gradient-to-b from-transparent via-blue-400/40 to-transparent"
          style={{ animationDelay: "1.5s" }}
        />
      </div>
    );
  }

  if (theme.id === "electric-purple") {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-violet-500/3 to-indigo-500/5" />
        <div className="absolute top-1/4 left-1/4 h-32 w-32 animate-pulse rounded-full bg-purple-500/10 blur-3xl" />
        <div
          className="absolute right-1/4 bottom-1/3 h-24 w-24 animate-pulse rounded-full bg-violet-500/10 blur-2xl"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-2/3 left-2/3 h-20 w-20 animate-pulse rounded-full bg-indigo-500/10 blur-xl"
          style={{ animationDelay: "1s" }}
        />
      </div>
    );
  }

  if (theme.id === "retro-synthwave") {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/8 via-indigo-900/8 to-black/8" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
            linear-gradient(rgba(236, 72, 153, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(236, 72, 153, 0.15) 1px, transparent 1px)
          `,
            backgroundSize: "60px 60px",
            animation: "grid-move 25s linear infinite",
          }}
        />
        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />
      </div>
    );
  }

  if (theme.id === "holographic") {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/8 via-purple-950/8 to-blue-950/8" />
        <div className="absolute inset-0 animate-pulse bg-gradient-to-tr from-transparent via-blue-500/3 to-transparent" />
        <div className="absolute top-0 left-0 h-full w-full">
          <div className="absolute top-1/4 left-1/3 h-40 w-40 animate-pulse rounded-full bg-blue-400/5 blur-3xl" />
          <div
            className="absolute right-1/3 bottom-1/3 h-32 w-32 animate-pulse rounded-full bg-cyan-400/5 blur-2xl"
            style={{ animationDelay: "3s" }}
          />
        </div>
      </div>
    );
  }

  if (theme.id === "quantum-matrix") {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-950/8 to-black/8" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
            linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
          `,
            backgroundSize: "40px 40px",
            animation: "matrix-rain 20s linear infinite",
          }}
        />
        <div className="absolute top-0 left-0 h-px w-full animate-pulse bg-gradient-to-r from-transparent via-green-400/60 to-transparent" />
      </div>
    );
  }

  if (theme.id === "artist-palette") {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-400/8 via-purple-500/8 to-indigo-600/8" />
        <div className="absolute top-1/4 left-1/4 h-32 w-32 animate-bounce rounded-full bg-yellow-400/8 blur-3xl" />
        <div
          className="absolute right-1/4 bottom-1/4 h-24 w-24 animate-bounce rounded-full bg-pink-400/8 blur-2xl"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-2/3 left-2/3 h-20 w-20 animate-bounce rounded-full bg-blue-400/8 blur-xl"
          style={{ animationDelay: "2s" }}
        />
      </div>
    );
  }

  if (theme.id === "forest-nature") {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-800/8 via-green-700/8 to-teal-800/8" />
        <div className="absolute top-1/3 left-1/4 h-36 w-36 animate-pulse rounded-full bg-emerald-500/5 blur-3xl" />
        <div
          className="absolute right-1/3 bottom-1/4 h-28 w-28 animate-pulse rounded-full bg-teal-500/5 blur-2xl"
          style={{ animationDelay: "2s" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-emerald-500/2 to-transparent" />
      </div>
    );
  }

  if (theme.id === "cosmic-dream") {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/8 via-purple-900/8 to-pink-900/8" />
        <div className="absolute top-1/4 left-1/3 h-40 w-40 animate-pulse rounded-full bg-pink-500/8 blur-3xl" />
        <div
          className="absolute right-1/4 bottom-1/3 h-32 w-32 animate-pulse rounded-full bg-purple-500/8 blur-2xl"
          style={{ animationDelay: "1.5s" }}
        />
        <div
          className="absolute top-2/3 left-1/4 h-24 w-24 animate-pulse rounded-full bg-indigo-500/8 blur-xl"
          style={{ animationDelay: "3s" }}
        />
        <div
          className="absolute inset-0 animate-pulse bg-gradient-to-tr from-transparent via-pink-500/3 to-transparent"
          style={{ animationDelay: "0.5s" }}
        />
      </div>
    );
  }

  return null;
}

function ParticleEffect({ theme }: { theme: ThemeConfig }) {
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      size: number;
      opacity: number;
      speed: number;
    }>
  >([]);

  useEffect(() => {
    if (!theme.hasParticles) return;

    const generateParticles = () => {
      const particleCount =
        theme.id === "holographic" ? 25 : theme.id === "cosmic-dream" ? 20 : 15;
      const newParticles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * (theme.id === "holographic" ? 3 : 4) + 1,
        opacity: Math.random() * 0.4 + 0.1,
        speed: Math.random() * 10 + 5,
      }));
      setParticles(newParticles);
    };

    generateParticles();
    const interval = setInterval(
      generateParticles,
      theme.id === "holographic" ? 8000 : 12000,
    );

    return () => clearInterval(interval);
  }, [theme.hasParticles, theme.id]);

  if (!theme.hasParticles) return null;

  const getParticleColor = () => {
    switch (theme.id) {
      case "holographic":
        return "bg-blue-400";
      case "artist-palette":
        return "bg-white";
      case "cosmic-dream":
        return "bg-pink-400";
      default:
        return "bg-white";
    }
  };

  const getParticleGlow = () => {
    switch (theme.id) {
      case "holographic":
        return "shadow-[0_0_10px_rgba(59,130,246,0.6)]";
      case "cosmic-dream":
        return "shadow-[0_0_8px_rgba(244,114,182,0.5)]";
      default:
        return "";
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute rounded-full ${getParticleColor()} ${getParticleGlow()}`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            animation: `float ${particle.speed}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
}
