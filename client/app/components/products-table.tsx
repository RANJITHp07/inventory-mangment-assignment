import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pen, Trash } from "lucide-react"
import { AddProductDialog } from "./add-product-dialog"
import { Product } from "@/routes/_index"
import { useSearchParams } from "@remix-run/react";
import { useFetcher } from "@remix-run/react"
import { useEffect } from "react"

type Props = {
    products: Product[],
    pagination:
    {
        totalItems: number
        totalPages: number
        currentPage: number
        pageSize: number
    }
}

export function ProductsTable({ products, pagination }: Props) {
    const fetcher = useFetcher();
    const [searchParams, setSearchParams] = useSearchParams();

    const currentPage = Number(searchParams.get("page") || 1);

    const handleSetPage = (page: number) => {
        searchParams.set("page", String(page));
        setSearchParams(searchParams);
    };

    const handleNextPage = () => {
        const nextPage = currentPage + 1;
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.set("page", String(nextPage));
        setSearchParams(newSearchParams);
    };

    const handlePreviousPage = () => {
        const prevPage = Math.max(1, currentPage - 1);
        searchParams.set("page", String(prevPage));
        setSearchParams(searchParams);
    };

    const getStatusBadge = (minStock: number, quantity: number) => {
        if (quantity === 0) {
            return <Badge variant="destructive">Out of Stock</Badge>
        } else if (quantity < minStock) {
            return (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Low Stock
                </Badge>
            )
        } else {
            return (
                <Badge variant="default" className="bg-green-100 text-green-800">
                    In Stock
                </Badge>
            )
        }
    }

    useEffect(() => {
        if (fetcher.state === "idle" && (fetcher?.data as any)?.success) {
            alert((fetcher?.data as any)?.message)

            fetcher.load("/");
        }
    }, [fetcher.state, fetcher.data]);


    return (
        <div className="mt-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[50px]">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products?.map((product: any) => (
                        <TableRow key={product.id}>
                            <TableCell className="font-medium">{product?.name}</TableCell>
                            <TableCell className="text-muted-foreground">{product?.sku}</TableCell>
                            <TableCell>{product?.category.charAt(0).toUpperCase() + product.category.slice(1).toLowerCase()}</TableCell>
                            <TableCell>{product?.quantity}</TableCell>
                            <TableCell>${product?.price}</TableCell>
                            <TableCell>{getStatusBadge(product?.minStock, product?.quantity)}</TableCell>
                            <TableCell>
                                <div className="flex flex-row gap-4">
                                    <AddProductDialog product={product}>
                                        <Pen className="h-5 w-5 text-slate-600 cursor-pointer" />
                                    </AddProductDialog>
                                    <fetcher.Form method="post" action="/?index">
                                        <input type="hidden" name="intent" value="delete" />
                                        <input type="hidden" name="productId" value={product.id} />
                                        <button type="submit">
                                            <Trash className="w-4 h-4 text-red-500 cursor-pointer" />
                                        </button>
                                    </fetcher.Form>
                                </div>

                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-2 py-4">
                <div className="flex items-center space-x-2">
                    {/* <p className="text-sm text-muted-foreground">
                        Total Items {totalItems}
                    </p> */}
                </div>

                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePreviousPage}
                            disabled={pagination.currentPage <= 1}
                        >
                            Previous
                        </Button>

                        <div className="flex items-center space-x-1">
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                ?.filter((page) => {
                                    return page === 1 || page === pagination.totalPages || Math.abs(page - pagination.currentPage) <= 1
                                })
                                ?.map((page, index, array) => {
                                    // Add ellipsis if there's a gap
                                    const showEllipsis = index > 0 && page - array[index - 1] > 1
                                    return (
                                        <div key={page} className="flex items-center">
                                            {showEllipsis && <span className="px-2 text-muted-foreground">...</span>}
                                            <Button
                                                variant={pagination.currentPage === page ? "default" : "outline"}
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => handleSetPage(page)}
                                            >
                                                {page}
                                            </Button>
                                        </div>
                                    )
                                })}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.preventDefault();
                                handleNextPage();
                            }}
                            disabled={pagination.currentPage >= pagination.totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div >
    )
}
