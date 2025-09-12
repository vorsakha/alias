export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  category:
    | "minimal"
    | "vibrant"
    | "professional"
    | "creative"
    | "retro"
    | "futuristic";

  // Background & Colors
  background: string;
  containerBg: string;
  cardBg: string;
  borderColor: string;
  accentColor: string;

  // Typography
  fontFamily: string;
  headingFont: string;
  textColor: string;
  headingColor: string;
  mutedColor: string;

  // Layout & Spacing
  containerMaxWidth: string;
  containerPadding: string;
  borderRadius: string;
  spacing: string;

  // Effects & Animations
  shadow: string;
  backdropBlur: string;
  hoverEffects: string;
  animations: string;

  // Special Features
  hasGradientText: boolean;
  hasAnimatedBackground: boolean;
  hasGlowEffects: boolean;
  hasParticles: boolean;

  // Custom CSS classes for complex styling
  customClasses?: {
    container?: string;
    header?: string;
    avatar?: string;
    links?: string;
    button?: string;
    dialog?: string;
  };
}

export const themePresets: ThemeConfig[] = [
  {
    id: "minimal-dark",
    name: "Minimal Dark",
    description:
      "Sophisticated dark theme with perfect contrast and clean typography",
    category: "minimal",
    background: "bg-neutral-950",
    containerBg: "bg-neutral-900/60",
    cardBg: "bg-neutral-800/80",
    borderColor: "border-neutral-700/40",
    accentColor: "text-neutral-50",
    fontFamily: "font-sans",
    headingFont: "font-medium",
    textColor: "text-neutral-200",
    headingColor: "text-neutral-50",
    mutedColor: "text-neutral-400",
    containerMaxWidth: "max-w-md",
    containerPadding: "p-8",
    borderRadius: "rounded-2xl",
    spacing: "space-y-5",
    shadow: "shadow-2xl shadow-black/40",
    backdropBlur: "backdrop-blur-xl",
    hoverEffects:
      "hover:bg-neutral-700/60 transition-all duration-300 ease-out",
    animations: "",
    hasGradientText: false,
    hasAnimatedBackground: false,
    hasGlowEffects: false,
    hasParticles: false,
    customClasses: {
      container: "border border-neutral-800/50",
      links:
        "border-neutral-700/30 hover:border-neutral-600/50 hover:bg-neutral-700/40",
      button: "bg-neutral-50 hover:bg-neutral-200 text-neutral-900 font-medium",
      dialog: "border border-neutral-700/50 shadow-2xl shadow-black/60",
    },
  },
  {
    id: "minimal-light",
    name: "Minimal Light",
    description:
      "Elegant light theme with subtle shadows and refined typography",
    category: "minimal",
    background: "bg-neutral-50",
    containerBg: "bg-white/95",
    cardBg: "bg-white",
    borderColor: "border-neutral-200/60",
    accentColor: "text-neutral-900",
    fontFamily: "font-sans",
    headingFont: "font-medium",
    textColor: "text-neutral-700",
    headingColor: "text-neutral-900",
    mutedColor: "text-neutral-500",
    containerMaxWidth: "max-w-md",
    containerPadding: "p-8",
    borderRadius: "rounded-2xl",
    spacing: "space-y-5",
    shadow: "shadow-xl shadow-neutral-200/60",
    backdropBlur: "backdrop-blur-sm",
    hoverEffects: "hover:bg-neutral-50/80 transition-all duration-300 ease-out",
    animations: "",
    hasGradientText: false,
    hasAnimatedBackground: false,
    hasGlowEffects: false,
    hasParticles: false,
    customClasses: {
      container: "border border-neutral-200/80",
      links:
        "border-neutral-200/60 hover:border-neutral-300/80 hover:bg-neutral-50/60",
      button: "bg-neutral-900 hover:bg-neutral-800 text-white font-medium",
      dialog: "border border-neutral-200/80 shadow-xl shadow-neutral-200/60",
    },
  },
  {
    id: "minimal-warm",
    name: "Minimal Warm",
    description:
      "Warm minimal theme with cream tones and excellent readability",
    category: "minimal",
    background: "bg-stone-100",
    containerBg: "bg-stone-50/95",
    cardBg: "bg-white/90",
    borderColor: "border-stone-200/70",
    accentColor: "text-stone-900",
    fontFamily: "font-sans",
    headingFont: "font-medium",
    textColor: "text-stone-700",
    headingColor: "text-stone-900",
    mutedColor: "text-stone-500",
    containerMaxWidth: "max-w-md",
    containerPadding: "p-8",
    borderRadius: "rounded-2xl",
    spacing: "space-y-5",
    shadow: "shadow-xl shadow-stone-200/50",
    backdropBlur: "backdrop-blur-sm",
    hoverEffects: "hover:bg-stone-50/70 transition-all duration-300 ease-out",
    animations: "",
    hasGradientText: false,
    hasAnimatedBackground: false,
    hasGlowEffects: false,
    hasParticles: false,
    customClasses: {
      container: "border border-stone-200/80",
      links:
        "border-stone-200/60 hover:border-stone-300/80 hover:bg-stone-50/60",
      button: "bg-amber-600 hover:bg-amber-700 text-white font-medium",
      dialog: "border border-stone-200/80 shadow-xl shadow-stone-200/50",
    },
  },
  {
    id: "neon-cyber",
    name: "Neon Cyber",
    description:
      "High-contrast cyberpunk theme with electric blue and cyan accents",
    category: "vibrant",
    background: "bg-slate-950",
    containerBg: "bg-slate-900/70",
    cardBg: "bg-slate-800/80",
    borderColor: "border-cyan-400/30",
    accentColor: "text-cyan-300",
    fontFamily: "font-mono",
    headingFont: "font-bold",
    textColor: "text-slate-200",
    headingColor: "text-cyan-300",
    mutedColor: "text-slate-400",
    containerMaxWidth: "max-w-lg",
    containerPadding: "p-8",
    borderRadius: "rounded-xl",
    spacing: "space-y-6",
    shadow: "shadow-2xl shadow-cyan-500/25",
    backdropBlur: "backdrop-blur-lg",
    hoverEffects:
      "hover:shadow-cyan-400/40 hover:border-cyan-300/50 transition-all duration-300",
    animations: "",
    hasGradientText: true,
    hasAnimatedBackground: true,
    hasGlowEffects: true,
    hasParticles: false,
    customClasses: {
      container:
        "border-2 border-cyan-400/20 shadow-[0_0_40px_rgba(34,211,238,0.15)]",
      header:
        "text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300",
      avatar: "ring-4 ring-cyan-400/40 shadow-[0_0_25px_rgba(34,211,238,0.3)]",
      links:
        "border-cyan-400/20 hover:border-cyan-300/40 bg-gradient-to-r from-slate-800/60 to-slate-700/60 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]",
      button:
        "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-900 font-bold shadow-[0_0_25px_rgba(34,211,238,0.4)]",
      dialog:
        "border-2 border-cyan-400/30 shadow-[0_0_50px_rgba(34,211,238,0.25)] bg-gradient-to-br from-slate-800/90 to-slate-900/90",
    },
  },
  {
    id: "sunset-gradient",
    name: "Sunset Gradient",
    description:
      "Warm sunset colors with sophisticated gradients and high contrast text",
    category: "vibrant",
    background: "bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600",
    containerBg: "bg-white/15",
    cardBg: "bg-white/25",
    borderColor: "border-white/30",
    accentColor: "text-white",
    fontFamily: "font-sans",
    headingFont: "font-bold",
    textColor: "text-white/95",
    headingColor: "text-white",
    mutedColor: "text-white/75",
    containerMaxWidth: "max-w-lg",
    containerPadding: "p-8",
    borderRadius: "rounded-3xl",
    spacing: "space-y-6",
    shadow: "shadow-2xl shadow-black/30",
    backdropBlur: "backdrop-blur-xl",
    hoverEffects:
      "hover:bg-white/30 hover:scale-[1.02] transition-all duration-300",
    animations: "",
    hasGradientText: true,
    hasAnimatedBackground: false,
    hasGlowEffects: false,
    hasParticles: false,
    customClasses: {
      container: "border border-white/20",
      header:
        "text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-white to-pink-200",
      links:
        "bg-white/15 hover:bg-white/25 border-white/25 hover:border-white/40",
      button:
        "bg-white/25 hover:bg-white/35 text-white border-white/30 font-bold backdrop-blur-sm",
      dialog:
        "border border-white/30 shadow-2xl shadow-black/40 bg-white/20 backdrop-blur-xl",
    },
  },
  {
    id: "electric-purple",
    name: "Electric Purple",
    description:
      "Bold electric purple theme with high energy and excellent contrast",
    category: "vibrant",
    background:
      "bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-900",
    containerBg: "bg-black/40",
    cardBg: "bg-purple-900/50",
    borderColor: "border-purple-400/40",
    accentColor: "text-purple-300",
    fontFamily: "font-sans",
    headingFont: "font-bold",
    textColor: "text-purple-100",
    headingColor: "text-purple-200",
    mutedColor: "text-purple-300/70",
    containerMaxWidth: "max-w-lg",
    containerPadding: "p-8",
    borderRadius: "rounded-2xl",
    spacing: "space-y-6",
    shadow: "shadow-2xl shadow-purple-500/30",
    backdropBlur: "backdrop-blur-lg",
    hoverEffects:
      "hover:shadow-purple-400/50 hover:border-purple-300/60 transition-all duration-300",
    animations: "",
    hasGradientText: true,
    hasAnimatedBackground: true,
    hasGlowEffects: true,
    hasParticles: false,
    customClasses: {
      container:
        "border-2 border-purple-400/30 shadow-[0_0_40px_rgba(147,51,234,0.2)]",
      header:
        "text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300",
      avatar:
        "ring-4 ring-purple-400/50 shadow-[0_0_30px_rgba(147,51,234,0.4)]",
      links:
        "border-purple-400/30 hover:border-purple-300/50 bg-gradient-to-r from-purple-900/40 to-violet-900/40",
      button:
        "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold",
    },
  },
  {
    id: "corporate-blue",
    name: "Corporate Blue",
    description:
      "Sophisticated business theme with refined blue accents and excellent hierarchy",
    category: "professional",
    background: "bg-slate-50",
    containerBg: "bg-white/95",
    cardBg: "bg-white",
    borderColor: "border-slate-200/80",
    accentColor: "text-blue-700",
    fontFamily: "font-sans",
    headingFont: "font-semibold",
    textColor: "text-slate-700",
    headingColor: "text-slate-900",
    mutedColor: "text-slate-500",
    containerMaxWidth: "max-w-lg",
    containerPadding: "p-8",
    borderRadius: "rounded-xl",
    spacing: "space-y-5",
    shadow: "shadow-xl shadow-slate-200/60",
    backdropBlur: "backdrop-blur-sm",
    hoverEffects:
      "hover:shadow-xl hover:shadow-blue-100/60 hover:border-blue-200/80 transition-all duration-300",
    animations: "",
    hasGradientText: false,
    hasAnimatedBackground: false,
    hasGlowEffects: false,
    hasParticles: false,
    customClasses: {
      container: "border border-slate-200/80",
      links: "border-slate-200/60 hover:border-blue-200/80 hover:bg-blue-50/60",
      button: "bg-blue-600 hover:bg-blue-700 text-white font-semibold",
      dialog: "border border-slate-200/80 shadow-xl shadow-slate-200/60",
    },
  },
  {
    id: "luxury-gold",
    name: "Luxury Gold",
    description:
      "Premium luxury theme with sophisticated gold accents and elegant typography",
    category: "professional",
    background: "bg-gradient-to-b from-slate-900 via-slate-900 to-black",
    containerBg: "bg-slate-800/60",
    cardBg: "bg-slate-800/80",
    borderColor: "border-amber-500/25",
    accentColor: "text-amber-400",
    fontFamily: "font-serif",
    headingFont: "font-semibold",
    textColor: "text-slate-200",
    headingColor: "text-amber-300",
    mutedColor: "text-slate-400",
    containerMaxWidth: "max-w-lg",
    containerPadding: "p-8",
    borderRadius: "rounded-2xl",
    spacing: "space-y-6",
    shadow: "shadow-2xl shadow-amber-500/15",
    backdropBlur: "backdrop-blur-lg",
    hoverEffects:
      "hover:border-amber-400/40 hover:shadow-amber-500/25 transition-all duration-300",
    animations: "",
    hasGradientText: true,
    hasAnimatedBackground: false,
    hasGlowEffects: true,
    hasParticles: false,
    customClasses: {
      container: "border border-amber-500/20",
      header:
        "text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-300",
      avatar: "ring-3 ring-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.3)]",
      links:
        "border-amber-500/20 hover:border-amber-400/40 bg-gradient-to-r from-slate-800/60 to-slate-700/60",
      button:
        "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-900 font-semibold",
    },
  },
  {
    id: "executive-navy",
    name: "Executive Navy",
    description:
      "Distinguished navy theme with silver accents for executive presence",
    category: "professional",
    background: "bg-slate-900",
    containerBg: "bg-slate-800/70",
    cardBg: "bg-slate-700/80",
    borderColor: "border-slate-500/30",
    accentColor: "text-slate-200",
    fontFamily: "font-sans",
    headingFont: "font-semibold",
    textColor: "text-slate-300",
    headingColor: "text-slate-100",
    mutedColor: "text-slate-400",
    containerMaxWidth: "max-w-lg",
    containerPadding: "p-8",
    borderRadius: "rounded-xl",
    spacing: "space-y-5",
    shadow: "shadow-2xl shadow-black/40",
    backdropBlur: "backdrop-blur-lg",
    hoverEffects:
      "hover:bg-slate-600/60 hover:border-slate-400/40 transition-all duration-300",
    animations: "",
    hasGradientText: false,
    hasAnimatedBackground: false,
    hasGlowEffects: false,
    hasParticles: false,
    customClasses: {
      container: "border border-slate-600/40",
      links:
        "border-slate-600/30 hover:border-slate-500/50 hover:bg-slate-600/40",
      button: "bg-slate-200 hover:bg-white text-slate-900 font-semibold",
    },
  },
  {
    id: "artist-palette",
    name: "Artist Palette",
    description:
      "Vibrant creative theme with artistic flair and dynamic color combinations",
    category: "creative",
    background: "bg-gradient-to-br from-rose-400 via-purple-500 to-indigo-600",
    containerBg: "bg-white/20",
    cardBg: "bg-white/30",
    borderColor: "border-white/40",
    accentColor: "text-white",
    fontFamily: "font-sans",
    headingFont: "font-bold",
    textColor: "text-white/95",
    headingColor: "text-white",
    mutedColor: "text-white/80",
    containerMaxWidth: "max-w-xl",
    containerPadding: "p-8",
    borderRadius: "rounded-[2rem]",
    spacing: "space-y-6",
    shadow: "shadow-2xl shadow-purple-500/30",
    backdropBlur: "backdrop-blur-xl",
    hoverEffects:
      "hover:bg-white/35 hover:scale-[1.02] transition-all duration-300",
    animations: "",
    hasGradientText: true,
    hasAnimatedBackground: true,
    hasGlowEffects: false,
    hasParticles: true,
    customClasses: {
      container: "border border-white/30",
      header:
        "text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-200 to-white",
      links:
        "bg-white/25 hover:bg-white/35 border-white/30 hover:border-white/50 transform hover:rotate-1",
      button:
        "bg-white/30 hover:bg-white/40 text-white border-white/40 font-bold backdrop-blur-sm",
    },
  },
  {
    id: "forest-nature",
    name: "Forest Nature",
    description:
      "Organic nature-inspired theme with earthy greens and natural textures",
    category: "creative",
    background: "bg-gradient-to-br from-emerald-800 via-green-700 to-teal-800",
    containerBg: "bg-emerald-900/40",
    cardBg: "bg-emerald-800/60",
    borderColor: "border-emerald-400/30",
    accentColor: "text-emerald-300",
    fontFamily: "font-sans",
    headingFont: "font-semibold",
    textColor: "text-emerald-100",
    headingColor: "text-emerald-200",
    mutedColor: "text-emerald-300/70",
    containerMaxWidth: "max-w-lg",
    containerPadding: "p-8",
    borderRadius: "rounded-3xl",
    spacing: "space-y-6",
    shadow: "shadow-2xl shadow-emerald-900/40",
    backdropBlur: "backdrop-blur-lg",
    hoverEffects:
      "hover:bg-emerald-700/50 hover:border-emerald-300/50 transition-all duration-300",
    animations: "",
    hasGradientText: true,
    hasAnimatedBackground: true,
    hasGlowEffects: false,
    hasParticles: false,
    customClasses: {
      container: "border border-emerald-500/25",
      header:
        "text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-200 to-emerald-200",
      avatar: "ring-3 ring-emerald-400/40",
      links:
        "border-emerald-400/25 hover:border-emerald-300/40 bg-gradient-to-r from-emerald-800/50 to-teal-800/50",
      button:
        "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold",
    },
  },
  {
    id: "cosmic-dream",
    name: "Cosmic Dream",
    description:
      "Dreamy cosmic theme with stellar purples and mystical atmosphere",
    category: "creative",
    background: "bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900",
    containerBg: "bg-indigo-950/60",
    cardBg: "bg-purple-900/50",
    borderColor: "border-pink-400/30",
    accentColor: "text-pink-300",
    fontFamily: "font-sans",
    headingFont: "font-medium",
    textColor: "text-purple-100",
    headingColor: "text-pink-200",
    mutedColor: "text-purple-300/70",
    containerMaxWidth: "max-w-lg",
    containerPadding: "p-8",
    borderRadius: "rounded-3xl",
    spacing: "space-y-6",
    shadow: "shadow-2xl shadow-pink-500/25",
    backdropBlur: "backdrop-blur-xl",
    hoverEffects:
      "hover:shadow-pink-400/40 hover:border-pink-300/50 transition-all duration-500",
    animations: "",
    hasGradientText: true,
    hasAnimatedBackground: true,
    hasGlowEffects: true,
    hasParticles: true,
    customClasses: {
      container:
        "border border-pink-400/20 shadow-[0_0_40px_rgba(244,114,182,0.15)]",
      header:
        "text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300",
      avatar: "ring-4 ring-pink-400/40 shadow-[0_0_25px_rgba(244,114,182,0.3)]",
      links:
        "border-pink-400/25 hover:border-pink-300/40 bg-gradient-to-r from-purple-900/40 to-indigo-900/40",
      button:
        "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white font-medium",
    },
  },
  {
    id: "retro-synthwave",
    name: "Retro Synthwave",
    description:
      "Authentic 80s synthwave with neon grids and retro-futuristic aesthetics",
    category: "retro",
    background: "bg-gradient-to-b from-purple-900 via-indigo-900 to-black",
    containerBg: "bg-black/70",
    cardBg: "bg-purple-900/50",
    borderColor: "border-pink-500/40",
    accentColor: "text-pink-400",
    fontFamily: "font-mono",
    headingFont: "font-bold",
    textColor: "text-cyan-200",
    headingColor: "text-pink-300",
    mutedColor: "text-purple-300/80",
    containerMaxWidth: "max-w-lg",
    containerPadding: "p-8",
    borderRadius: "rounded-lg",
    spacing: "space-y-6",
    shadow: "shadow-2xl shadow-pink-500/25",
    backdropBlur: "backdrop-blur-md",
    hoverEffects:
      "hover:shadow-pink-400/50 hover:border-pink-400/60 transition-all duration-300",
    animations: "",
    hasGradientText: true,
    hasAnimatedBackground: true,
    hasGlowEffects: true,
    hasParticles: false,
    customClasses: {
      container:
        "border-2 border-pink-500/30 shadow-[0_0_40px_rgba(236,72,153,0.2)]",
      header:
        "text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-cyan-400 to-pink-400",
      avatar: "ring-4 ring-pink-500/50 shadow-[0_0_25px_rgba(236,72,153,0.4)]",
      links:
        "border-pink-500/30 hover:border-pink-400/50 bg-gradient-to-r from-purple-900/60 to-indigo-900/60",
      button:
        "bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-400 hover:to-cyan-400 text-black font-bold",
    },
  },
  {
    id: "vintage-sepia",
    name: "Vintage Sepia",
    description: "Warm vintage theme with sepia tones and classic typography",
    category: "retro",
    background: "bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100",
    containerBg: "bg-amber-50/80",
    cardBg: "bg-white/90",
    borderColor: "border-amber-200/60",
    accentColor: "text-amber-800",
    fontFamily: "font-serif",
    headingFont: "font-semibold",
    textColor: "text-amber-900",
    headingColor: "text-amber-900",
    mutedColor: "text-amber-700/70",
    containerMaxWidth: "max-w-lg",
    containerPadding: "p-8",
    borderRadius: "rounded-xl",
    spacing: "space-y-5",
    shadow: "shadow-xl shadow-amber-200/50",
    backdropBlur: "backdrop-blur-sm",
    hoverEffects:
      "hover:bg-amber-50/60 hover:border-amber-300/80 transition-all duration-300",
    animations: "",
    hasGradientText: false,
    hasAnimatedBackground: false,
    hasGlowEffects: false,
    hasParticles: false,
    customClasses: {
      container: "border border-amber-200/80",
      links:
        "border-amber-200/60 hover:border-amber-300/80 hover:bg-amber-50/60",
      button: "bg-amber-700 hover:bg-amber-800 text-amber-50 font-semibold",
    },
  },
  {
    id: "holographic",
    name: "Holographic",
    description:
      "Advanced holographic interface with iridescent effects and futuristic design",
    category: "futuristic",
    background: "bg-black",
    containerBg: "bg-slate-900/80",
    cardBg: "bg-slate-800/90",
    borderColor: "border-blue-400/40",
    accentColor: "text-blue-300",
    fontFamily: "font-mono",
    headingFont: "font-bold",
    textColor: "text-blue-100",
    headingColor: "text-blue-200",
    mutedColor: "text-slate-400",
    containerMaxWidth: "max-w-lg",
    containerPadding: "p-8",
    borderRadius: "rounded-3xl",
    spacing: "space-y-6",
    shadow: "shadow-2xl shadow-blue-500/30",
    backdropBlur: "backdrop-blur-xl",
    hoverEffects:
      "hover:shadow-blue-400/50 hover:border-blue-300/60 transition-all duration-500",
    animations: "",
    hasGradientText: true,
    hasAnimatedBackground: true,
    hasGlowEffects: true,
    hasParticles: true,
    customClasses: {
      container:
        "border border-blue-400/30 shadow-[0_0_60px_rgba(59,130,246,0.2)] bg-gradient-to-br from-blue-950/20 to-purple-950/20",
      header:
        "text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-300",
      avatar: "ring-4 ring-blue-400/50 shadow-[0_0_35px_rgba(59,130,246,0.4)]",
      links:
        "border-blue-400/30 hover:border-blue-300/50 bg-gradient-to-r from-blue-950/30 to-purple-950/30 hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]",
      button:
        "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-black font-bold shadow-[0_0_30px_rgba(59,130,246,0.4)]",
    },
  },
  {
    id: "quantum-matrix",
    name: "Quantum Matrix",
    description:
      "Matrix-inspired theme with green code aesthetics and digital atmosphere",
    category: "futuristic",
    background: "bg-black",
    containerBg: "bg-green-950/60",
    cardBg: "bg-green-900/70",
    borderColor: "border-green-400/30",
    accentColor: "text-green-300",
    fontFamily: "font-mono",
    headingFont: "font-bold",
    textColor: "text-green-200",
    headingColor: "text-green-300",
    mutedColor: "text-green-400/70",
    containerMaxWidth: "max-w-lg",
    containerPadding: "p-8",
    borderRadius: "rounded-lg",
    spacing: "space-y-6",
    shadow: "shadow-2xl shadow-green-500/25",
    backdropBlur: "backdrop-blur-lg",
    hoverEffects:
      "hover:shadow-green-400/40 hover:border-green-300/50 transition-all duration-300",
    animations: "",
    hasGradientText: true,
    hasAnimatedBackground: true,
    hasGlowEffects: true,
    hasParticles: false,
    customClasses: {
      container:
        "border border-green-400/25 shadow-[0_0_40px_rgba(34,197,94,0.15)]",
      header:
        "text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-300 to-green-300",
      avatar: "ring-4 ring-green-400/40 shadow-[0_0_25px_rgba(34,197,94,0.3)]",
      links:
        "border-green-400/25 hover:border-green-300/40 bg-gradient-to-r from-green-950/50 to-emerald-950/50",
      button:
        "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black font-bold",
    },
  },
];

export const themeOptions = themePresets.map((theme) => ({
  value: theme.id,
  label: theme.name,
  description: theme.description,
  preview: theme.background,
}));

export function getThemeConfig(themeId: string): ThemeConfig | undefined {
  return themePresets.find((theme) => theme.id === themeId);
}

export function getThemesByCategory(
  category: ThemeConfig["category"],
): ThemeConfig[] {
  return themePresets.filter((theme) => theme.category === category);
}

export function applyThemeClasses(
  theme: ThemeConfig,
  element: "container" | "header" | "avatar" | "links" | "button" | "dialog",
): string {
  const customClass = theme.customClasses?.[element];

  switch (element) {
    case "container":
      return `${theme.containerBg} ${theme.borderColor} ${theme.shadow} ${theme.backdropBlur} ${theme.borderRadius} ${theme.containerPadding} ${customClass ?? ""}`.trim();
    case "header":
      return `${theme.headingColor} ${theme.headingFont} ${customClass ?? ""}`.trim();
    case "avatar":
      return `${customClass ?? ""}`.trim();
    case "links":
      return `${theme.cardBg} ${theme.borderColor} ${theme.hoverEffects} ${theme.borderRadius} ${customClass ?? ""}`.trim();
    case "button":
      return `${theme.accentColor} ${theme.hoverEffects} ${customClass ?? ""}`.trim();
    case "dialog":
      return `${theme.cardBg} ${theme.borderColor} ${theme.shadow} ${theme.backdropBlur} ${theme.borderRadius} ${customClass ?? ""}`.trim();
    default:
      return "";
  }
}
