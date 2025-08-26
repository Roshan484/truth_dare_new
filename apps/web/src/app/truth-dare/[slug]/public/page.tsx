import React from "react";
import RoomList from "./_components/rooms-list";

const PublicRooms = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  return (
    <div className="max-w-7xl mx-auto py-4">
      <RoomList slug={slug} />
    </div>
  );
};

export default PublicRooms;
