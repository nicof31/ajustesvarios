import mongoose from "mongoose";
import cartsModel from "../models/carts.model.js";
import productsModel from "../models/products.model.js";

export default class cartsManagerMongo {
  constructor(path) {
    this.path = path;
  }

  //--------------------GET CARTS---------------------
  carts = async () => {
    if (fs.existsSync(this.path)) {
      const dataCart = await fs.promises.readFile(this.path, "utf-8");
      const cartRta = JSON.parse(dataCart);
      return cartRta;
    } else {
      return [];
    }
  };

  //--------------------BUSQUEDA POR ID--------------------
  cartById = async (idCarts) => {
    try {
      const resultBusqC = await cartsModel.find({ _id: idCarts });
      return resultBusqC;
    } catch (error) {
      console.log(`No se puede porcesar la busqueda ${error}`);
      return error;
    }
  };

  //--------------------ADD CARTS---------------------

  addCartsRegister = async (userId) => {
    try {
      const newCart = await cartsModel.create({
        user: userId, 
        products: [],
      });
      return newCart;
    } catch (error) {
      console.error("Error en el registro de usuario:", error);
      throw error;
    }
  };

  addCartsPg = async (idCart, idProductAddCart, userId) => {
    try {

      const idUser = userId
      console.log("🚀 ~ file: cartsmanager.mongodb.js:123 ~ cartsManagerMongo ~ addCartsPg= ~ idUser:", idUser)
      // Busco si el producto existe en la base
      const cart = await cartsModel.findById(idCart);
      if (!cart) {
        // Si el carrito no existe, creo uno nuevo con el producto
        const newCart = new cartsModel({
          _id: idCart,
          user: idUser, 
          products: [{ product: idProductAddCart, quantity: 1 }],
        });
        await newCart.save();
        console.log("Creación del carrito y producto exitosa");
      } else {
        // Si el carrito existe, busco el producto y aumento cantidad
        const product = await productsModel.findById(idProductAddCart);
  
        if (!product) {
          console.log("El producto no existe en la base de datos.");
          return;
        }
        const productExists = await cartsModel.findOne({
          _id: idCart,
          "products.product": idProductAddCart,
        });
  
        if (productExists) {
          console.log("El producto ya existe en el carrito. Aumentando cantidad.");
  
          const existingProduct = cart.products.find(
            (product) => product.product.toString() === idProductAddCart.toString()
          );
  
          // Verifico que la cantidad actual más la cantidad a aumentar no supere el stock
          const quantityToAdd = 1;
          const newQuantity = existingProduct.quantity + quantityToAdd;
  
          if (newQuantity > product.stock) {
            console.log("La cantidad en el carrito supera el stock disponible.");
            return;
          }
  
          existingProduct.quantity = newQuantity;
        } else {
          console.log("El producto no existe en el carrito. Agregando producto.");
          // Verifico el stock y precio del producto y calcular el totalPrice
          const newProduct = {
            product: idProductAddCart,
            quantity: 1,
            stock: product.stock,
            price: product.price,
            totalPrice: product.price, 
          };
          cart.products.push(newProduct);
        }
  
        await cart.save();
        console.log("Producto agregado al carrito con éxito");
      }
    } catch (error) {
      console.log(`Error en la función addCartsPg: ${error.message}`);
      throw error;
    }
  };
  
  
  
  //--------------------DISCONUNT CANTINDAD-------------------

discountQuantityPro = async (idCartQuan, idProductsCartQuan, quanRta) => {
  try {
    let idQuanDes = idCartQuan;
    let idProducQuan = idProductsCartQuan;
    let quanSearch = Number(quanRta);

    const quanVerif = 1;

    cartsModel.findById(idQuanDes)
      .then((cart) => {
        if (!cart) {
          console.log("El carrito no existe.");
          return;
        }

        const existingProduct = cart.products.find((product) =>
          product.product.toString() === idProducQuan.toString()
        );

        if (!existingProduct) {
          console.log("El producto no existe en el carrito.");
          return;
        }

        if (existingProduct.quantity > quanVerif) {
          console.log("Disminuyendo la cantidad del producto en el carrito.");
          existingProduct.quantity--;

          cart.save()
            .then(() => {
              console.log("Se disminuyó la cantidad del producto en el carrito con éxito.");
            })
            .catch((error) => {
              console.error(`Error al guardar el carrito: ${error}`);
            });
        } else {
          console.log("La cantidad de producto en el carrito es 1, no se puede descontar más cantidad.");
        }
      })
      .catch((error) => {
        console.log(`Error al buscar el carrito: ${error}`);
      });
  } catch (error) {
    console.log(`No se puede procesar la búsqueda: ${error}`);
    return error;
  }
};




  //-------------------UPDATE CANTIDAD-------------------
  updateQuantyCarts = async (idCartUpd, idProdUpd, updateQuanityPut) => {
    try {
      cartsModel
        .findOne(
          { _id: idCartUpd, "products.product": idProdUpd },
          { _id: 0, "products.$": 1 }
        )
        .then((result) => {
          if (result) {
            const product = result.products[0];
            console.log(`El objeto encontrado es: ${JSON.stringify(product)}`);
            console.log(
              `La cantidad actual en base es: ${JSON.stringify(
                product.quantity
              )}`
            );
            let numberNewQuantity = Number(updateQuanityPut.quantity);
            let newQuantityUp = numberNewQuantity;
            cartsModel
              .updateOne(
                { _id: idCartUpd, "products.product": idProdUpd },
                { $set: { "products.$.quantity": newQuantityUp } }
              )
              .then(() => {
                console.log("Se modificó products de carts con éxito");
              })
              .catch((error) => {
                console.error(`Error al modificar products de carts: ${error}`);
              });
          }
        });
    } catch (error) {
      console.log(`No se puede borrar el producto ${error}`);
    }
  };

  //-------------------UPDATE COMPLETO-------------------
  updateProductsCarts = async (idCartUpd, updateProductPut) => {
    try {
      console.log(idCartUpd);
      const newObjProduct = updateProductPut;
      console.log(newObjProduct);

      cartsModel.findOne({ _id: idCartUpd }).then((result) => {
        if (result) {
          console.log(`El objeto encontrado es: ${result._id}`);

          console.log(
            `El objeto encontrado tiene estos productos: ${result.products}`
          );

          cartsModel
            .updateOne(
              { _id: idCartUpd },
              { $set: { products: newObjProduct } },
              { new: true }
            )
            .then(() => {
              console.log(
                `Se modificó products de carts con éxito: ${result.products}`
              );
            })
            .catch((error) => {
              console.error(`Error al modificar products de carts: ${error}`);
            });
        }
      });
    } catch (error) {
      console.log(`No se puede borrar el producto ${error}`);
    }
  };

  //--------------------DELETE PRODUCT DEL CARRITO------------------
  deleteProductCarts = async (idCartDelete, idProductsCartDelete) => {
    try {
      // Busco id de carts si existe en base datos
      const cartSearchDelete = await cartsModel.find();
      const searchIdCartDelete = cartSearchDelete.find(
        ({ _id }) => _id == idCartDelete
      );
      // Busco si el producto existe en el carrito
      const deleteProductCart = searchIdCartDelete.products;
      const deleteFilteredProduct = deleteProductCart.find(
        ({ product }) => product == idProductsCartDelete
      );
      // Busco el índice del producto
      const productIndexDelete = searchIdCartDelete.products.findIndex(
        (product) => product._id == deleteFilteredProduct._id
      );
      console.log(
        `Índice producto a eliminar del carrito: ${productIndexDelete}`
      );
      // Elimino el producto del array de productos en el carts
      searchIdCartDelete.products.splice(productIndexDelete, 1);
      // Actualizo los cambios en la base de datos
      await searchIdCartDelete.save();
      console.log(
        `El producto _id: ${idProductsCartDelete} en el carrito _id: ${idCartDelete} se eliminó correctamente`
      );
    } catch (error) {
      console.log(`No se puede borrar el producto ${error}`);
    }
  };

  //--------------------DELETE PRODUCTOS COMPLETO DEL CARTS------------------

  deleteAllProductsCarts = async (idCartDelete) => {
    try {
      cartsModel
        .updateOne(
          { _id: idCartDelete },
          { $unset: { products: 1 } },
          { new: true }
        )
        .then(() => {
          console.log(
            `Los todos los productos del carrito _id: ${idCartDelete} se eliminaron correctamente`
          );
        })
        .catch((error) => {
          console.error(`Error al modificar products de carts: ${error}`);
        });
    } catch (error) {
      console.log(`No se puede borrar el producto ${error}`);
    }
  };
}
