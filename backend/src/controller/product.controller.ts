import { Decimal } from "@prisma/client/runtime/library";
import { Request, Response } from "express";
import prisma from "../../prisma/seed";


export const createProduct= async (req:Request, res:Response) => {
    try {
      const {
        name,
        sku,
        description,
        category,
        quantity,
        price,
        minStock,
      } = req.body;
  
      // Basic validation: check all required fields
      if (
        !name ||
        !sku ||
        !description ||
        !category ||
        quantity == null ||
        price == null ||
        minStock == null
      ) {
        return res.status(400).json({success:false, error: "Missing required fields" });
      }
  
      // Check if product with SKU already exists
      const existingProduct = await prisma.product.findUnique({
        where: { sku },
      });
  
      if (existingProduct) {
        return res.status(409).json({success:false, error: "Product with this SKU already exists" });
      }
  
      // Create new product
      const product = await prisma.product.create({
        data: {
          name,
          sku,
          description,
          category:category.toUpperCase(),
          quantity: Number(quantity),
          price: Number(price),
          status:Number(quantity)>Number(minStock) ? "IN_STOCK" : "LOW_STOCK",
          minStock: Number(minStock),
        },
      });
  
      res.status(201).json({success:true,data:product});
    } catch (error) {
      console.error(error);
      res.status(500).json({success:false, error: "Server error" });
    }
  };

export const getProducts = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
  
      // Get total count
      const total = await prisma.product.count();
  
      // Get products with pagination
      const products = await prisma.product.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      });
  
      res.status(200).json({
        success: true,
        data: products,
        pagination: {
          totalItems: total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          pageSize: limit,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  };  


  export const deleteProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
  
    try {
      // Check if product exists
      const existingProduct = await prisma.product.findUnique({
        where: { id: Number(id) },
      });
  
      if (!existingProduct) {
        return res.status(404).json({ success: false, error: "Product not found" });
      }
  
      // Delete product
      await prisma.product.delete({
        where: { id: Number(id) },
      });
  
      res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  }; 


 export const editProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // assuming product id is passed as URL param
    const {
      name,
      sku,
      description,
      category,
      quantity,
      price,
      minStock,
    } = req.body;

    // Basic validation: check all required fields (optional, adjust as needed)
    if (
      !name ||
      !sku ||
      !description ||
      !category ||
      quantity == null ||
      price == null ||
      minStock == null
    ) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!existingProduct) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    // Optional: Check if SKU is changing and if the new SKU already exists on a different product
    if (sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku },
      });
      if (skuExists) {
        return res.status(409).json({ success: false, error: "Product with this SKU already exists" });
      }
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name,
        sku,
        description,
        category: category.toUpperCase(),
        quantity: Number(quantity),
        price: Number(price),
        status: Number(quantity) > Number(minStock) ? "IN_STOCK" : "LOW_STOCK",
        minStock: Number(minStock),
      },
    });

    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
}; 


export const getProductSummary = async (req: Request, res: Response) => {
  try {
    // Total quantity
    const totalQuantityResult = await prisma.product.aggregate({
      _sum: {
        quantity: true,
      },
    });

 // Fetch all products with the fields you need
const products:any = await prisma.product.findMany({
  select: {
    price: true,
    quantity: true,
    minStock: true,
  },
});

const totalValue = products.reduce((sum:number, p:any) => {
  const price = p.price instanceof Decimal ? p.price.toNumber() : Number(p.price ?? 0);
  const quantity = Number(p.quantity ?? 0);
  return sum + price * quantity;
}, 0);

// Calculate lowStock count (quantity > 0 && quantity <= minStock)
const lowStockCount = products.filter(
  (p:any) => p.quantity > 0 && p.quantity < p.minStock
).length;


    // Out of stock count (quantity = 0)
    const outOfStockCount = await prisma.product.count({
      where: {
        quantity: 0,
      },
    });

    res.json({
      success: true,
      data: {
        totalQuantity: totalQuantityResult._sum.quantity ?? 0,
        totalValue:totalValue ?? 0,
        lowStockCount: lowStockCount ?? 0,
        outOfStockCount,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};