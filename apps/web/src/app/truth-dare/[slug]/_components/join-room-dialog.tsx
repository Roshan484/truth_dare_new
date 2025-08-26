"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

interface JoinRoomDialogProps {
  category: string;
}

export function JoinRoomDialog({ category }: JoinRoomDialogProps) {
  const [roomCode, setRoomCode] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const router = useRouter();

  const handleJoinRoom = () => {
    if (roomCode) {
      router.push(`/waiting-room/${category}/${roomCode}`);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full font-semibold ">
          Join a Room
        </Button>
      </DialogTrigger>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle className="text-2xl">Join a Room</DialogTitle>
          <DialogDescription className="">
            Enter the room code to join an existing game.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="roomCode" className="text-right ">
              Room Code
            </Label>
            <Input
              id="roomCode"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="col-span-3 "
              placeholder="Enter room code"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleJoinRoom} className="w-full text-sm">
            Join Room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
