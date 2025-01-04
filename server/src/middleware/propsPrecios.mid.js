function propsPrecios(req,res,next) {
    const { codigo, precio,supermercadoId } = req.body;
    if (!codigo || !precio || !supermercadoId) {
      const error = new Error("codigo & precio & supermercadoID are required");
      error.statusCode = 404;
      throw error;
    }else{
        return next()
    }
  }
  
  export default propsPrecios;



