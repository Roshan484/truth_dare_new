"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RoomCardSkeleton from "@/components/card/room-card-skeleton";

const PublicRoomsListSkeleton = () => {
  return (
    <div className="py-10">
      {/* Page header skeleton */}
      <div className="text-center mb-2 space-y-2">
        <div className="h-7 w-64 mx-auto rounded border border-border animate-pulse opacity-60"></div>
        <div className="h-4 w-96 mx-auto rounded border border-border animate-pulse opacity-60"></div>
      </div>

      {/* Tabs skeleton */}
      <Tabs defaultValue="skeleton">
        <TabsList className="grid grid-cols-5 w-full gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <TabsTrigger key={i} value={`skeleton-${i}`} disabled>
              <div className="h-6 w-20 mx-auto rounded-full border border-border animate-pulse opacity-60"></div>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Content skeleton */}
        <div className="w-full mt-6">
          <div className="min-h-[50vh] grid grid-cols-2 gap-10 w-full">
            {/* Left side: rooms skeleton */}
            <div className="grid grid-cols-1 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <RoomCardSkeleton key={i} />
              ))}
            </div>

            {/* Right side: "Your Rooms" skeleton */}
            <div className="border flex-1 p-4 space-y-4">
              <div className="h-6 w-32 rounded border border-border animate-pulse opacity-60"></div>
              {Array.from({ length: 2 }).map((_, i) => (
                <RoomCardSkeleton key={i} />
              ))}
            </div>
          </div>

          {/* Pagination skeleton */}
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-8 w-8 rounded border border-border animate-pulse opacity-60"
              ></div>
            ))}
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default PublicRoomsListSkeleton;
