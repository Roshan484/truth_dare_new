import { useMutation } from "@tanstack/react-query";

export const useCreateRoomMutation = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("http://localhost:3000/api/rooms", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
      });
    },
  });
};
