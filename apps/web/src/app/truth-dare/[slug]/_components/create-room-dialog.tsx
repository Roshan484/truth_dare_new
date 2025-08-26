"use client";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import z from "zod";
import { useAuth } from "@/providers/auth-provider";

const createRoomSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters long.")
    .max(10, "Name cannot be more than 15 characters long."),
  limit: z
    .number()
    .min(2, "Player limit must be at least 2")
    .max(8, "Player limit cannot exceed 8"),
  isPublic: z.boolean(),
  createdBy: z.string(),
  categorySlug: z.string(),
});

type CreateRoomForm = z.infer<typeof createRoomSchema>;

interface CreateRoomResponse {
  message: string;
  data: {
    room: {
      id: string;
      name: string;
      isPublic: boolean;
      limit: number;
      joinCode?: string;
      categorySlug: string;
      createdBy: string;
      createdAt: string;
      updatedAt: string;
    };
    joinCode?: string;
  };
}

export function CreateRoomDialog({ categorySlug }: { categorySlug: string }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const router = useRouter();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateRoomForm>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      name: "",
      limit: 2,
      isPublic: true,
      createdBy: user?.id,
      categorySlug: categorySlug,
    },
  });

  const isPublic = watch("isPublic");

  const createRoomMutation = useMutation({
    mutationFn: async (data: CreateRoomForm): Promise<CreateRoomResponse> => {
      const response = await fetch("http://localhost:3000/api/rooms", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw error;
      }

      return response.json();
    },
    onSuccess: (response) => {
      setOpen(false);
      reset();
      router.push(
        `/waiting-room/${response.data.room.categorySlug}/${response.data.room.name}/${response.data.room.id}`
      );
    },
    onError: (error: any) => {
      if (error.code === "DUPLICATE_ROOM_NAME") {
        setError("name", {
          type: "server",
          message: error.error,
        });
      }
    },
  });

  const onSubmit = (data: CreateRoomForm) => {
    createRoomMutation.mutateAsync(data);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      reset();
      createRoomMutation.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full font-semibold">
          Create a Room
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">Create a Room</DialogTitle>
          <DialogDescription>
            Set up a new room for your friends to join.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="name" className="text-right text-nowrap pb-2">
                Room Name
              </Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="name"
                    type="text"
                    placeholder="Enter room name"
                    className={errors.name ? "border-red-500" : ""}
                  />
                )}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-right text-nowrap pb-2">Room Type</Label>
              <Controller
                name="isPublic"
                control={control}
                render={({ field }) => (
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant={field.value ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => field.onChange(true)}
                    >
                      Public
                    </Button>
                    <Button
                      type="button"
                      variant={!field.value ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => field.onChange(false)}
                    >
                      Private
                    </Button>
                  </div>
                )}
              />
              <p className="text-sm text-gray-500 mt-1">
                {isPublic
                  ? "Anyone can see and join this room"
                  : "Only people with the join code can join"}
              </p>
            </div>

            <div>
              <Label htmlFor="limit" className="text-right text-nowrap pb-2">
                Player Limit (2-8)
              </Label>
              <Controller
                name="limit"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="limit"
                    className={`w-full ${errors.limit ? "border-red-500" : ""}`}
                    type="number"
                    min="2"
                    max="8"
                    placeholder="2"
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 2)
                    }
                  />
                )}
              />
              {errors.limit && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.limit.message}
                </p>
              )}
            </div>
          </div>

          {createRoomMutation.isError &&
            createRoomMutation.error?.code !== "DUPLICATE_ROOM_NAME" && (
              <Alert className="mb-4" variant="destructive">
                <AlertDescription>
                  {createRoomMutation.error?.error ||
                    createRoomMutation.error?.message ||
                    "Failed to create room. Please try again."}
                </AlertDescription>
              </Alert>
            )}

          <DialogFooter>
            <Button
              type="submit"
              className="w-full text-sm"
              disabled={createRoomMutation.isPending}
            >
              {createRoomMutation.isPending
                ? "Creating Room..."
                : "Create Room"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
