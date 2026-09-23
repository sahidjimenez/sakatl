export type ExerciseVideo = { provider: "YouTube" | "Instagram" | "TikTok"; url: string; embedUrl: string };

export function parseExerciseVideo(value: string): ExerciseVideo | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
    const host = url.hostname.toLowerCase();
    const parts = url.pathname.split("/").filter(Boolean);
    if (["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"].includes(host)) {
      const id = host === "youtu.be" ? parts[0] : parts[0] === "watch" ? url.searchParams.get("v") : ["shorts", "embed", "live"].includes(parts[0]) ? parts[1] : null;
      if (!id || !/^[\w-]{11}$/.test(id)) return null;
      return { provider: "YouTube", url: `https://www.youtube.com/watch?v=${id}`, embedUrl: `https://www.youtube.com/embed/${id}` };
    }
    if (["instagram.com", "www.instagram.com"].includes(host) && ["p", "reel", "reels", "tv"].includes(parts[0]) && /^[\w-]+$/.test(parts[1] ?? "")) {
      const canonical = `https://www.instagram.com/${parts[0] === "reels" ? "reel" : parts[0]}/${parts[1]}/`;
      return { provider: "Instagram", url: canonical, embedUrl: `${canonical}embed/` };
    }
    if (["tiktok.com", "www.tiktok.com", "m.tiktok.com"].includes(host) && /^@[\w.-]+$/.test(parts[0] ?? "") && parts[1] === "video" && /^\d{10,25}$/.test(parts[2] ?? "")) {
      return { provider: "TikTok", url: `https://www.tiktok.com/${parts[0]}/video/${parts[2]}`, embedUrl: `https://www.tiktok.com/player/v1/${parts[2]}` };
    }
    return null;
  } catch { return null; }
}
