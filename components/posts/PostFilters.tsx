"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function PostFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page"); // reset pagination on filter change
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router]
  );

  const clearAll = () => {
    router.push(pathname);
  };

  const hasFilters =
    searchParams.has("q") ||
    searchParams.has("type") ||
    searchParams.has("status") ||
    searchParams.has("funded");

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search posts..."
          defaultValue={searchParams.get("q") ?? ""}
          className="pl-9"
          onChange={(e) => {
            const val = e.target.value;
            const timer = setTimeout(() => updateParam("q", val || null), 400);
            return () => clearTimeout(timer);
          }}
        />
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        {/* Type filter */}
        <div className="flex flex-col gap-1 min-w-[160px]">
          <Label className="text-xs text-muted-foreground">Post Type</Label>
          <Select
            value={searchParams.get("type") ?? "all"}
            onValueChange={(v) => updateParam("type", v === "all" ? null : v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="feature_request">Feature Request</SelectItem>
              <SelectItem value="research_topic">Research Topic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status filter */}
        <div className="flex flex-col gap-1 min-w-[160px]">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select
            value={searchParams.get("status") ?? "all"}
            onValueChange={(v) => updateParam("status", v === "all" ? null : v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Funded filter */}
        <div className="flex items-center gap-2 self-end pb-1">
          <Checkbox
            id="funded"
            checked={searchParams.get("funded") === "true"}
            onCheckedChange={(checked) =>
              updateParam("funded", checked ? "true" : null)
            }
          />
          <Label htmlFor="funded" className="text-sm cursor-pointer">Has Funding</Label>
        </div>

        {/* Clear */}
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="self-end h-8 text-xs gap-1"
          >
            <X className="h-3 w-3" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
