import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
export default function WaitingRoomSkeleton() {
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <Skeleton className="h-9 w-80 mx-auto mb-2" />
          <Skeleton className="h-5 w-48 mx-auto mb-4" />
          <div className="flex items-center justify-center gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>

        <Card className="mb-6 border-2 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-6" />
                <div>
                  <Skeleton className="h-6 w-40 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[...Array(3)].map((_, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-24 mb-1" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="my-6">
          <CardContent className="p-6 text-center">
            <Skeleton className="h-8 w-8 mx-auto mb-3" />
            <Skeleton className="h-6 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto mb-4" />
            <Skeleton className="h-5 w-80 mx-auto" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
