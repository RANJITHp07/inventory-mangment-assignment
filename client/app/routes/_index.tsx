import { Suspense } from "react"
import { DashboardStats } from "@/components/dashboard-stats"
import { LowStockAlerts } from "@/components/low-stock-alerts"
import { ProductsTable } from "@/components/products-table"
import { AddProductDialog } from "@/components/add-product-dialog"
import { SearchAndFilters } from "@/components/search-and-filters"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ActionFunctionArgs, defer, LoaderFunction, LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Await, useLoaderData } from "@remix-run/react"
import { BACKEND_API_URL } from "@/lib/constant"
import { ProductsErrorFallback } from "@/components/fallbacks/productsErrorFallback"



type Stats = {
  totalQuantity: number
  totalValue: number
  lowStock: number
  outOfStock: number
}

export type Product = {
  id: string
  name: string
  quantity: number
  price: number
  category: string
  lowStockThreshold: number
}

type LoaderData = {
  stats: Stats
  productsPromise: Promise<{
    data: Product[],
    pagination: {
      totalItems: number
      totalPages: number
      currentPage: number
      pageSize: number
    }
  }>
}


//loader
export const loader: LoaderFunction = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const page = url.searchParams.get("page") || "1";
  const limit = url.searchParams.get("limit") || "10";

  const statsPromise = fetch(`${BACKEND_API_URL}/api/products/summary`, {
    headers: {
      'Cache-Control': 'max-age=300',
    }
  }).then(async (res) => {
    if (!res.ok) {
      throw new Response("Failed to fetch product stats", { status: res.status })
    }
    const data: { data: Stats } = await res.json()
    return data.data
  }).catch(() => ({
    totalQuantity: 0,
    totalValue: 0,
    lowStock: 0,
    outOfStock: 0,
  }))

  const productsPromise = fetch(
    `${BACKEND_API_URL}/api/products?page=${page}&limit=${limit}`,

  ).then(async (res) => {
    if (!res.ok) {
      throw new Error("Failed to fetch products")
    }
    const data = await res.json()
    return data || {
      data: [],
      pagination: {
        totalItems: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 0,

      }
    }
  })

  const stats = await statsPromise

  return defer({
    stats,
    productsPromise,
  })
}

//actions
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const entries = Object.fromEntries(formData.entries());

  const intent = formData.get("intent");
  const productId = formData.get("productId"); // if editing

  try {
    if (intent === "edit" && productId) {
      const response = await fetch(`${BACKEND_API_URL}/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entries)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error:", errorData.error);
        return json({
          success: false,
          error: errorData.error || "Failed to update product"
        }, { status: 400 });
      }

      const updatedProduct = await response.json();
      console.log("Product updated:", updatedProduct);

      return json({
        success: true,
        message: "Product updated successfully!",
        product: updatedProduct
      });

    } else if (intent === "add") {
      // Create new product
      const response = await fetch(`${BACKEND_API_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entries)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error:", errorData.error);
        return json({
          success: false,
          error: errorData.error || "Failed to create product"
        }, { status: 400 });
      }

      const createdProduct = await response.json();
      console.log("Product created:", createdProduct);

      return json({
        success: true,
        message: "Product created successfully!",
        product: createdProduct
      });
    } else if (intent === "delete" && productId) {
      const response = await fetch(`${BACKEND_API_URL}/api/products/${productId}`, {
        method: "DELETE",

      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error:", errorData.error);
        return json({
          success: false,
          error: errorData.error || "Failed to create product"
        }, { status: 400 });
      }

      const deletedProduct = await response.json();
      console.log("Product created:", deletedProduct);

      return json({
        success: true,
        message: "Product deleted successfully!",
      });
    }

  } catch (error) {
    console.error("Network error:", error);
    return json({
      success: false,
      error: "Network error occurred"
    }, { status: 500 });
  }

};


export default function InventoryDashboard() {
  const { stats, productsPromise } = useLoaderData<LoaderData>()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600 mt-1">Manage your products and track inventory levels</p>
          </div>
          <AddProductDialog>
            <Button onClick={() => console.log("Button clicked!")}>
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
                  <Await resolve={productsPromise} errorElement={<ProductsErrorFallback />}>
                    {(products: any) => <ProductsTable products={products.data} pagination={products.pagination} />}
                  </Await>
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  )
}
