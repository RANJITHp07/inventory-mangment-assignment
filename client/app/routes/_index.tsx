import { Suspense } from "react"
import { DashboardStats } from "@/components/dashboard-stats"
import { LowStockAlerts } from "@/components/low-stock-alerts"
import { ProductsTable } from "@/components/products-table"
import { AddProductDialog } from "@/components/add-product-dialog"
import { SearchAndFilters } from "@/components/search-and-filters"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { LoaderFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"



type Stats = {
  totalQuantity: number
  totalValue: number
  lowStock: number
  outOfStock: number
}


export const loader: LoaderFunction = async () => {
  // Call your separate backend API endpoint here
  try {
    const res = await fetch("http://localhost:8000/api/products/summary")
    if (!res.ok) {
      throw new Response("Failed to fetch product stats", { status: res.status })
    }
    const data: {
      data: Stats
    } = await res.json()

    return json(data.data);
  } catch (error) {
    return {
      totalQuantity: 0,
      totalValue: 0,
      lowStock: 0,
      outOfStock: 0,
    }
  }
}

export default function InventoryDashboard() {
  const stats = useLoaderData<Stats>()
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600 mt-1">Manage your products and track inventory levels</p>
          </div>
          <AddProductDialog>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </AddProductDialog>
        </div>

        {/* Dashboard Stats */}
        <Suspense fallback={<div className="h-32 bg-white rounded-lg animate-pulse" />}>
          <DashboardStats stats={stats} />
        </Suspense>

        <div className="grid grid-cols-1  gap-6 mt-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Products</h2>
              </div>
              <div className="p-6 w-full">
                <SearchAndFilters />
                <Suspense fallback={<div className="h-64 bg-gray-100 rounded animate-pulse mt-4" />}>
                  <ProductsTable />
                </Suspense>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          {/* <div className="space-y-6">
            <Suspense fallback={<div className="h-48 bg-white rounded-lg animate-pulse" />}>
              <LowStockAlerts />
            </Suspense>
          </div> */}
        </div>
      </div>
    </div>
  )
}
