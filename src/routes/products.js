import productManagerMongo from "../dao/managers/productManager.mongodb.js";
import productsModel from "../dao/models/products.model.js";
import { Router } from "express";

const routerProdructs = Router();
const productListMongo = new productManagerMongo("src/dao/managers/productManager.mongodb.js");
 
//ENDPOINTS

  //------------------------------GET---------------------------------------------//

  //filtro de productos por id
  //http://localhost:8080/api/products/:pid
  routerProdructs.get("/:pid", async (req, res) => {
    try{
    const idProducts= req.params.pid;
    const busquedaIdProd = await productListMongo.productById(idProducts)
   
    console.log(busquedaIdProd )
    if (busquedaIdProd .length == 0) {
    return res.status(404).json({status:"error",message: "El id de producto buscado no existe, cargue un nuevo id"});
    }
    return res.status(200).json({status:"success, el id buscado es:",message:{ busquedaIdProd }});
  } catch (error) {
    console.log(`No se puede procesar la peticion GET '${error}'`);
    return res.status(404).json({status:"error",message: `No se puede procesar la peticion GET '${error}'`});
  };
  });


   //filtro de productos convinado
   //http://localhost:8080/api/products/?page=2&limit=5&sort=&category=&id=
   routerProdructs.get("/", async (req, res) => {
    try {
      const limitDefault = 10;
      const pageDefault = 1;   
      const findPage = parseInt(req.query.page) || parseInt(pageDefault);
      const findLimit = parseInt(req.query.limit) || parseInt(limitDefault); 
      const sortOrder = req.query.sort == 'desc' ? -1 : 1;
      const queryCategory = req.query.category;
      const queryId =  parseInt(req.query.id);
  
      //Busco por categoria
      const findCategory = {}; 
      if (queryCategory) {
        findCategory.category = queryCategory;
      };
      // Busco por _id 
      if (queryId) {
        findCategory._id = queryId;
      };
      //Parametros de filtro
      const findBdProd = {
        page: findPage,
        limit: findLimit,
        sort: { price: sortOrder },
        lean: true
      };
  
      const productsPagination = await productsModel.paginate(findCategory, findBdProd);
  
      //le paso a respuesta de products los link
      productsPagination.prevLink = productsPagination.hasPrevPage === true
          ? `http://localhost:8080/api/products/?page=${productsPagination.prevPage}&limit=5&sort=&category=&id=`
          : null;
  
      productsPagination.nextLink = productsPagination.hasNextPage === true
        ? `http://localhost:8080/api/products/?page=${productsPagination.nextPage}&limit=5&sort=&category=&id=`
        : null;
  
      productsPagination.isValid= !(findPage<=0||findPage> productsPagination.totalPages)
      return res.status(200).json({ status: "success mongoose", payload: productsPagination });
    } catch(error) {
      console.log(`Error al realizar la búsqueda paginada: ${error}`);
      return res.status(404).json({status:"error",message: `Error al realizar la búsqueda paginada en BBBD ${error}`});
    }
  });


  //---------------------POST---------------------
    //Crear un nuevo producto
    //http://localhost:8080/api/products/
  routerProdructs.post("/", async (req, res) => {
  try {
    const crearProducto = req.body;
    if (!crearProducto.title || !crearProducto.description || !crearProducto.code || !crearProducto.price || !crearProducto.status || !crearProducto.category || !crearProducto.stock) {
      return res.status(400).send({status:"error",message:"Incomplete values"});
    } 
    const findCode = await productsModel.find();
    const codeVerf = findCode.find(({ code })=> code == crearProducto.code);
    if (codeVerf != null) {
      return res.status(409).json({status:"error",message: `El código '${crearProducto.code}'de producto existe en otro producto, cargue un nuevo código de producto`});
    } else {
      await productListMongo.addProduct(crearProducto.title, crearProducto.description, crearProducto.code, crearProducto.price, crearProducto.status, crearProducto.category, crearProducto.thumbnail,crearProducto.stock);     
      res.status(200).json({status:"success, Products created",message:{ crearProducto }});
    };
  } catch (error) {
    console.log(`No se puede procesar la peticion POST '${error}'`);
    return res.status(404).send({status:"error",message: `No se puede procesar la peticion POST '${error}'`});
  }
  });


  //---------------------PUT---------------------
  //update objeto completo
  //http://localhost:8080/api/products/:pid
  routerProdructs.put("/:pid", async (req, res) => {
    try{
    const actualizarProducto = req.body;
    const idUpdate = req.params.pid;
    if (!actualizarProducto.title || !actualizarProducto.description || !actualizarProducto.code || !actualizarProducto.price || !actualizarProducto.status || !actualizarProducto.category || !actualizarProducto.stock) {
      return res.status(400).json({status:"error",message:"Incomplete values"});
    };
    const findCodeUpC = await productsModel.find();
    const idFindUpdate = findCodeUpC.find(({ _id })=> _id == idUpdate);
    if(idFindUpdate == null){
      return res.status(404).json({status:"error",message: `El id de producto buscado no existe, cargue un nuevo id`});
    } else {
      const codDeProdBuscadoId = findCodeUpC.find(({ code })=> code === actualizarProducto.code);
      if (codDeProdBuscadoId !=null){
      return res.status(409).json({status:"error",message: `El código de producto existe en otro producto, cargue un nuevo código de producto`});
      } else{
        
    let passThumbnail;
    if(actualizarProducto.thumbnail != null){
      passThumbnail = actualizarProducto.thumbnail;
    } else {
      passThumbnail = idFindUpdate.thumbnail ;
    };          
      await productListMongo.updateProduct(idUpdate, actualizarProducto.title, actualizarProducto.description, actualizarProducto.code, actualizarProducto.price, actualizarProducto.status, actualizarProducto.category, passThumbnail ,actualizarProducto.stock);
      res.status(200).json({status:"success, Products actualizado en base",message:{ actualizarProducto }}); 
        };
      };
    } catch (error) {
      console.log(`No se puede procesar la peticion POST '${error}'`);
      return res.status(400).json({status:"error",message: `No se puede procesar la peticion POST '${error}'`});
    }
});

  //---------------------PATCH---------------------
    //PACHT para actualizar valores en particular

        //http://localhost:8080/api/products/:pid
  routerProdructs.patch("/:pid", async (req, res) => { 
    try {
    const updateParamPatch = req.body;
    const idUpdatePatch = req.params.pid;
    const findCodeUpdatePatch = await productsModel.find();
    const idVerfUpdatePatch = findCodeUpdatePatch.find(({ _id })=> _id == idUpdatePatch);
 
    if (idVerfUpdatePatch != null) { 
      console.log("el producto id existe y se puede modificar");
      const codDeProdPatchId = findCodeUpdatePatch.find(({ code })=> code == req.body.code);
      if (codDeProdPatchId  !=null){
      return res.status(409).json({status:"error",message: "El código de producto existe en otro producto, cargue un nuevo código de producto"});
      } else {
      const newObjUpdate = Object.assign(idVerfUpdatePatch,updateParamPatch);
      await productListMongo.updateParam(newObjUpdate);
      res.status(200).json({status:"success, el producto existe en base y se puede cambiar los parametros",message: { }});
     }
    } else {
      console.log("el producto id NO existe y se va a agregar uno nuevo")
      return res.status(404).json({status:"error",message: "El id de producto buscado no existe, cargue un nuevo id"});
      }
    } catch (error) {
      console.log(`No se puede procesar la peticion POST '${error}'`);
      return res.status(404).json({status:"error",message: `No se puede procesar la peticion POST '${error}'`});
    }
  });

  //---------------------DELETE---------------------
    //http://localhost:8080/api/products/:pid
  routerProdructs.delete("/:pid", async (req, res) => {
    try{
    const idProdDelet = req.params.pid;
    const findCodeDelete = await productsModel.find();
    const idVerfDelete= findCodeDelete .find(({ id })=> id == idProdDelet);
    if (idVerfDelete == null) {
      return res.status(404).json({status:"error",message: "El id de producto buscado no existe, cargue un nuevo id"});
    }
    const busqIdProdDelet = await productListMongo.deleteProduct(idProdDelet);
    res.status(200).json({status:"success, el producto eliminado es:", message:{ busqIdProdDelet }});
  } catch (error) {
    console.log(`No se puede procesar la peticion POST '${error}'`);
    return res.status(404).json({status:"error",message: `No se puede procesar la peticion POST '${error}'`});
  }
  });


  export default routerProdructs;
