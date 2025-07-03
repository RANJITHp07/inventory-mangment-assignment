import { Button } from "../ui/button";

export function ProductsErrorFallback() {
    return (
        <div className="text-center py-8">
            <p className="text-gray-500">Failed to load products</p>
            <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="mt-2"
            >
                Retry
            </Button>
        </div >
    )
}
