"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Category } from "@/types/category";
import type { Room } from "@/types/room";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import PaginationUrl from "@/components/pagination-url";
import RoomCard from "@/components/card/room-card";
import RoomCardSkeleton from "@/components/card/room-card-skeleton";

type Props = { categories: Category[]; selectedSlug?: string };
interface ApiResponse {
  data: Room[];
  pagination: {
    page: number;
    limit: number;
    offset: number;
    hasNext: boolean;
    hasPrev: boolean;
    totalCount?: number;
  };
}
const getRoomsByCategory = async (
  categorySlug: string,
  page: number,
  limit: number
) => {
  const response = await fetch(
    `http://localhost:3000/api/rooms?isPublic=true&categorySlug=${categorySlug}&page=${page}&limit=${limit}`,
    {
      method: "GET",
      credentials: "include",
    }
  );
  return response.json();
};

const PublicRoomsList = ({ categories, selectedSlug }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams?.get("page") ?? "1");
  const limit = Number(searchParams?.get("limit") ?? "10");

  const handleCategoryChange = (categorySlug: string) => {
    if (pathname?.startsWith("/room")) {
      router.push(`/room/${categorySlug}`);
    } else {
      router.push(`/room/${categorySlug}`);
    }
  };

  const fetchRooms = useQuery<ApiResponse>({
    queryKey: ["room-list", selectedSlug ?? categories[0].slug, page, limit],
    queryFn: () =>
      getRoomsByCategory(selectedSlug ?? categories[0].slug, page, limit),
    staleTime: 1000 * 60 * 3,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: 1000 * 60 * 3,
    refetchOnReconnect: false,
  });

  console.log(fetchRooms.data);

  if (fetchRooms.isError) {
    return <div>Error fetching rooms</div>;
  }

  return (
    <div className="py-10">
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold">Join the truth or dare game.</h1>
        <p className="text-muted-foreground">
          Join the truth or dare game. Play with your friends and family.
        </p>
      </div>
      <div>
        <Tabs defaultValue={selectedSlug ?? categories[0].slug}>
          <TabsList className="grid grid-cols-5 w-full">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.slug}
                onClick={() => handleCategoryChange(category.slug)}
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent
            value={selectedSlug ?? categories[0].slug}
            className="w-full"
          >
            <div className="min-h-[50vh] grid grid-cols-2 gap-10 w-full">
              {fetchRooms.isLoading ? (
                <RoomCardSkeleton />
              ) : fetchRooms.data?.data && fetchRooms.data.data.length > 0 ? (
                <div className="grid grid-cols-1">
                  {fetchRooms.data.data.map((room) => (
                    <RoomCard key={room.id} room={room} />
                  ))}
                </div>
              ) : (
                <div>{`No Room found for ${
                  selectedSlug ?? categories[0].slug
                }`}</div>
              )}

              <div className="border flex-1">
                <h1>Your Rooms</h1>
              </div>
            </div>
            {fetchRooms.data?.data && fetchRooms.data.data.length > 0 && (
              <PaginationUrl
                page={fetchRooms.data?.pagination.page ?? page}
                limit={fetchRooms.data?.pagination.limit ?? limit}
                hasNext={fetchRooms.data?.pagination.hasNext ?? false}
                hasPrev={fetchRooms.data?.pagination.hasPrev ?? false}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PublicRoomsList;
