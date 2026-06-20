import { Card, Skeleton } from './ui'

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-4 h-10 w-72" />
        <Skeleton className="mt-3 h-5 w-96" />
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => <Skeleton key={item} className="h-32 rounded-[1.5rem]" />)}
      </div>
    </div>
  )
}
