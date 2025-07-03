import { Suspense } from "react"
import { DashboardStats } from "@/components/dashboard-stats"
import { ProductsTable } from "@/components/products-table"
import { AddProductDialog } from "@/components/add-product-dialog"
import { SearchAndFilters } from "@/components/search-and-filters"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ActionFunctionArgs, defer, LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Await, useLoaderData } from "@remix-run/react"
import { ProductsErrorFallback } from "@/components/fallbacks/productsErrorFallback"
import { db } from "prisma/seed"
import { Decimal } from "@prisma/client/runtime/library"



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
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  // 👇 Async fetch with pagination metadata included
  const productsPromise = (async () => {
    const [products, totalItems] = await Promise.all([
      db.product.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.product.count(),
    ]);

    const productsFormatted = products.map(product => ({
      ...product,
      price: product.price.toString(),  // convert Decimal to string
    }));

    return {
      data: productsFormatted,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        pageSize: limit,
      },
    };
  })();

  // 👇 Summary Promise
  const summaryPromise = (async () => {
    const totalQuantityResult = await db.product.aggregate({
      _sum: { quantity: true },
    });

    const products: any = await db.product.findMany({
      select: { price: true, quantity: true, minStock: true },
    });

    const totalValue = products.reduce((sum: number, p: any) => {
      const price = p.price instanceof Decimal ? p.price.toNumber() : Number(p.price ?? 0);
      const quantity = Number(p.quantity ?? 0);
      return sum + price * quantity;
    }, 0);

    const lowStockCount = products.filter(
      (p: any) => p.quantity > 0 && p.quantity < p.minStock
    ).length;

    const outOfStockCount = await db.product.count({
      where: { quantity: 0 },
    });

    return {
      totalQuantity: totalQuantityResult._sum.quantity ?? 0,
      totalValue,
      lowStockCount: lowStockCount,
      outOfStockCount: outOfStockCount,
    };
  })();

  return defer({
    productsPromise,
    stats: summaryPromise,
  });
};

//actions
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const data = Object.fromEntries(formData.entries());

  const intent = formData.get("intent");
  const productId = formData.get("productId"); // if editing

  try {
    if (intent === "edit" && productId) {
      const product = await db.product.update({
        where: { id: Number(productId) },
        data: {
          name: String(data.name),
          sku: String(data.sku),
          description: String(data.description),
          category: String(data.category).toUpperCase() as any,
          quantity: Number(data.quantity),
          price: Number(data.price),
          minStock: Number(data.minStock),
          status:
            Number(data.quantity) > Number(data.minStock)
              ? "IN_STOCK"
              : "LOW_STOCK",
        },
      });
      return json({ success: true, message: "Product updated successfully", product });

    } else if (intent === "add") {
      // Create new product
      const product = await db.product.create({
        data: {
          name: String(data.name),
          sku: String(data.sku),
          description: String(data.description),
          category: String(data.category).toUpperCase() as any,
          quantity: Number(data.quantity),
          price: Number(data.price),
          minStock: Number(data.minStock),
          status:
            Number(data.quantity) > Number(data.minStock)
              ? "IN_STOCK"
              : "LOW_STOCK",
        },
      });

      return json({
        success: true, message: "Product added successfully", product
      });
    } else if (intent === "delete" && productId) {
      await db.product.delete({
        where: { id: Number(productId) },
      });
      return json({ success: true, message: "Product deleted successfully" });
    }

    return json({ success: false, error: "Unknown intent" }, { status: 400 });

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
          <Await resolve={stats}>
            {(resolvedStats: Stats) => <DashboardStats stats={resolvedStats} />}
          </Await>
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
