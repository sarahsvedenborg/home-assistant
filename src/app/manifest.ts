import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Family Hub",
    short_name: "Family Hub",
    description: "Et lekent felles sted for familiens ønskelister, filmvalg og planer.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fffaf1",
    theme_color: "#fffaf1",
    lang: "nb",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
