import fs from "fs";

export default class productManager {
  constructor(path) {
    this.path = path;
  }

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
    let productGest = [];
    try {
      const data = await fs.promises.readFile(this.path, "utf-8");
      productGest = JSON.parse(data);
    } catch (error) {
      return error;
    } finally {
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
      if (productGest.length === 0) {
        product.id = 1;
      } else {
        product.id = productGest[productGest.length - 1].id + 1;
      }
      const agregoIdObjP = productGest.push(product);
      const writeJson = await fs.promises.writeFile(
        this.path,
        JSON.stringify(productGest, null, "\t")
      );
    }
  };

  products = async () => {
    if (fs.existsSync(this.path)) {
      const data = await fs.promises.readFile(this.path, "utf-8");
      const productRta = JSON.parse(data);
      return productRta;
    } else {
      return [];
    }
  };

  productById = async (idParm) => {
    const busquedaArr = await fs.promises.readFile(this.path, "utf-8");
    const productRtaId = JSON.parse(busquedaArr);
    const resultBusq = productRtaId.find(({ id }) => id == idParm);
    return resultBusq;
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
    const busquedaArrUpdate = await fs.promises.readFile(this.path, "utf-8");
    const productRtaUp = JSON.parse(busquedaArrUpdate);
    const resultBusqUpdate = productRtaUp.find(({ id }) => id == idUpdate);
    const indiceUpdate = productRtaUp.indexOf(resultBusqUpdate);
    const productUpdate = {
      title,
      description,
      code,
      price,
      status,
      category,
      thumbnail,
      stock,
      id: resultBusqUpdate.id,
    };
    const updateProductoArray = productRtaUp.splice(
      indiceUpdate,
      1,
      productUpdate
    );
    const nuevoArrUp = productRtaUp;
    const writeUpdateP = await fs.promises.writeFile(
      this.path,
      JSON.stringify(nuevoArrUp, null, "\t")
    );
    return resultBusqUpdate;
  };

  //Update producto por algun parametros
  updateParam = async (newParam) => {
    const busquedaParmUpdate = await fs.promises.readFile(this.path, "utf-8");
    const productRtaUpParam = JSON.parse(busquedaParmUpdate);
    const resultBusqUpdateParam = productRtaUpParam.find(
      ({ id }) => id == newParam.id
    );
    const indiceUpdateParam = productRtaUpParam.indexOf(resultBusqUpdateParam);
    const productUpdateParam = newParam;
    const updateProductoArrayParam = productRtaUpParam.splice(
      indiceUpdateParam,
      1,
      productUpdateParam
    );
    const nuevoArrUpParam = productRtaUpParam;
    await fs.promises.writeFile(
      this.path,
      JSON.stringify(nuevoArrUpParam, null, "\t")
    );
    return resultBusqUpdateParam;
  };

  deleteProduct = async (idDelete) => {
    const busquedaRtaDelete = await fs.promises.readFile(this.path, "utf-8");
    const productRtaDelete = JSON.parse(busquedaRtaDelete);
    const resultBusqDelete = productRtaDelete.find(({ id }) => id == idDelete);
    const indiceDelete = productRtaDelete.indexOf(resultBusqDelete);
    const eliminarObjetoIndice = productRtaDelete.splice(indiceDelete, 1);
    const nuevoArreglo = productRtaDelete;
    const deletBase = await fs.promises.writeFile(
      this.path,
      JSON.stringify(nuevoArreglo, null, "\t")
    );
    return resultBusqDelete;
  };
}
