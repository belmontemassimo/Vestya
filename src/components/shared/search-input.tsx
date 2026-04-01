"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchInputProps {
  paramName?: string;
  placeholder?: string;
  debounceMs?: number;
}

export function SearchInput({
  paramName = "search",
  placeholder,
  debounceMs = 300,
}: SearchInputProps) {
  const t = useTranslations("common");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(searchParams.get(paramName) ?? "");

  const updateSearchParams = useCallback(
    (searchValue: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchValue) {
        params.set(paramName, searchValue);
      } else {
        params.delete(paramName);
      }
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, paramName, router, pathname]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      updateSearchParams(value);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, debounceMs, updateSearchParams]);

  return (
    <div className="relative max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder ?? t("search")}
        className="pl-9 pr-9 bg-white"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
          onClick={() => setValue("")}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
