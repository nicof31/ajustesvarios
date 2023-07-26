import mongoose from "mongoose";

const messagesCollection = 'messages';

//{user:correoDelUsuario, message: mensaje del usuario}

const messagesSchema = new mongoose.Schema({
    user: {
        type: String,
        require: true,
    },
    message:
    {
        type: String,
        require: true,
    }
});

const messagesModel = mongoose.model(messagesCollection, messagesSchema);

export default messagesModel 