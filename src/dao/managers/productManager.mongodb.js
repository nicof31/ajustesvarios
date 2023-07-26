import productsModel from "../models/products.model.js";

export default class productManagerMongo {
  constructor(path) {
    this.path = path;
  }

  productById = async (idProducts) => {
    try{
      const resultBusqC = await productsModel.find( {"_id": idProducts } );
      return resultBusqC;
  } catch(error){
      console.log(`No se puede porcesar la busqueda ${error}`);
      return error;
  };
  };



  addProduct = async (
    title,
    description,
    code,
    price,
    status,
    category,
    thumbnail = [],
    stock
  ) => {
    try{
    let productGest = [];
      const product = {
        title,
        description,
        code,
        price,
        status,
        category,
        thumbnail,
        stock,
      };
    
 // genero el id autoincremental
      const findmaxIdBase = await productsModel.findOne({}, {}, { sort: { _id: -1 } });
        let idAutoGen;
        if (findmaxIdBase) {
          const maxId = findmaxIdBase._id;
          product._id = maxId + 1;
        } else {
          product._id = 1;
        }

  
      productGest.push(product);
      await productsModel.create(productGest);
      console.log(`Creación del producto exitosa`)
    } catch(error){
      console.log(`No se puede crear el producto ${error}`);
    };
  };

  //Update producto completo
  updateProduct = async (
    idUpdate,
    title,
    description,
    code,
    price,
    status,
    category,
    thumbnail,
    stock
  ) => {
   try{
    const productUpdate = {
      title,
      description,
      code,
      price,
      status,
      category,
      thumbnail,
      stock,
      _id: idUpdate,
    };
   await productsModel.updateOne({_id: idUpdate}, productUpdate);
   console.log(`Actualización del producto id: '${idUpdate}' exitoso`)
  } catch(error){
    console.log(`No se puede modificar el producto ${error}`);
  };
  };

  //Update producto por algun parametros
  updateParam = async (newParam) => {
    try{
      await productsModel.updateOne({_id: newParam._id}, newParam) 
      console.log(`Actualización parcial del producto id: '${newParam._id}' exitoso`)
    } catch(error){
      console.log(`No se puede modificar el producto ${error}`);
    };
  };


  deleteProduct = async (idDelete) => {
    try{
      await productsModel.deleteOne({_id: idDelete});
      console.log(`Borrado del producto id: '${idDelete}' exitoso`)
    }catch(error){
      console.log(`No se puede borrar el producto ${error}`);
    };
  };
}
