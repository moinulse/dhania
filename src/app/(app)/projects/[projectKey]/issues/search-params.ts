import { createSearchParamsCache, parseAsString } from "nuqs/server";

export const issueListSearchParams = {
  search: parseAsString.withDefault(""),
  status: parseAsString.withDefault("all"),
  type: parseAsString.withDefault("all"),
};

export const searchParamsCache = createSearchParamsCache(issueListSearchParams);
