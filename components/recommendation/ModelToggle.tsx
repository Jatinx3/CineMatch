"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function ModelToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const model = searchParams.get("model") || "tfidf";

  const handleToggle = (newModel: "tfidf" | "bert") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("model", newModel);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center justify-center p-1 bg-gray-100 dark:bg-zinc-900/80 rounded-2xl border border-gray-200 dark:border-zinc-800 w-fit mx-auto shadow-sm backdrop-blur-sm">
      <button
        onClick={() => handleToggle("tfidf")}
        className={`px-5 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all duration-200 ${
          model === "tfidf"
            ? "bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-md ring-1 ring-blue-200 dark:ring-0 scale-[1.02]"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-zinc-800"
        }`}
      >
        TF-IDF
      </button>
      <button
        onClick={() => handleToggle("bert")}
        className={`px-5 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all duration-200 ${
          model === "bert"
            ? "bg-white dark:bg-purple-600 text-purple-600 dark:text-white shadow-md ring-1 ring-purple-200 dark:ring-0 scale-[1.02]"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-zinc-800"
        }`}
      >
        BERT Neural
      </button>
    </div>
  );
}
