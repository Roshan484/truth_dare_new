import { Skeleton } from "@/components/ui/skeleton";

export default function FormSkeleton() {
  return (
    <div className="flex  overflow-y-hidden items-center h-full justify-center mx-auto w-full px-2 ">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left Panel - Illustration Section */}
        <div className="flex flex-col items-center justify-center p-8 lg:p-16 bg-slate-800/50 border-r ">
          {/* Illustration placeholder */}
          <div className="relative mb-8">
            <Skeleton className="w-80 h-80 rounded-2xl bg-slate-700/50" />
            {/* Phone mockup skeleton */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Skeleton className="w-32 h-56 rounded-2xl bg-slate-600/80" />
            </div>
            {/* Character skeleton */}
            <div className="absolute left-8 bottom-12">
              <Skeleton className="w-16 h-24 rounded-lg bg-slate-600/60" />
            </div>
          </div>

          {/* Welcome text skeleton */}
          <div className="text-center space-y-4">
            <Skeleton className="h-10 w-72 mx-auto bg-slate-600/50" />
            <Skeleton className="h-6 w-80 mx-auto bg-slate-600/30" />
          </div>
        </div>

        {/* Right Panel - Form Section */}
        <div className="flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-md space-y-8">
            {/* Header skeleton */}
            <div className="text-center space-y-4">
              <Skeleton className="h-10 w-56 mx-auto bg-slate-700/50" />
              <Skeleton className="h-5 w-80 mx-auto bg-slate-700/30" />
            </div>

            {/* Form skeleton */}
            <div className="space-y-6">
              {/* Email field */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-12 bg-slate-700/50" />
                <Skeleton className="h-12 w-full rounded-lg bg-slate-800/80 border border-slate-700/50" />
              </div>

              {/* Password field */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-20 bg-slate-700/50" />
                <Skeleton className="h-12 w-full rounded-lg bg-slate-800/80 border border-slate-700/50" />
              </div>

              {/* Sign in button */}
              <Skeleton className="h-12 w-full rounded-lg bg-cyan-500/20" />

              {/* Divider */}
              <div className="flex items-center space-x-4">
                <Skeleton className="h-px flex-1 bg-slate-700/50" />
                <Skeleton className="h-4 w-24 bg-slate-700/30" />
                <Skeleton className="h-px flex-1 bg-slate-700/50" />
              </div>

              {/* Google button */}
              <Skeleton className="h-12 w-full rounded-lg bg-slate-800/60 border border-slate-700/50" />

              {/* Sign up link */}
              <div className="text-center pt-4">
                <Skeleton className="h-4 w-48 mx-auto bg-slate-700/40" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
