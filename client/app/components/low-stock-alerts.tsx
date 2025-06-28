import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"

// Mock data - in Remix this would come from a loader
const lowStockItems = [
    { id: "1", name: "Coffee Mug", quantity: 8, threshold: 10 },
    { id: "2", name: "Notebook", quantity: 5, threshold: 15 },
    { id: "3", name: "Pen Set", quantity: 3, threshold: 20 },
    { id: "4", name: "Mouse Pad", quantity: 7, threshold: 10 },
]

export function LowStockAlerts() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    Low Stock Alerts
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {lowStockItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {item.quantity} left (min: {item.threshold})
                            </p>
                        </div>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            {item.quantity}
                        </Badge>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
