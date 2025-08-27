import React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";
import { Users, Zap, DoorOpen } from "lucide-react";
import { CreateRoomDialog } from "./_components/create-room-dialog";
import { JoinRoomDialog } from "./_components/join-room-dialog";

const CategoryPlay = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full h-full mx-auto max-w-2xl  backdrop-blur-md ">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center ">
            {slug.charAt(0).toUpperCase() + slug.slice(1)} - Choose an Option
          </CardTitle>
          <CardDescription className="text-center ">
            Create a new room, join an existing one, or play online with random
            players.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex flex-col items-center">
                <Users className="w-10 h-10 mb-2" />
                <p className="text-muted-foreground text-sm mb-4">
                  Create a new room and play with friends.
                </p>
                <CreateRoomDialog categorySlug={slug} />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center">
                <Zap className="w-10 h-10  text-yellow-300 mb-2" />
                <p className="text-muted-foreground text-sm mb-4">
                  Join the public rooms for {slug} truth and dares.
                </p>
                <Link href={`/truth-dare/${slug}/public`} className="w-full">
                  <Button variant="outline" className="w-full font-semibold   ">
                    Play Online
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center">
                <DoorOpen className="w-10 h-10  text-green-300 mb-2" />
                <p className="text-muted-foreground text-sm mb-4">
                  Join the private rooms created by your friend.
                </p>
                <JoinRoomDialog />
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryPlay;
