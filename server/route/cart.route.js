import { Router } from "express";
import auth from "../middleware/auth.js";
import {
  addToCartItemController,
  deleteCartItemQtyController,
  getCartItemController,
  updateCartItemQtyController,
  validateCartForCheckout,
} from "../controllers/cart.controller.js";

const cartRouter = Router();

cartRouter.post("/create", auth, addToCartItemController);
cartRouter.get("/get", auth, getCartItemController);
cartRouter.put("/update-qty", auth, updateCartItemQtyController);
cartRouter.delete(
  "/delete-cart-item",
  auth,
  deleteCartItemQtyController
);
cartRouter.post("/validate-checkout", auth, validateCartForCheckout);

export default cartRouter;