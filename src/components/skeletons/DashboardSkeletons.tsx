import { Card, CardBody, CardHeader, Skeleton } from "@/components/ui"

export function StatCardSkeleton() {
    return (
        <Card>
            <CardBody className="p-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-32" />
                    </div>
                </div>
            </CardBody>
        </Card>
    )
}

export function StatsGridSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
        </div>
    )
}

export function RecentInvoicesSkeleton() {
    return (
        <Card className="min-h-[400px]">
            <CardHeader>
                <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardBody className="p-0">
                <div className="p-6 space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center justify-between gap-4">
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ))}
                </div>
            </CardBody>
        </Card>
    )
}

export function InvoicesTableSkeleton() {
    return (
        <Card>
            <CardBody className="p-0">
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between mb-6">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="flex flex-col space-y-2">
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ))}
                </div>
            </CardBody>
        </Card>
    )
}
