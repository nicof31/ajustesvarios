import mongoose from "mongoose";

const cartsCollection = "carts";

const cartItemSchema = new mongoose.Schema({
  product: { type: Number, ref: "products", required: true },
  quantity: { type: Number, required: true },
  stock: { type: Number, required: true },
  price: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
});

const cartsSchema = new mongoose.Schema({
  products: [cartItemSchema],
  totalCartPrice: { type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
});

// Calculo el precio total de un item del carrito
cartItemSchema.methods.calculateTotalPrice = function () {
  this.totalPrice = this.quantity * this.price;
};

// Calculo el precio total del carrito
cartsSchema.methods.calculateTotalCartPrice = function () {
  this.totalCartPrice = this.products.reduce(
    (total, product) => total + product.totalPrice,
    0
  );
};

// Verifico el precio total del item antes de guardarlo en el carrito
cartItemSchema.pre("save", function (next) {
  this.calculateTotalPrice();
  next();
});

// Verifico el precio total del carrito antes de guardarlo
cartsSchema.pre("save", function (next) {
  this.calculateTotalCartPrice();
  next();
});

const cartsModel = mongoose.model(cartsCollection, cartsSchema);

export default cartsModel;
