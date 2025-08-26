"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  Crown,
  Users,
  Play,
  UserMinus,
  Copy,
  MessageCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import WaitingRoomSkeleton from "./waiting-room-skeleton";

interface RoomMember {
  userName: string;
  userEmail: string;
  userImage: string;
  isHost: boolean;
}

interface WaitingRoomProps {
  roomID: string;
  joinCode: string | null;
  name: string;
}

export default function WaitingRoomUI({
  roomID,
  name,
  joinCode,
}: WaitingRoomProps) {
  const {
    data: members,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["room-members"],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:3000/api/room-member/get-room-members/${roomID}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch room members: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    },
    staleTime: 5 * 60,
    retry: 2,
  });

  if (isLoading) {
    return <WaitingRoomSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-2xl mx-auto mt-20">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                Failed to load room members. Please check your connection and
                try again.
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="ml-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>

          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">
                Unable to Load Room
              </h3>
              <p className="text-muted-foreground mb-4">
                We're having trouble connecting to the room. This might be due
                to:
              </p>
              <ul className="text-sm text-muted-foreground text-left max-w-md mx-auto space-y-1">
                <li>• Network connection issues</li>
                <li>• Room may no longer exist</li>
                <li>• Server temporarily unavailable</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentUser = members?.find((member: RoomMember) => member.isHost);
  const isCurrentUserHost = currentUser?.isHost || false;

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Waiting Room - Truth or Dare
          </h1>
          <p className="text-muted-foreground">Get ready for some fun! 🎉</p>

          {joinCode && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="text-sm text-muted-foreground">Room Code:</span>
              <Badge
                variant="secondary"
                className="text-lg px-4 py-2 cursor-pointer hover:bg-accent transition-colors"
              >
                {joinCode}
                <Copy className="ml-2 h-4 w-4" />
              </Badge>
            </div>
          )}
        </div>

        <Card className="mb-6 border-2 border-primary/20">
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-lg capitalize font-semibold">{name}</h1>
                  <h3 className="">Waiting for Players</h3>
                  <p className="text-muted-foreground">
                    {members?.length || 0} player
                    {members?.length !== 1 ? "s" : ""} in room
                  </p>
                </div>
              </div>

              {isCurrentUserHost && (
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={!members || members.length < 2}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Start Game
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {members?.map((member: RoomMember, index: number) => (
            <Card
              key={index}
              className={`transition-all duration-200 hover:shadow-lg ${
                member.isHost
                  ? "ring-2 ring-primary/50 bg-primary/5"
                  : "hover:bg-muted/50"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={member.userImage || "/placeholder.svg"}
                        alt={member.userName}
                      />
                      <AvatarFallback className="bg-accent text-accent-foreground">
                        {member.userName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-card-foreground">
                          {member.userName}
                        </h4>
                        {member.isHost && (
                          <Crown className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {member.isHost ? "Host" : "Player"}
                      </p>
                    </div>
                  </div>

                  {isCurrentUserHost && !member.isHost && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="my-6">
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-8 w-8 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">While you wait...</h3>
            <p className="text-muted-foreground mb-4">
              Here's a sample question to get you thinking:
            </p>
            <div className="">
              <p className="font-medium">
                "What's the most embarrassing thing that happened to you in
                school?"
              </p>
            </div>
          </CardContent>
        </Card>

        {isCurrentUserHost && (
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Host Controls</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm">
                  Game Settings
                </Button>
                <Button variant="outline" size="sm">
                  Invite Players
                </Button>
                <Button variant="outline" size="sm">
                  Room Rules
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>• You can remove players by clicking the remove button</p>
                <p>• Game will start when you have at least 2 players</p>
                <p>• Share the room code with friends to invite them</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
