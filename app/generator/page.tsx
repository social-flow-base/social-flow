"use client";

import { PlatformSelector } from "@/components/generator/PlatformSelector";
import { PromptInput } from "@/components/generator/PromptInput";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { PreviewPanel } from "@/components/generator/PreviewPanel";
import { Toast } from "@/components/ui/Toast";

export default function GeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("linkedin");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });
  const [systemInstructions, setSystemInstructions] = useState<
    Record<string, string>
  >({
    linkedin: `You are a professional LinkedIn content creator. Create detailed, insightful posts that focus on industry trends, professional development, and business value. Use a professional yet engaging tone. Include relevant hashtags and structure the post for maximum readability.`,
    instagram: `You are an Instagram content expert. Create visually descriptive and engaging captions. Use emojis, a casual and fun tone, and include a mix of popular and niche hashtags. Focus on storytelling and encouraging audience interaction.`,
    threads: `You are a Threads enthusiast. Create short, conversational, and punchy posts that spark discussion. Keep it concise, authentic, and slightly informal. Encourage replies and engagement.`,
    twitter: `You are a Twitter power user. Create short, punchy tweets (under 280 characters). Use threads if necessary but keep individual tweets concise. Use high-impact words and trending hashtags. Focus on viral potential.`,
  });

  const account = useActiveAccount();

  // Load system instructions from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("promptdesk_system_instructions");
      if (saved) {
        const parsed = JSON.parse(saved);
        setSystemInstructions((prev) => ({
          ...prev,
          ...parsed,
        }));
      }
    } catch (error) {
      console.error(
        "Error loading system instructions from localStorage:",
        error,
      );
    }
  }, []);

  const handleSaveInstruction = (platform: string, instruction: string) => {
    try {
      const newInstructions = {
        ...systemInstructions,
        [platform]: instruction,
      };

      setSystemInstructions(newInstructions);
      localStorage.setItem(
        "promptdesk_system_instructions",
        JSON.stringify(newInstructions),
      );

      setToast({
        show: true,
        message: "System instruction saved to local storage",
        type: "success",
      });
    } catch (error: any) {
      console.error("Error saving to localStorage:", error);
      setToast({
        show: true,
        message: "Failed to save instruction locally",
        type: "error",
      });
    }
  };

  const handleGenerate = async () => {
    if (!account) {
      setToast({
        show: true,
        message: "Please connect your wallet to generate content",
        type: "error",
      });
      return;
    }

    if (!prompt) return;

    setIsLoading(true);
    setGeneratedContent("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          platform: selectedPlatform,
          systemInstruction: systemInstructions[selectedPlatform],
        }),
      });

      const data = await response.json();

      if (data.result) {
        setGeneratedContent(data.result);
      } else {
        console.error("Failed to generate content");
        setToast({
          show: true,
          message: "Failed to generate content. Please try again.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error generating content:", error);
      setToast({
        show: true,
        message: "Error generating content. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <Header />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left Column - Inputs */}
            <div className="flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  Create Social Content
                </h1>
              </div>

              <PromptInput
                value={prompt}
                onChange={setPrompt}
                isConnected={!!account}
              />

              <PlatformSelector
                selected={selectedPlatform}
                onSelect={setSelectedPlatform}
                systemInstructions={systemInstructions}
                setSystemInstructions={setSystemInstructions}
                isSettingsOpen={isSettingsOpen}
                setIsSettingsOpen={setIsSettingsOpen}
                selectedPlatform={selectedPlatform}
                // @ts-ignore
                onSaveInstruction={handleSaveInstruction}
              />

              <button
                onClick={handleGenerate}
                disabled={isLoading || !prompt}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-base font-semibold text-white transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Generating..." : "Generate"}
              </button>

              <div className="mt-2 flex items-center gap-3 rounded-lg border border-zinc-100 p-4 dark:border-zinc-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-5 w-5 text-green-600 dark:text-green-400"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a8 8 0 100 16 8 8 0 000-16zm3.857 5.428a.75.75 0 00-1.214-.856L9.336 9.879 7.357 7.857a.75.75 0 00-1.072 1.05l2.536 2.536a.75.75 0 001.072 0l4.964-5.015z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Secure Transactions
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Payments are processed directly via smart contracts.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="flex flex-col gap-4">
              <PreviewPanel
                isLocked={!account}
                isConnected={!!account}
                content={generatedContent}
                prompt={prompt}
                platform={selectedPlatform}
                address={account?.address}
                isLoading={isLoading}
              />

              <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-900/20">
                <div className="mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-5 w-5 text-blue-600 dark:text-blue-400"
                  >
                    <path
                      fillRule="evenodd"
                      d="M19 10.5a8.5 8.5 0 11-17 0 8.5 8.5 0 0117 0zM8.25 9.75A.75.75 0 019 9h.253a1.75 1.75 0 011.709 2.13l-.46 2.066a.25.25 0 00.245.304H11a.75.75 0 010 1.5h-.253a1.75 1.75 0 01-1.709-2.13l.46-2.066a.25.25 0 00-.245-.304H9a.75.75 0 01-.75-.75zM10 7a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="text-sm leading-relaxed text-blue-900 dark:text-blue-100">
                  <span className="font-semibold">Gas Efficiency:</span> Our
                  contract is optimized for minimal gas fees on Layer 2
                  networks.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
}
