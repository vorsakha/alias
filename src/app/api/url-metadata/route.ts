import { NextResponse } from "next/server";
import { z } from "zod";
import puppeteer, { type Page } from "puppeteer";

const requestSchema = z.object({
  url: z.string().url(),
});

export interface Metadata {
  title: string;
  description?: string;
  imageUrl?: string;
  siteName?: string;
  type: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
  favicon?: string;
  canonical?: string;
  locale?: string;
  themeColor?: string;
  duration?: string;
  videoUrl?: string;
  audioUrl?: string;
  album?: string;
  artist?: string;
  genre?: string;
  releaseDate?: string;
  width?: number;
  height?: number;
}

const LOGIN_INDICATORS = [
  "log in",
  "sign in",
  "login",
  "signin",
  "authentication required",
  "please log in",
  "access denied",
  "unauthorized",
  "forbidden",
];

const SOCIAL_MEDIA_PATTERNS = {
  twitter: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/([^\/\?]+)(?:\?.*)?$/i,
  instagram: /^https?:\/\/(www\.)?instagram\.com\/([^\/\?]+)\/?(?:\?.*)?$/i,
  linkedin: /^https?:\/\/(www\.)?linkedin\.com\/in\/([^\/\?]+)\/?(?:\?.*)?$/i,
  github: /^https?:\/\/(www\.)?github\.com\/([^\/\?]+)\/?(?:\?.*)?$/i,
  youtube_channel:
    /^https?:\/\/(www\.)?youtube\.com\/(c\/|channel\/|user\/|@)([^\/\?]+)\/?(?:\?.*)?$/i,
};

const MEDIA_PATTERNS = {
  youtube_video: /^https?:\/\/(www\.)?(youtube\.com\/watch|youtu\.be\/)/i,
  youtube_shorts: /^https?:\/\/(www\.)?youtube\.com\/shorts\//i,
  twitter_post:
    /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/([^\/\?]+)\/status\/(\d+)/i,
  spotify: /^https?:\/\/(open\.)?spotify\.com\/(track|album|playlist|artist)/i,
  soundcloud: /^https?:\/\/(www\.)?soundcloud\.com\//i,
  vimeo: /^https?:\/\/(www\.)?vimeo\.com\/\d+/i,
  twitch: /^https?:\/\/(www\.)?twitch\.tv\//i,
  tiktok: /^https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/i,
  instagram_reel: /^https?:\/\/(www\.)?instagram\.com\/(p|reel)\//i,
  apple_music: /^https?:\/\/music\.apple\.com\//i,
  bandcamp: /^https?:\/\/[\w.-]+\.bandcamp\.com\//i,
};

export async function POST(request: Request) {
  let browser;
  try {
    const body = (await request.json()) as unknown;
    const { url } = requestSchema.parse(body);

    const mediaInfo = detectMediaPlatform(url);
    const socialMediaInfo = !mediaInfo ? detectSocialMedia(url) : null;

    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
      ],
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );
    await page.setViewport({ width: 1200, height: 800 });

    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    });

    try {
      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 15000,
      });

      await new Promise((resolve) => setTimeout(resolve, 3000));

      const metadata = await extractMetadataWithPuppeteer(page, url);

      if (isLoginPage(metadata) || isInsufficientContent(metadata, url)) {
        console.log(
          "Detected login page or insufficient content, using fallback",
        );
        return NextResponse.json(
          mediaInfo ??
            socialMediaInfo ??
            (await generateFallbackMetadata(request)),
        );
      }

      return NextResponse.json(metadata);
    } catch (navigationError) {
      console.warn("Navigation failed, trying fallback:", navigationError);
      if (mediaInfo) {
        return NextResponse.json(mediaInfo);
      }
      if (socialMediaInfo) {
        return NextResponse.json(socialMediaInfo);
      }
      throw navigationError;
    }
  } catch (error) {
    console.error("Error fetching URL metadata:", error);

    try {
      const body = (await request.json()) as unknown;
      const { url } = requestSchema.parse(body);
      const mediaInfo = detectMediaPlatform(url);
      if (mediaInfo) {
        return NextResponse.json(mediaInfo);
      }
      const socialMediaInfo = detectSocialMedia(url);
      if (socialMediaInfo) {
        return NextResponse.json(socialMediaInfo);
      }
    } catch {}

    return NextResponse.json(await generateFallbackMetadata(request));
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

function detectMediaPlatform(url: string): Metadata | null {
  for (const [platform, pattern] of Object.entries(MEDIA_PATTERNS)) {
    if (pattern.test(url)) {
      return generateMediaFallback(platform, url);
    }
  }
  return null;
}

function generateMediaFallback(platform: string, url: string): Metadata {
  switch (platform) {
    case "youtube_video":
    case "youtube_shorts":
      const videoId = extractYouTubeVideoId(url);
      return {
        title: "YouTube Video",
        description: "Watch this video on YouTube",
        siteName: "YouTube",
        type: "video.other",
        canonical: url,
        favicon: "https://www.youtube.com/favicon.ico",
        imageUrl: videoId
          ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
          : undefined,
        videoUrl: url,
      };
    case "twitter_post":
      const tweetParts = MEDIA_PATTERNS.twitter_post.exec(url);
      const tweetUsername = tweetParts?.[3];
      return {
        title: tweetUsername ? `Post by @${tweetUsername}` : "X Post",
        description: "View this post on X",
        siteName: "X",
        type: "social.post",
        canonical: url,
        favicon: "https://abs.twimg.com/favicons/twitter.3.ico",
        author: tweetUsername ? `@${tweetUsername}` : undefined,
      };
    case "spotify":
      const spotifyType = url.includes("/track/")
        ? "music.song"
        : url.includes("/album/")
          ? "music.album"
          : url.includes("/playlist/")
            ? "music.playlist"
            : "music.other";
      return {
        title: "Spotify Music",
        description: "Listen on Spotify",
        siteName: "Spotify",
        type: spotifyType,
        canonical: url,
        favicon: "https://open.spotify.com/favicon.ico",
        imageUrl:
          "https://developer.spotify.com/assets/branding-guidelines/icon1@2x.png",
      };

    case "soundcloud":
      return {
        title: "SoundCloud Audio",
        description: "Listen on SoundCloud",
        siteName: "SoundCloud",
        type: "music.song",
        canonical: url,
        favicon:
          "https://a-v2.sndcdn.com/assets/images/sc-icons/favicon-2cadd14b.ico",
        imageUrl:
          "https://a-v2.sndcdn.com/assets/images/sc-icons/ios-a62dfc8f.png",
      };

    case "vimeo":
      return {
        title: "Vimeo Video",
        description: "Watch this video on Vimeo",
        siteName: "Vimeo",
        type: "video.other",
        canonical: url,
        favicon: "https://vimeo.com/favicon.ico",
        videoUrl: url,
      };

    case "twitch":
      return {
        title: "Twitch Stream",
        description: "Watch live on Twitch",
        siteName: "Twitch",
        type: "video.other",
        canonical: url,
        favicon: "https://static.twitchcdn.net/assets/favicon-32-e29e246c.png",
      };

    case "tiktok":
      return {
        title: "TikTok Video",
        description: "Watch this video on TikTok",
        siteName: "TikTok",
        type: "video.other",
        canonical: url,
        favicon:
          "https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/tiktok/webapp/main/webapp-desktop/favicon.ico",
        videoUrl: url,
      };

    case "instagram_reel":
      return {
        title: "Instagram Reel",
        description: "Watch this reel on Instagram",
        siteName: "Instagram",
        type: "video.other",
        canonical: url,
        favicon:
          "https://static.cdninstagram.com/rsrc.php/v3/yt/r/30PrGfR3xhI.ico",
        videoUrl: url,
      };

    case "apple_music":
      return {
        title: "Apple Music",
        description: "Listen on Apple Music",
        siteName: "Apple Music",
        type: "music.song",
        canonical: url,
        favicon: "https://music.apple.com/favicon.ico",
      };

    case "bandcamp":
      return {
        title: "Bandcamp Music",
        description: "Listen and support the artist on Bandcamp",
        siteName: "Bandcamp",
        type: "music.song",
        canonical: url,
        favicon: "https://s4.bcbits.com/img/favicon/favicon-32x32.png",
      };
    default:
      return {
        title: "Media Content",
        description: "Media content",
        type: "website",
        canonical: url,
      };
  }
}

function extractYouTubeVideoId(url: string): string | null | undefined {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function detectSocialMedia(url: string): Metadata | null {
  if (MEDIA_PATTERNS.twitter_post.test(url)) {
    return null;
  }
  for (const [platform, pattern] of Object.entries(SOCIAL_MEDIA_PATTERNS)) {
    const match = url.match(pattern);
    if (match) {
      const username =
        platform === "youtube_channel" ? match[3] : (match[2] ?? match[3]);
      if (username) {
        return generateSocialMediaFallback(platform, username, url);
      }
    }
  }
  return null;
}

function generateSocialMediaFallback(
  platform: string,
  username: string,
  url: string,
): Metadata {
  const cleanUsername = username.replace(/^@/, "");

  switch (platform) {
    case "twitter":
      return {
        title: `@${cleanUsername} on X`,
        description: `View @${cleanUsername}'s profile on X`,
        siteName: "X",
        type: "profile",
        canonical: url,
        favicon: "https://abs.twimg.com/favicons/twitter.3.ico",
        imageUrl: `https://unavatar.io/twitter/${cleanUsername}`,
        author: `@${cleanUsername}`,
      };
    case "instagram":
      return {
        title: `@${cleanUsername} on Instagram`,
        description: `View @${cleanUsername}'s photos and videos on Instagram`,
        siteName: "Instagram",
        type: "profile",
        canonical: url,
        favicon:
          "https://static.cdninstagram.com/rsrc.php/v3/yt/r/30PrGfR3xhI.ico",
        imageUrl: `https://unavatar.io/instagram/${cleanUsername}`,
        author: `@${cleanUsername}`,
      };

    case "linkedin":
      return {
        title: `${cleanUsername} on LinkedIn`,
        description: `View ${cleanUsername}'s professional profile on LinkedIn`,
        siteName: "LinkedIn",
        type: "profile",
        canonical: url,
        favicon: "https://static.licdn.com/sc/h/al2o9zrvru7aqj8e1x2rzsrca",
        author: cleanUsername,
      };

    case "github":
      return {
        title: `${cleanUsername} on GitHub`,
        description: `View ${cleanUsername}'s repositories and contributions on GitHub`,
        siteName: "GitHub",
        type: "profile",
        canonical: url,
        favicon: "https://github.com/favicon.ico",
        imageUrl: `https://unavatar.io/github/${cleanUsername}`,
        author: cleanUsername,
      };

    case "youtube_channel":
      return {
        title: `${cleanUsername} on YouTube`,
        description: `Watch videos from ${cleanUsername} on YouTube`,
        siteName: "YouTube",
        type: "profile",
        canonical: url,
        favicon: "https://www.youtube.com/favicon.ico",
        author: cleanUsername,
      };
    default:
      return {
        title: `${cleanUsername} Profile`,
        description: `View ${cleanUsername}'s profile`,
        type: "profile",
        canonical: url,
        author: cleanUsername,
      };
  }
}

function isLoginPage(metadata: Metadata): boolean {
  const titleLower = metadata.title.toLowerCase();
  return LOGIN_INDICATORS.some((indicator) =>
    titleLower.includes(indicator.toLowerCase()),
  );
}

function isInsufficientContent(metadata: Metadata, url: string): boolean {
  if (
    MEDIA_PATTERNS.twitter_post.test(url) &&
    (metadata.imageUrl || metadata.videoUrl)
  ) {
    return false;
  }

  const hasGenericTitle =
    metadata.title.length < 10 ||
    metadata.title.toLowerCase().includes("untitled") ||
    metadata.title === "X" ||
    metadata.title === "Twitter";

  const hasNoDescription =
    !metadata.description || metadata.description.length < 20;

  return hasGenericTitle && hasNoDescription;
}

async function extractMetadataWithPuppeteer(
  page: Page,
  url: string,
): Promise<Metadata> {
  const urlObj = new URL(url);
  const baseUrl = `${urlObj.protocol}//${urlObj.host}`;

  const resolveUrl = (relativeUrl: string): string => {
    if (!relativeUrl) return "";
    if (relativeUrl.startsWith("http")) return relativeUrl;
    if (relativeUrl.startsWith("//")) return urlObj.protocol + relativeUrl;
    if (relativeUrl.startsWith("/")) return baseUrl + relativeUrl;
    return baseUrl + "/" + relativeUrl;
  };

  const metadataFromPage = await page.evaluate((baseUrl: string) => {
    const getMetaContent = (selector: string): string | null => {
      const element = document.querySelector(selector);
      return element ? element.getAttribute("content") : null;
    };

    const getTextContent = (selector: string): string | null => {
      const element = document.querySelector(selector);
      return element ? (element.textContent?.trim() ?? null) : null;
    };

    const title =
      getMetaContent('meta[property="og:title"]') ??
      getMetaContent('meta[name="twitter:title"]') ??
      getTextContent("title") ??
      getTextContent("h1") ??
      "";

    const description =
      getMetaContent('meta[property="og:description"]') ??
      getMetaContent('meta[name="twitter:description"]') ??
      getMetaContent('meta[name="description"]') ??
      "";

    const imageUrl =
      getMetaContent('meta[property="og:image"]') ??
      getMetaContent('meta[name="twitter:image"]') ??
      getMetaContent('meta[name="twitter:image:src"]') ??
      "";

    let favicon = "";
    const faviconElement = document.querySelector('link[rel*="icon"]');
    if (faviconElement && "href" in faviconElement) {
      favicon = (faviconElement as HTMLLinkElement).href;
    } else {
      favicon = baseUrl + "/favicon.ico";
    }

    const canonicalElement = document.querySelector('link[rel="canonical"]');
    const canonical =
      canonicalElement && "href" in canonicalElement
        ? (canonicalElement as HTMLLinkElement).href
        : window.location.href;

    const keywordsString = getMetaContent('meta[name="keywords"]') ?? "";
    const keywords = keywordsString
      ? keywordsString
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean)
      : [];

    const siteName = getMetaContent('meta[property="og:site_name"]') ?? "";

    let type = getMetaContent('meta[property="og:type"]') ?? "website";
    const ogVideoUrl =
      getMetaContent('meta[property="og:video:url"]') ??
      getMetaContent('meta[property="og:video:secure_url"]');
    const twitterPlayerUrl = getMetaContent('meta[name="twitter:player"]');
    const twitterCard = getMetaContent('meta[name="twitter:card"]');

    if (ogVideoUrl || twitterPlayerUrl || twitterCard === "player") {
      if (!type.startsWith("video.")) {
        type = "video.other";
      }
    } else if (
      twitterCard === "summary_large_image" ||
      twitterCard === "photo"
    ) {
      if (
        !type.startsWith("image.") &&
        type !== "photo" &&
        !type.startsWith("video.")
      ) {
        type = "image.other";
      }
    } else if (
      type === "profile" &&
      imageUrl &&
      !ogVideoUrl &&
      !twitterPlayerUrl
    ) {
    }

    const author =
      getMetaContent('meta[name="author"]') ??
      getMetaContent('meta[name="twitter:creator"]') ??
      getMetaContent('meta[property="article:author"]') ??
      "";
    const publishedTime =
      getMetaContent('meta[property="article:published_time"]') ?? "";
    const modifiedTime =
      getMetaContent('meta[property="article:modified_time"]') ?? "";
    const locale = getMetaContent('meta[property="og:locale"]') ?? "";
    const themeColor = getMetaContent('meta[name="theme-color"]') ?? "";

    const duration =
      getMetaContent('meta[property="video:duration"]') ??
      getMetaContent('meta[property="music:duration"]') ??
      "";
    const videoUrl = ogVideoUrl ?? twitterPlayerUrl ?? "";
    const audioUrl =
      getMetaContent('meta[property="og:audio:url"]') ??
      getMetaContent('meta[property="og:audio:secure_url"]') ??
      "";
    const album = getMetaContent('meta[property="music:album"]') ?? "";
    const artist =
      getMetaContent('meta[property="music:musician"]') ??
      getMetaContent('meta[property="video:actor"]') ??
      "";
    const genre = getMetaContent('meta[property="music:genre"]') ?? "";
    const releaseDate =
      getMetaContent('meta[property="music:release_date"]') ??
      getMetaContent('meta[property="video:release_date"]') ??
      "";
    const widthStr =
      getMetaContent('meta[property="og:image:width"]') ??
      getMetaContent('meta[property="og:video:width"]') ??
      "";
    const heightStr =
      getMetaContent('meta[property="og:image:height"]') ??
      getMetaContent('meta[property="og:video:height"]') ??
      "";

    return {
      title: title.substring(0, 100),
      description: description ? description.substring(0, 300) : undefined,
      imageUrl,
      siteName: siteName || undefined,
      type,
      author: author || undefined,
      publishedTime: publishedTime || undefined,
      modifiedTime: modifiedTime || undefined,
      keywords: keywords.length > 0 ? keywords : undefined,
      favicon: favicon || undefined,
      canonical: canonical || undefined,
      locale: locale || undefined,
      themeColor: themeColor || undefined,
      duration: duration || undefined,
      videoUrl: videoUrl || undefined,
      audioUrl: audioUrl || undefined,
      album: album || undefined,
      artist: artist || undefined,
      genre: genre || undefined,
      releaseDate: releaseDate || undefined,
      width: widthStr ? parseInt(widthStr) : undefined,
      height: heightStr ? parseInt(heightStr) : undefined,
    };
  }, baseUrl);

  let finalImageUrl = metadataFromPage.imageUrl;
  if (finalImageUrl) {
    finalImageUrl = resolveUrl(finalImageUrl);
  }
  let finalFavicon = metadataFromPage.favicon;
  if (finalFavicon) {
    finalFavicon = resolveUrl(finalFavicon);
  }
  let finalVideoUrl = metadataFromPage.videoUrl;
  if (finalVideoUrl) {
    finalVideoUrl = resolveUrl(finalVideoUrl);
  }
  let finalAudioUrl = metadataFromPage.audioUrl;
  if (finalAudioUrl) {
    finalAudioUrl = resolveUrl(finalAudioUrl);
  }

  return {
    title:
      metadataFromPage.title ||
      (() => {
        const hostname = urlObj.hostname.replace("www.", "");
        return hostname.charAt(0).toUpperCase() + hostname.slice(1);
      })(),
    description: metadataFromPage.description,
    imageUrl: finalImageUrl,
    siteName: metadataFromPage.siteName,
    type: metadataFromPage.type,
    author: metadataFromPage.author,
    publishedTime: metadataFromPage.publishedTime,
    modifiedTime: metadataFromPage.modifiedTime,
    keywords: metadataFromPage.keywords,
    favicon: finalFavicon,
    canonical: metadataFromPage.canonical,
    locale: metadataFromPage.locale,
    themeColor: metadataFromPage.themeColor,
    duration: metadataFromPage.duration,
    videoUrl: finalVideoUrl,
    audioUrl: finalAudioUrl,
    album: metadataFromPage.album,
    artist: metadataFromPage.artist,
    genre: metadataFromPage.genre,
    releaseDate: metadataFromPage.releaseDate,
    width: metadataFromPage.width,
    height: metadataFromPage.height,
  };
}

async function generateFallbackMetadata(request: Request): Promise<Metadata> {
  try {
    const body = (await request.json()) as unknown;
    const { url } = requestSchema.parse(body);
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace("www.", "");
    const fallbackTitle = hostname.charAt(0).toUpperCase() + hostname.slice(1);

    return {
      title: fallbackTitle,
      description: `Content from ${hostname}`,
      siteName: fallbackTitle,
      type: "website",
      canonical: url,
      favicon: `${urlObj.protocol}//${urlObj.host}/favicon.ico`,
    };
  } catch {
    return {
      title: "Link",
      description: "External link",
      type: "website",
    };
  }
}
