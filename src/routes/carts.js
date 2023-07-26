import cartsManagerMongo from "../dao/managers/cartsmanager.mongodb.js";
import cartsModel from "../dao/models/carts.model.js";
import { Router, json } from "express";
import authToken from "../middleware/usersessiontoken.js";
import UserModel from "../dao/models/users.model.js";
import { generateJWT, passportCall } from "../utils/jwt.js";
import handlePolicies from "../middleware/handle-policies.middleware.js"


const routerCarts = Router();
const cartListMongo = new cartsManagerMongo("src/dao/managers/cartsManager.mongodb.js");


  //---------------------GET POPULATE---------------------
  //Opcion A: se usa para abrir el carrito http://localhost:8080/api/carts/:cid , esta opcion permite hacer la compra
  //Opcion B: se usa para abrir el historico carrito http://localhost:8080/api/carts/:cid/?historycart=true, esta opcion solo de vista
    //si se usa de postman verlo desd Preview pq la rta esta renderizada
 
routerCarts.get("/:cid",[passportCall("jwt"), handlePolicies(["ADMIN","USER"])], async (req, res) => {
  const cartId = req.params.cid;
  const showHistory = req.query.historycart === "true";

  try {
    const cart = await cartsModel.findById(cartId)
      .populate('products.product')
      .lean();

    if (!cart) {
      return res.status(404).json({ message: 'El carrito no existe' });
    } else {
      cart.products.forEach(product => {
        product.totalPrice = product.quantity * product.product.price;
      });

      if (showHistory) {
        return res.render("carts/findcarthistory", { cart });
      } else {
        return res.render("carts/carts", { cart });
      }
    }
  } catch (error) {
    console.log(`No se pudo obtener productos en BBBD ${error}`);
    return res.status(404).json({ status: "error", message: `No se pudo obtener productos en BBBD ${error}` });
  }
});

  
    //----------BUSQUEDA POR LIMIT----------------------
//http://localhost:8080/api/carts/
//http://localhost:8080/api/carts/?limit=2
routerCarts.get("/", [passportCall("jwt"), handlePolicies(["ADMIN","USER"])],  async (req, res) => { 
  let cartsFilter = await cartsModel.find();
  try { 
      if (req.query.limit) {
      const cartsFilter = await cartsModel.find().limit(req.query.limit);
      return res.status(200).json({status:"success", message: { cartsFilter }});
    } else {
    return  res.status(200).json({result: "success mongoose", payload: cartsFilter});
    };  
  }
  catch(error){
    console.log("cannot get users with mongoose" + error)
    return res.status(404).json({status:"error",message: `No se puedo obtener productos en BBBD ${error}`});
  };
});


//---------------------POST ADD CARTS ---------------------
    //aumentar cantidad y disminuir cantidad debe estar logueado
    //http://localhost:8080/api/carts/${productId}/?accion=aumentar
    //http://localhost:8080/api/carts/${productId}/?accion=disminuir
routerCarts.post("/:pid", [passportCall("jwt"), handlePolicies(["ADMIN","USER"]),authToken], async (req, res) => {
  try {
    const idProductAddCart = req.params.pid;
    console.log("🚀 ~ file: carts.js:75 ~ routerCarts.post ~ idProductAddCart:", idProductAddCart)
   
    const userEmail = req.user.email;     
    console.log("🚀 ~ file: carts.js:76 ~ routerCarts.post ~ userEmail:", userEmail)

    const userId = req.user.id
    console.log("🚀 ~ file: carts.js:81 ~ routerCarts.post ~ userId:", userId)
    
    const user = await UserModel.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ status: "error", message: "Usuario no encontrado" });
    }
    const idCart = user.cart;
    if (!idCart) {
      return res.status(404).json({ status: "error", message: "Carrito no encontrado para este usuario" });
    }
    const idCartDs = idCart.toString();
    console.log("🚀 ~ file: carts.js:85 ~ routerCarts.post ~ idCartDs:", idCartDs)
    const accion = req.query.accion;

    if (accion == "aumentar") {
      await cartListMongo.addCartsPg(idCartDs, idProductAddCart, userId);
      return res.status(200).json({ status: "success", message: "Cantidad aumentada en el carrito" });
    } else if (accion == "disminuir") {
      await cartListMongo.discountQuantityPro(idCartDs, idProductAddCart);
      return res.status(200).json({ status: "success", message: "Cantidad disminuida en el carrito" });
    } else {
      return res.status(400).json({ status: "error", message: "Acción no válida" });
    }
  } catch (error) {
    console.error(`Error al procesar la petición POST: ${error}`);
    return res.status(500).json({ status: "error", message: "No se puede procesar la petición POST" });
  }
});


//---------------------PUT MODIFICAR CANTIDAD---------------------
  // http://localhost:8080/api/carts/:cid/products/:pid
routerCarts.put("/:cid/products/:pid", [passportCall("jwt"), handlePolicies(["ADMIN","USER"])], async (req, res) => { 
  try {
  const idCartUpd = req.params.cid;
  const idProdUpd = req.params.pid;  
  const updateQuanityPut = req.body;
 //busco id de carts si existe en carts en base
 const cartSearchUpd = await cartsModel.find();
 const searchIdCartUpd = cartSearchUpd.find(({ _id }) => _id == idCartUpd);
 if (!searchIdCartUpd) {
   return res.status(404).json({status:"error",message: `El  carrito _id: ${idCartUpd} buscado no existe, cargue un nuevo id`});
  } else {
          //busco si el producto existe en el carrito
          const upProductCart = searchIdCartUpd.products;
          const upFilteredProduct = upProductCart .find(({ product }) => product ==  idProdUpd);
          if (!upFilteredProduct) {
            return res.status(404).json({status:"error",message: `El producto _id:'${idProdUpd}' buscado no existe en cart _id:'${idCartUpd}', cargue un nuevo id de producto`});
          } else { 
          await cartListMongo.updateQuantyCarts(idCartUpd,idProdUpd,updateQuanityPut);
          return res.status(200).json({
            status: "success",
            message: `El producto _id: ${idProdUpd} en el carrito _id: ${idCartUpd} se modifico cantidad correctamente`,
          })
        }
      }
  } catch (error) {
    console.log(`No se puede procesar la peticion PUT '${error}'`);
    return res.status(404).json({status:"error",message: `No se puede procesar la peticion PUT '${error}'`});
  }
});

    //---------------------PUT MODIFICAR COMPLETO---------------------
// http://localhost:8080/api/carts/:cid
routerCarts.put("/:cid",[passportCall("jwt"), handlePolicies(["ADMIN","USER"])], async (req, res) => { 
  try {
  const idCartUpd = req.params.cid;
  const updateProductPut = req.body;
 //busco id de carts si existe en carts en base
 const cartSearchUpd = await cartsModel.find();
 const searchIdCartUpd = cartSearchUpd.find(({ _id }) => _id == idCartUpd);
 if (!searchIdCartUpd) {
   return res.status(404).json({status:"error",message: `El  carrito _id: ${idCartUpd} buscado no existe, cargue un nuevo id`});
  } else {
    await cartListMongo.updateProductsCarts(idCartUpd,updateProductPut);
    return res.status(200).json({
      status: "success",
      message: `Se agregaron todos los productos en el carrito _id: ${idCartUpd} y se actualizo correctamente`,
    })    
      }
  } catch (error) {
    console.log(`No se puede procesar la peticion PUT '${error}'`);
    return res.status(404).json({status:"error",message: `No se puede procesar la peticion PUT '${error}'`});
  }
});


//---------------------DELETE TODOS LOS PRODUCTOS DEL CARRITO---------------------
// http://localhost:8080/api/carts/:cid
routerCarts.delete("/:cid", [passportCall("jwt"), handlePolicies(["ADMIN","USER"])], async (req, res) => {
  const idCartDelete = req.params.cid;
  console.log("🚀 ~ file: carts.js:185 ~ routerCarts.delete ~ idCartDelete:", idCartDelete);
  const cart = await cartsModel.findById(idCartDelete);
  if (!cart) {
    return res.status(404).json({ status: "error", message: `El carrito _id: ${idCartDelete} buscado no existe, cargue un nuevo id` });
  } else {
    //elimino lo productos dentro del carrito
    //await cartListMongo.deleteAllProductsCarts(idCartDelete);
    //Actualizo el carrito en la base de datos con un array de products vacio
    cart.products = [];
    await cart.save();
    return res.status(200).json({
      status: "success",
      message: `Los todos los productos del carrito _id: ${idCartDelete} se eliminaron correctamente`,
    });
  }
});

//---------------------DELETE PRODUCTO DEL CARRITO---------------------
// http://localhost:8080/api/carts/:cid/products/:pid
routerCarts.delete("/:cid/products/:pid", [passportCall("jwt"), handlePolicies(["ADMIN","USER"])], async (req, res) => {
  const idCartDelete = req.params.cid;
  const idProductsCartDelete = req.params.pid;
  // Busco id de carts si existe en carts.json
  const cartSearchDelete = await cartsModel.find();
  const searchIdCartDelete = cartSearchDelete.find(({ _id }) => _id == idCartDelete );
  if (!searchIdCartDelete) {
    return res.status(404).json({ status: "error", message: `El carrito _id: ${idCartDelete} buscado no existe, cargue un nuevo id` });
  } else {
    // Busco si el producto existe en el carrito
    const deleteProductCart = searchIdCartDelete.products;
    const deleteFilteredProduct = deleteProductCart.find(({ product }) => product == idProductsCartDelete);
    if (!deleteFilteredProduct) {
      console.log("El producto buscado no existe en el carrito");
      return res.status(404).json({ status: "error", message: `El producto _id:'${idProductsCartDelete}' buscado no existe, cargue un nuevo id` });
    } else {
      await cartListMongo.deleteProductCarts(idCartDelete,idProductsCartDelete);
      console.log("El producto buscado existe en el carrito y se puede eliminar");

       return res.status(200).json({
        status: "success",
        message: `El producto _id: ${idProductsCartDelete} en el carrito _id: ${idCartDelete} se eliminó correctamente`,
      });
    }
  }
});





export default routerCarts;
