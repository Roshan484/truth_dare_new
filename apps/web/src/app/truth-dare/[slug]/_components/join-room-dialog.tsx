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
import { useForm } from "react-hook-form";
import { useAuth } from "@/providers/auth-provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const joinSchema = z.object({
  joinCode: z.string().min(4, "Code must be at least 4 characters"),
  userId: z.string().nonempty("User ID is required"),
});

type JoinRoom = z.infer<typeof joinSchema>;

export function JoinRoomDialog() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<JoinRoom>({
    defaultValues: {
      joinCode: "",
      userId: user?.id ?? "",
    },
    resolver: zodResolver(joinSchema),
  });

  const joinMutation = useMutation({
    mutationFn: async (data: JoinRoom) => {
      const response = await fetch(
        "http://localhost:3000/api/room-member/join-private",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to join room");
      }

      return response.json();
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: ["room-members", response.data.room.id],
      });

      toast.success("Successfully joined the room!");
      router.push(
        `/waiting-room/${response.data.room.categorySlug}/${response.data.room.name}/${response.data.room.id}`
      );
    },
    onError: (error: any) => {
      toast.error(error.message || "Something went wrong");
    },
  });

  const handleJoinRoom = handleSubmit((data) => {
    joinMutation.mutateAsync(data);
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full font-semibold">
          Join a Room
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">Join a Room</DialogTitle>
          <DialogDescription>
            Enter the room code to join an existing game.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleJoinRoom} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="joinCode" className="text-right">
              Room Code
            </Label>
            <div className="col-span-3">
              <Input
                id="joinCode"
                {...register("joinCode")}
                placeholder="Enter room code"
              />
              {errors.joinCode && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.joinCode.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isSubmitting || joinMutation.isPending}
              className="w-full text-sm"
            >
              {joinMutation.isPending ? "Joining..." : "Join Room"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
