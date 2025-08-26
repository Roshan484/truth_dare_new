import React from "react";
import WaitingRoomUI from "./_components/waiting-room";

const WaitingRoom = async ({
  params,
}: {
  params: Promise<{ categorySlug: string; name: string; id: string }>;
}) => {
  const { name, id } = await params;

  const response = await fetch(
    `http://localhost:3000/api/rooms/get-room-by-id/${id}`,
    {
      method: "GET",
    }
  );
  const data = await response.json();

  return (
    <div className="py-10">
      <WaitingRoomUI roomID={id} name={name} joinCode={data.data.joinCode} />
    </div>
  );
};

export default WaitingRoom;
