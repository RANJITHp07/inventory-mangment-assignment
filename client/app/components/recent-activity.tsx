import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

// Mock data - in Remix this would come from a loader
const activities = [
    {
        id: "1",
        action: "Stock Updated",
        product: "Wireless Headphones",
        quantity: "+25",
        time: "2 hours ago",
        type: "increase",
    },
    {
        id: "2",
        action: "New Product",
        product: "Smart Watch",
        quantity: "50",
        time: "4 hours ago",
        type: "new",
    },
    {
        id: "3",
        action: "Stock Sold",
        product: "Coffee Mug",
        quantity: "-12",
        time: "6 hours ago",
        type: "decrease",
    },
    {
        id: "4",
        action: "Price Updated",
        product: "Laptop Stand",
        quantity: "$49.99",
        time: "1 day ago",
        type: "update",
    },
]

export function RecentActivity() {
    const getActivityBadge = (type: string) => {
        switch (type) {
            case "increase":
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        +
                    </Badge>
                )
            case "decrease":
                return <Badge variant="destructive">-</Badge>
            case "new":
                return (
                    <Badge variant="default" className="bg-blue-100 text-blue-800">
                        New
                    </Badge>
                )
            case "update":
                return <Badge variant="secondary">Edit</Badge>
            default:
                return <Badge variant="secondary">-</Badge>
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        {getActivityBadge(activity.type)}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{activity.action}</p>
                            <p className="text-sm text-muted-foreground truncate">{activity.product}</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                        <div className="text-sm font-medium">{activity.quantity}</div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
