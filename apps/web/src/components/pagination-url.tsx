"use client";
import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  page: number;
  limit: number;
  hasNext?: boolean;
  hasPrev?: boolean;
  total?: number;
};

const PaginationUrl = ({
  page,
  limit,
  hasNext = true,
  hasPrev = page > 1,
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = React.useCallback(
    (nextPage: number) => {
      const params = new URLSearchParams(searchParams?.toString());
      params.set("page", String(nextPage));
      params.set("limit", String(limit));
      return `${pathname}?${params.toString()}`;
    },
    [limit, pathname, searchParams]
  );

  const canPrev = hasPrev && page > 1;
  const prevHref = canPrev ? createQueryString(page - 1) : undefined;
  const canNext = hasNext;
  const nextHref = canNext ? createQueryString(page + 1) : undefined;

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            aria-disabled={!canPrev}
            tabIndex={canPrev ? 0 : -1}
            className={!canPrev ? "pointer-events-none opacity-50" : undefined}
            onClick={(e) => {
              if (!canPrev) return e.preventDefault();
              router.push(prevHref!);
            }}
            href={canPrev ? prevHref : "#"}
          />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            isActive
            onClick={(e) => e.preventDefault()}
            href={createQueryString(page)}
          >
            {page}
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            aria-disabled={!canNext}
            tabIndex={canNext ? 0 : -1}
            className={!canNext ? "pointer-events-none opacity-50" : undefined}
            onClick={(e) => {
              if (!canNext) return e.preventDefault();
              router.push(nextHref!);
            }}
            href={canNext ? nextHref : "#"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationUrl;
