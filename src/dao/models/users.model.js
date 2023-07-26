import mongoose from "mongoose";
import cartsModel from "./carts.model.js";
import productsModel from "./products.model.js";

const userCollection = "users";

const roleType = {
  USER: "USER",
  ADMIN: "ADMIN",
  PUBLIC: "PUBLIC",
};

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true, minLength: 3, maxLength: 60 },
  last_name: { type: String, required: true, minLength: 3, maxLength: 60 },
  email: { type: String, required: true, unique: true, index: true },
  age: { type: Number, required: true, min: 18, max: 100 },
  password: { type: String },
  role: {
    type: String,
    enum: Object.values(roleType),
    default: roleType.USER,
  },
  cart: { type: mongoose.Schema.Types.ObjectId, ref: "carts" },
  cartHistory: [
    {
      cartId: { type: mongoose.Schema.Types.ObjectId, ref: "carts" },
      date: { type: Date, default: Date.now },
    },
  ],
});

userSchema.methods.realizarCompra = async function () {
  try {
    const cart = await cartsModel.findById(this.cart);
    if (!cart) {
      throw new Error("El carrito no existe");
    }

    for (const cartItem of cart.products) {
      const product = await productsModel.findById(cartItem.product);
      if (!product) {
        throw new Error(`El producto con ID ${cartItem.product} no existe`);
      }

      if (cartItem.quantity > product.stock) {
        throw new Error(
          `No hay suficiente stock para el producto ${product.title}`
        );
      }

      product.stock -= cartItem.quantity;
      await product.save();
    }

    return "Compra realizada exitosamente";
  } catch (error) {
    throw new Error(`Error al realizar la compra: ${error.message}`);
  }
};

userSchema.methods.createNewCart = async function () {
  try {
    const newCart = new cartsModel({ products: [], user: this._id });
    await newCart.save();
    this.cart = newCart._id;
    await this.save();
    return newCart;
  } catch (error) {
    throw new Error("Error al crear un nuevo carrito");
  }
};
const UserModel = mongoose.model(userCollection, userSchema);

export default UserModel;
