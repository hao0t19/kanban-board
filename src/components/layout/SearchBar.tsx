"use client";

import { useEffect, useState } from "react";
import { SearchIcon } from "@/components/ui/Icons";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/useUiStore";

export function SearchBar({ className }: { className?: string }) {
  const setQuery = useUiStore((s) => s.setQuery);
  const [value, setValue] = useState("");
  const debounced = useDebounce(value, 200);

  useEffect(() => {
    setQuery(debounced);
  }, [debounced, setQuery]);

  return (
    <label className={cn("relative block", className)}>
      <span className="sr-only">Search cards</span>
      <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" width={16} height={16} />
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search cards..."
        className="h-control w-full rounded-control border border-line bg-page pl-10 pr-3 text-[15px] text-ink placeholder:text-ink-muted"
      />
    </label>
  );
}
