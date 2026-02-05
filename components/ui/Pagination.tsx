"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { formUrlQuery } from "@/lib/utils/query";

interface PaginationProps {
  page: number;
  totalPages: number;
}

export default function Pagination({ page, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      updates: {
        page: newPage.toString(),
      },
      baseUrl: window.location.pathname,
    });

    router.push(newUrl);
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-4 mt-8">
      <button
        onClick={() => handlePageChange(page - 1)}
        disabled={page <= 1}
        className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-white bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>
      <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => handlePageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-white bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  );
}
