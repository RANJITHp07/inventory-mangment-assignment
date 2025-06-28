"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, Pen, Trash } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddProductDialog } from "./add-product-dialog"
import { BACKEND_API_URL } from "@/lib/constant"

// Mock data - in Remix this would come from a loader
const products = [
    {
        id: "1",
        name: "Wireless Headphones",
        sku: "WH-001",
        category: "Electronics",
        quantity: 45,
        price: 99.99,
        status: "In Stock",
    },
    {
        id: "2",
        name: "Coffee Mug",
        sku: "CM-002",
        category: "Kitchen",
        quantity: 8,
        price: 12.99,
        status: "Low Stock",
    },
    {
        id: "3",
        name: "Laptop Stand",
        sku: "LS-003",
        category: "Office",
        quantity: 0,
        price: 49.99,
        status: "Out of Stock",
    },
    {
        id: "4",
        name: "Desk Lamp",
        sku: "DL-004",
        category: "Office",
        quantity: 23,
        price: 34.99,
        status: "In Stock",
    },
    {
        id: "5",
        name: "Water Bottle",
        sku: "WB-005",
        category: "Sports",
        quantity: 67,
        price: 19.99,
        status: "In Stock",
    },
    {
        id: "6",
        name: "Bluetooth Speaker",
        sku: "BS-006",
        category: "Electronics",
        quantity: 32,
        price: 79.99,
        status: "In Stock",
    },
    {
        id: "7",
        name: "Yoga Mat",
        sku: "YM-007",
        category: "Sports",
        quantity: 15,
        price: 29.99,
        status: "In Stock",
    },
    {
        id: "8",
        name: "Phone Case",
        sku: "PC-008",
        category: "Electronics",
        quantity: 3,
        price: 24.99,
        status: "Low Stock",
    },
    {
        id: "9",
        name: "Notebook Set",
        sku: "NS-009",
        category: "Office",
        quantity: 89,
        price: 15.99,
        status: "In Stock",
    },
    {
        id: "10",
        name: "Kitchen Scale",
        sku: "KS-010",
        category: "Kitchen",
        quantity: 0,
        price: 39.99,
        status: "Out of Stock",
    },
    {
        id: "11",
        name: "Wireless Mouse",
        sku: "WM-011",
        category: "Electronics",
        quantity: 56,
        price: 29.99,
        status: "In Stock",
    },
    {
        id: "12",
        name: "Travel Mug",
        sku: "TM-012",
        category: "Kitchen",
        quantity: 7,
        price: 22.99,
        status: "Low Stock",
    },
    {
        id: "13",
        name: "Desk Organizer",
        sku: "DO-013",
        category: "Office",
        quantity: 41,
        price: 18.99,
        status: "In Stock",
    },
    {
        id: "14",
        name: "Fitness Tracker",
        sku: "FT-014",
        category: "Sports",
        quantity: 28,
        price: 149.99,
        status: "In Stock",
    },
    {
        id: "15",
        name: "USB Cable",
        sku: "UC-015",
        category: "Electronics",
        quantity: 0,
        price: 9.99,
        status: "Out of Stock",
    },
    {
        id: "16",
        name: "Ceramic Bowl",
        sku: "CB-016",
        category: "Kitchen",
        quantity: 34,
        price: 16.99,
        status: "In Stock",
    },
    {
        id: "17",
        name: "Pen Holder",
        sku: "PH-017",
        category: "Office",
        quantity: 9,
        price: 8.99,
        status: "Low Stock",
    },
    {
        id: "18",
        name: "Resistance Bands",
        sku: "RB-018",
        category: "Sports",
        quantity: 22,
        price: 19.99,
        status: "In Stock",
    },
    {
        id: "19",
        name: "Tablet Stand",
        sku: "TS-019",
        category: "Electronics",
        quantity: 18,
        price: 35.99,
        status: "In Stock",
    },
    {
        id: "20",
        name: "Cutting Board",
        sku: "CB-020",
        category: "Kitchen",
        quantity: 12,
        price: 25.99,
        status: "In Stock",
    },
]

export function ProductsTable() {
    const [products, setProducts] = useState<string[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalPages, settotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [isDeleted, setIsDeleted] = useState(true)


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

    const fetchProducts = () => {
        fetch(`${BACKEND_API_URL}/products?page=${currentPage}& limit= 10`)
            .then((res) => res.json())
            .then((data) => {
                setProducts(data.data);
                settotalPages(data?.pagination?.totalPages)
                setTotalItems(data?.pagination?.totalItems)

            })
            .catch((error) => {
                console.error("Error fetching products:", error);
            });
    }

    const deleteProduct = async (id: string) => {
        const response = await fetch(`${BACKEND_API_URL}/products/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error:", errorData.error);
            // handle error: show message to user, etc.
            return;
        }

        fetchProducts()
        alert("Product deleted successfully!")
    }

    useEffect(() => {
        fetchProducts()
    }, [currentPage]);


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
                    {products.map((product: any) => (
                        <TableRow key={product.id}>
                            <TableCell className="font-medium">{product?.name}</TableCell>
                            <TableCell className="text-muted-foreground">{product?.sku}</TableCell>
                            <TableCell>{product?.category.charAt(0).toUpperCase() + product.category.slice(1).toLowerCase()}</TableCell>
                            <TableCell>{product?.quantity}</TableCell>
                            <TableCell>${product?.price}</TableCell>
                            <TableCell>{getStatusBadge(product?.minStock, product?.quantity)}</TableCell>
                            <TableCell>
                                <div className="flex flex-row gap-4">
                                    <AddProductDialog product={product} fetchProducts={fetchProducts}>
                                        <Pen className="h-5 w-5 text-slate-600 cursor-pointer" />
                                    </AddProductDialog>
                                    <Trash className="h-5 w-5 text-slate-600 cursor-pointer" onClick={() => deleteProduct(product.id)} />
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
                    {/* <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">Rows per page</p>
                        <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent side="top">
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                    </div> */}

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage <= 1}
                        >
                            Previous
                        </Button>

                        <div className="flex items-center space-x-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter((page) => {
                                    // Show first page, last page, current page, and pages around current
                                    return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
                                })
                                .map((page, index, array) => {
                                    // Add ellipsis if there's a gap
                                    const showEllipsis = index > 0 && page - array[index - 1] > 1
                                    return (
                                        <div key={page} className="flex items-center">
                                            {showEllipsis && <span className="px-2 text-muted-foreground">...</span>}
                                            <Button
                                                variant={currentPage === page ? "default" : "outline"}
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => setCurrentPage(page)}
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
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div >
    )
}
