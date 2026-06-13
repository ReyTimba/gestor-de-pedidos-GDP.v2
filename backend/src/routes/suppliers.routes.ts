import { Router } from "express";
import { getActivesSuppliers } from "../controllers/supplier.controllers";

export const supplierRouter = Router();

supplierRouter.get("/", getActivesSuppliers)