import express, { Response,Request } from "express";
import { createProduct, deleteProduct, editProduct, getProducts, getProductSummary } from "../controller/product.controller";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
    await createProduct(req, res);
  });

router.get("/", async (req: Request, res: Response) => {
    await getProducts(req, res);
  }); 

  router.put("/:id", async (req: Request, res: Response) => {
    await editProduct(req, res);
  }); 


  router.delete("/:id", async (req: Request, res: Response) => {
    await deleteProduct(req, res);
  });

router.get("/summary",async (req: Request, res: Response) => {
  await getProductSummary(req, res);
})


export default router
