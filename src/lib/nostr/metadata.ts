export interface Metadata {
  title: string;
  description?: string;
  type: string;
  canonical: string;
  image?: string;
  site_name?: string;
  author?: string;
  published_time?: string;
  modified_time?: string;
  section?: string;
  tags?: string[];
}

export class NostrMetadata {
  static async fetchUrlMetadata(url: string): Promise<Metadata> {
    try {
      const metadata = await this.fetchOpenGraphMetadata(url);
      if (metadata.title && metadata.title !== url) {
        return metadata;
      }

      return this.generateBasicMetadata(url);
    } catch (error) {
      console.error("Failed to fetch metadata:", error);
      return this.generateBasicMetadata(url);
    }
  }

  private static async fetchOpenGraphMetadata(url: string): Promise<Metadata> {
    try {
      const response = await fetch(
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
      );
      const data = (await response.json()) as { contents?: string };

      if (!data.contents) {
        throw new Error("No content received");
      }

      return this.parseHtmlMetadata(data.contents, url);
    } catch {
      try {
        await fetch(url, { mode: "no-cors" });

        throw new Error("CORS restriction");
      } catch {
        return this.generateBasicMetadata(url);
      }
    }
  }

  private static parseHtmlMetadata(html: string, url: string): Metadata {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const getMetaContent = (property: string): string | undefined => {
      const element =
        doc.querySelector(`meta[property="${property}"]`) ??
        doc.querySelector(`meta[name="${property}"]`);
      return element?.getAttribute("content") ?? undefined;
    };

    const title =
      getMetaContent("og:title") ??
      doc.querySelector("title")?.textContent ??
      getMetaContent("title") ??
      url;

    const description =
      getMetaContent("og:description") ??
      getMetaContent("description") ??
      getMetaContent("twitter:description");

    const image = getMetaContent("og:image") ?? getMetaContent("twitter:image");

    const siteName = getMetaContent("og:site_name");
    const type = getMetaContent("og:type") ?? "website";
    const author = getMetaContent("author") ?? getMetaContent("og:author");
    const publishedTime = getMetaContent("article:published_time");
    const modifiedTime = getMetaContent("article:modified_time");
    const section = getMetaContent("article:section");

    return {
      title: title.trim(),
      description: description?.trim(),
      type,
      canonical: url,
      ...(image && { image }),
      ...(siteName && { site_name: siteName }),
      ...(author && { author }),
      ...(publishedTime && { published_time: publishedTime }),
      ...(modifiedTime && { modified_time: modifiedTime }),
      ...(section && { section }),
    };
  }

  static generateBasicMetadata(url: string): Metadata {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace("www.", "");

      return {
        title: domain,
        description: `Content from ${domain}`,
        type: "website",
        canonical: url,
      };
    } catch {
      return {
        title: url,
        description: "Link",
        type: "website",
        canonical: url,
      };
    }
  }

  static extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace("www.", "");
    } catch {
      return url;
    }
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static getFaviconUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
    } catch {
      return "/favicon.ico";
    }
  }

  static async fetchMultipleMetadata(
    urls: string[],
  ): Promise<Record<string, Metadata>> {
    const results: Record<string, Metadata> = {};

    const batchSize = 5;
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      const promises = batch.map(async (url) => {
        try {
          const metadata = await this.fetchUrlMetadata(url);
          return { url, metadata };
        } catch {
          return { url, metadata: this.generateBasicMetadata(url) };
        }
      });

      const batchResults = await Promise.all(promises);
      batchResults.forEach(({ url, metadata }) => {
        results[url] = metadata;
      });

      if (i + batchSize < urls.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  private static metadataCache = new Map<
    string,
    { metadata: Metadata; timestamp: number }
  >();
  private static readonly CACHE_DURATION = 1000 * 60 * 60; // 1 hour

  static async fetchUrlMetadataCached(url: string): Promise<Metadata> {
    const cached = this.metadataCache.get(url);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.metadata;
    }

    const metadata = await this.fetchUrlMetadata(url);
    this.metadataCache.set(url, { metadata, timestamp: Date.now() });

    return metadata;
  }

  static clearCache(): void {
    this.metadataCache.clear();
  }

  static getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.metadataCache.size,
      entries: Array.from(this.metadataCache.keys()),
    };
  }
}

export const processLinkUrl = (url: string): string => {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
};

export const sanitizeLinkTitle = (title: string): string => {
  return title.replace(/\s+/g, " ").trim().substring(0, 100);
};

export const sanitizeLinkDescription = (
  description?: string,
): string | undefined => {
  if (!description) return undefined;
  return description.replace(/\s+/g, " ").trim().substring(0, 300);
};
