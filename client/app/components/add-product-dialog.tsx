import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useFetcher } from "@remix-run/react"


interface AddProductDialogProps {
    children: React.ReactNode,
    product?: {
        id: string
        name: string
        quantity: number
        price: number
        category: string
        minStock: number
        sku: string
        description: string
    }

}

export function AddProductDialog({ children, product }: AddProductDialogProps) {
    const fetcher = useFetcher();
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (fetcher.state === "idle" && (fetcher?.data as any)?.success) {
            setOpen(false);
            alert((fetcher?.data as any)?.message)

            fetcher.load("/");
        }
    }, [fetcher.state, fetcher.data]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>

                <fetcher.Form method="post" action="." className=" space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Enter product name"
                                defaultValue={product?.name}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sku">SKU</Label>
                            <Input
                                id="sku"
                                name="sku"
                                defaultValue={product?.sku}
                                placeholder="Enter SKU"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select name="category" defaultValue={product?.category}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ELECTRONICS">Electronics</SelectItem>
                                <SelectItem value="KITCHEN">Kitchen</SelectItem>
                                <SelectItem value="OFFICE">Office</SelectItem>
                                <SelectItem value="SPORTS">Sports</SelectItem>
                                <SelectItem value="CLOTHING">Clothing</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                                id="quantity"
                                name="quantity"
                                type="number"
                                placeholder="0"
                                min="0"
                                required
                                defaultValue={product?.quantity}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Price ($)</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                min="0"
                                defaultValue={product?.price}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="minStock">Min Stock</Label>
                            <Input
                                id="minStock"
                                name="minStock"
                                type="number"
                                placeholder="10"
                                min="0"
                                defaultValue={product?.minStock}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Enter product description"
                            rows={3}
                            defaultValue={product?.description}
                        />
                    </div>
                    <input type="hidden" name="intent" value={product ? 'edit' : "add"} />
                    <input type="hidden" name="productId" value={product ? product.id : ""} />

                    < div className="flex justify-end gap-2 pt-4">
                        <Button type="button" disabled={fetcher.state === "submitting"} variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={fetcher.state === "submitting"}>
                            {fetcher.state === "submitting"
                                ? "Submitting..."
                                : product
                                    ? "Edit Product"
                                    : "Add Product"}
                        </Button>
                    </div>
                </fetcher.Form>
            </DialogContent >
        </Dialog >
    )
}
