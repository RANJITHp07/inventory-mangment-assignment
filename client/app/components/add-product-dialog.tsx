"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface AddProductDialogProps {
    children: React.ReactNode,
    action?: string,
    product?: any
    fetchProducts?: any
}

export function AddProductDialog({ children, action, product, fetchProducts }: AddProductDialogProps) {
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: product?.name ?? "",
        sku: product?.sku ?? "",
        category: product?.category ?? "",
        quantity: product?.quantity ?? "",
        price: product?.price ?? "",
        description: product?.description ?? "",
        minStock: product?.minStock ?? "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        try {
            e.preventDefault()

            if (product) {
                const response = await fetch(`http://localhost:8000/api/products/${product.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Error:", errorData.error);
                    // handle error: show message to user, etc.
                    return;
                }

                const createdProduct = await response.json();
                console.log("edit created:", createdProduct);
                fetchProducts()
                alert("Product edited successfully!")
            } else {
                const response = await fetch("http://localhost:8000/api/products", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Error:", errorData.error);
                    // handle error: show message to user, etc.
                    return;
                }

                const createdProduct = await response.json();
                console.log("Product created:", createdProduct);
                window.location.reload()
                alert("Product saved successfully!")
            }
            // In Remix, this would be handled by an action
            setOpen(false)
            // Reset form
            setFormData({
                name: "",
                sku: "",
                category: "",
                quantity: "",
                price: "",
                description: "",
                minStock: "",
            })
        } catch (error) {

            console.log(error)
        }

    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter product name"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sku">SKU</Label>
                            <Input
                                id="sku"
                                value={formData.sku}
                                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                placeholder="Enter SKU"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
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
                                type="number"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                placeholder="0"
                                min="0"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Price ($)</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="0.00"
                                min="0"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="minStock">Min Stock</Label>
                            <Input
                                id="minStock"
                                type="number"
                                value={formData.minStock}
                                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                                placeholder="10"
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Enter product description"
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">{product ? "Edit Product" : "Add Product"}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
