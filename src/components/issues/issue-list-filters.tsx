"use client";

import { useQueryStates } from "nuqs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { issueListSearchParams } from "@/app/(app)/projects/[projectKey]/issues/search-params";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function IssueListFilters() {
  const [params, setParams] = useQueryStates(issueListSearchParams);
  const { search, status, type } = params;

  const isFiltered = search !== "" || status !== "all" || type !== "all";

  const clearFilters = () => {
    setParams({
      search: "",
      status: "all",
      type: "all",
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 items-end sm:items-center">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search issues..."
          className="pl-8"
          value={search}
          onChange={(e) => setParams({ search: e.target.value || "" })}
        />
      </div>

      <div className="flex gap-2 w-full sm:w-auto">
        <Select
          value={status}
          onValueChange={(value) => setParams({ status: value })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="backlog">Backlog</SelectItem>
            <SelectItem value="todo">Todo</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={type}
          onValueChange={(value) => setParams({ type: value })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="epic">Epic</SelectItem>
            <SelectItem value="feature">Feature</SelectItem>
            <SelectItem value="task">Task</SelectItem>
            <SelectItem value="bug">Bug</SelectItem>
          </SelectContent>
        </Select>

        {isFiltered && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearFilters}
            title="Clear filters"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
