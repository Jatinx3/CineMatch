import { ReactNode } from "react";

interface RecommendationListProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function RecommendationList({ title, description, children }: RecommendationListProps) {
  return (
    <section className="py-10 w-full mb-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {title}
          </h2>
          {description && <p className="text-gray-500 dark:text-gray-400 mt-1 text-xs font-medium">{description}</p>}
        </div>
        <div className="h-px flex-1 max-w-md bg-gradient-to-r from-gray-200 dark:from-zinc-700 to-transparent hidden md:block ml-6 mb-1"></div>
      </div>
      {children}
    </section>
  );
}

