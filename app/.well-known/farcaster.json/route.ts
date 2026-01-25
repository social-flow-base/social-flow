function withValidProperties(
  properties: Record<string, undefined | string | string[]>,
) {
  return Object.fromEntries(
    Object.entries(properties).filter(([_, value]) =>
      Array.isArray(value) ? value.length > 0 : !!value,
    ),
  );
}

export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL as string;
  return Response.json({
    accountAssociation: {
      header:
        "eyJmaWQiOjI0NDQwOTMsInR5cGUiOiJhdXRoIiwia2V5IjoiMHg4MmM1MjNGMkQ1MGQ1NjRBZUY0MTYyMTEyNTgxYTQyYzUxZGJhQTVmIn0",
      payload: "eyJkb21haW4iOiJkcHJvbXB0Lm5ldGxpZnkuYXBwIn0",
      signature:
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEFF4ob8cdlqMh0CwZ-URCrDGa56VME3UgpQ3QXpQfYTQj1OiuyFGA6oMNLyeOiQLkfzx_fsjC8-fLweMNntcmrrGwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    },
    miniapp: {
      version: "1",
      name: "Social Flow",
      homeUrl: "https://ex.co",
      iconUrl: "https://ex.co/i.png",
      splashImageUrl: "https://ex.co/l.png",
      splashBackgroundColor: "#000000",
      webhookUrl: "https://ex.co/api/webhook",
      subtitle: "Fast, fun, social",
      description: "Automate your content",
      screenshotUrls: [
        "https://ex.co/s1.png",
        "https://ex.co/s2.png",
        "https://ex.co/s3.png",
      ],
      primaryCategory: "social",
      tags: ["ai", "miniapp", "baseapp"],
      heroImageUrl: "https://ex.co/og.png",
      tagline: "Play instantly",
      ogTitle: "Social Flow",
      ogDescription: "Automate your content",
      ogImageUrl: "https://ex.co/og.png",
      noindex: true,
    },
  }); // see the next step for the manifest_json_object
}
