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
      homeUrl: "https://dprompt.netlify.app",
      iconUrl: "https://dprompt.netlify.app/icon.png",
      splashImageUrl: "https://dprompt.netlify.app/splash.png",
      splashBackgroundColor: "#000000",
      webhookUrl: "https://dprompt.netlify.app/api/webhook",
      subtitle: "Fast, fun, social",
      description: "Automate your content",
      screenshotUrls: [
        "https://dprompt.netlify.app/s1.png",
        "https://dprompt.netlify.app/s2.png",
        "https://dprompt.netlify.app/s3.png",
      ],
      primaryCategory: "social",
      tags: ["ai", "miniapp", "baseapp"],
      heroImageUrl: "https://dprompt.netlify.app/og.png",
      tagline: "Play instantly",
      ogTitle: "Social Flow",
      ogDescription: "Automate your content",
      ogImageUrl: "https://dprompt.netlify.app/og.png",
      noindex: false,
    },
  }); // see the next step for the manifest_json_object
}
