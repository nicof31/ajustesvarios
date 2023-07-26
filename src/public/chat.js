
const socket = io();


let user;

let chatBox = document.getElementById("chatBox");

Swal.fire({
  title: "Identificate",
  input: "text",
  text: "Ingresa el email para identificarte en el chat",
  inputValidator: (value) => {
    return !value && "¡Necesitas escribir un email para continuar";
  },
  allowOutsideClick: false,
}).then((result) => {
  user = result.value;
  socket.emit("authenticated", user);
});

chatBox.addEventListener("keyup", async (evt) => {
  if (evt.key === "Enter") {
    if (chatBox.value.trim().length > 0) {

      socket.emit("message", { user: user, message: chatBox.value });
      chatBox.value = "";    
    }
  }
});

//para todos mensajes escritos
socket.on("messageLogs", (dataM) => {
  let log = document.getElementById("messageLogs");
  let messages = "";
  dataM.forEach((message) => {
    messages += `${message.user} dice: ${message.message}<br>`;
  });
  log.innerHTML = messages; //nodo log = let
});

//para cuando los usarios se conectan
socket.on("newUserConected", (data) => {
  Swal.fire({
    toast: true,
    position: "top-end",
    showConfirmationButton: false,
    timer: 3000,
    title: `${data} se ha unido al chat`,
    icon: "success",
  });
});
