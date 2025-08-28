import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Room } from "@/types/room";
import { Badge } from "../ui/badge";
import { User, Users } from "lucide-react";
import { Button } from "../ui/button";

const RoomCard = ({ room }: { room: Room }) => {
  return (
    <Card
      key={room.id}
      className="hover:shadow-md transition-shadow h-fit py-2"
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{room.name}</CardTitle>
          <Badge variant="secondary" className="ml-2">
            {room.categoryName}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 py-2">
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

        <div className="pt-2">
          <Button className="w-full" size="sm">
            "Join Room"
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomCard;
