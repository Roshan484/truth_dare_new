"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

interface Room {
  id: string;
  name: string;
  isPublic: boolean;
  categorySlug: string;
  limit: number;
  joinCode: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creatorName: string;
  categoryName: string;
  totalPlayers: number;
}

interface ApiResponse {
  data: Room[];
  pagination: {
    page: number;
    limit: number;
    offset: number;
  };
}

const RoomList = ({ slug }: { slug: string }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: roomData, isLoading } = useQuery<ApiResponse>({
    queryKey: ["room-list", slug, currentPage],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:3000/api/rooms?isPublic=true&categorySlug=${slug}&page=${currentPage}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();
      return data;
    },
  });

  const joinRoomMutation = useMutation({
    mutationFn: async (roomId: string) => {
      const response = await fetch(
        `http://localhost:3000/api/room-member/join-room/${roomId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomId: roomId,
            userId: user?.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to join room");
      }

      return response.json();
    },

    onError: (error) => {
      console.error("Error joining room:", error);
    },
  });

  const handleJoinRoom = (
    roomId: string,
    categorySlug: string,
    name: string
  ) => {
    joinRoomMutation.mutateAsync(roomId, {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: ["room-members"],
        });

        void queryClient.invalidateQueries({
          queryKey: ["room-list", slug, currentPage],
        });
        router.push(`/waiting-room/${categorySlug}/${name}/${roomId}`);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!roomData?.data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No rooms found.</p>
      </div>
    );
  }

  const { data: rooms, pagination } = roomData;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  if (rooms.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No rooms found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => {
          const isRoomFull = room.totalPlayers >= room.limit;
          const isJoining = joinRoomMutation.isPending;

          return (
            <Card key={room.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{room.name}</CardTitle>
                  <Badge variant="secondary" className="ml-2">
                    {room.categoryName}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Created by {room.creatorName}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>
                    Total: {room.totalPlayers}/{room.limit} participants
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Created {formatDate(room.createdAt)}</span>
                </div>

                <div className="pt-2">
                  <Button
                    className="w-full"
                    size="sm"
                    disabled={isRoomFull || isJoining}
                    onClick={() =>
                      handleJoinRoom(room.id, room.categorySlug, room.name)
                    }
                  >
                    {isJoining
                      ? "Joining..."
                      : isRoomFull
                      ? "Room Full"
                      : "Join Room"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {pagination.page} • Showing {rooms.length} rooms
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={rooms.length < pagination.limit}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoomList;
