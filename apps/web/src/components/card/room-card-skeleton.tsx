import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { User, Users } from "lucide-react";

const RoomCardSkeleton = () => {
  return (
    <Card className="hover:shadow-md transition-shadow h-fit py-2">
      <CardHeader>
        <div className="flex items-start justify-between">
          {/* Room name skeleton */}
          <div className="h-6 border border-border rounded animate-pulse w-32 opacity-60"></div>
          {/* Category badge skeleton */}
          <div className="h-5 border border-border rounded-full animate-pulse w-16 ml-2 opacity-60"></div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 py-2">
        {/* Creator info skeleton */}
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground opacity-50" />
          <div className="h-4 border border-border rounded animate-pulse w-28 opacity-60"></div>
        </div>

        {/* Participants info skeleton */}
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground opacity-50" />
          <div className="h-4 border border-border rounded animate-pulse w-36 opacity-60"></div>
        </div>

        {/* Join button skeleton */}
        <div className="pt-2">
          <div className="w-full h-8 border border-border rounded animate-pulse opacity-60"></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomCardSkeleton;
