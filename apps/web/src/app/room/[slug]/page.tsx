import React, { Suspense } from "react";
import PublicRoomsList from "./_components/public-rooms";
import { useGetAllCategories } from "@/actions/get-all-categories";
import PublicRoomsListSkeleton from "@/components/room-page-skeleton";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const RoomBySlugPage = async ({ params }: PageProps) => {
  const categories = await useGetAllCategories();
  const { slug } = await params;

  return (
    <Suspense fallback={<PublicRoomsListSkeleton />}>
      <div className="max-w-7xl mx-auto">
        <PublicRoomsList categories={categories} selectedSlug={slug} />
      </div>
    </Suspense>
  );
};

export default RoomBySlugPage;
