import { Router } from "express"
import { createProduct, deleteProduct, getProduct, updateProduct } from "../controller/product.controller"

const productRouter = Router()

productRouter.get('/', getProduct)
productRouter.post('/', createProduct)
productRouter.put('/:id', updateProduct)
productRouter.delete('/:id', deleteProduct)

export default productRouter
