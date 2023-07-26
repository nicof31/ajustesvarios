
const socketClient = io();
//mensaje al servidor infomando mi conexion


socketClient.on('evento_para_todos', (data) => {
    console.log(data);
   
  });

  
//socketClient.emit('message','Front: Usuario conectado con exito');


//solo para mi usuario
socketClient.on('evento_para_mi usuario', data => {
    console.log(data);
});
//para todos menos para mi usario
socketClient.on('evento_para_todos_menos_el_acutal', data => {
    console.log(data);
});
//para todos
socketClient.on('evento_para_todos', data => {
    console.log(data);
});





 


