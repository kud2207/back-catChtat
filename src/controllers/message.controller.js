import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

/**
 affiche les user comme pour un syte msg
 */
export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password"); //get all users sauf _id
        res.status(200).json(filteredUsers)
    } catch (error) {
        console.error("error in getUsersForSidebar middleware:", error)
        res.status(500).json({
            message: error.message
        })
    }

}


/**
 get msg all user et _id
 */
export const getMessages = async (req, res) => {
    try {
        const { id: userTochatId } = req.params; //recupre id de user sen msg et change par userTocatId
        const myId = req.user._id;

        // récupérer les messages envoyer par user et _id et vise versa par $or
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userTochatId },
                { senderId: userTochatId, receiverId: myId },
            ],
        }).sort({ createdAt: 1 });

        //récupérer les infos de l'autre utilisateur
        const otherUser = await User.findById(userTochatId).select("username email profilePic");

        res.status(200).json({
            message: `All messages avec ${otherUser.username}`,
            data: messages,
        });

    } catch (error) {
        console.error("error en getMessages middleware:", error)
        res.status(500).json({
            message: error.message
        })
    }
}

/**
 send msg
 */
export const sendMessages = async (req, res) => {
    try {
        const { text, image } = req.body
        const { id: receiverId } = req.params
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        })

        await newMessage.save();

        //fontion socket pour encvoyer le message
        const receiverSocketId = getReceiverSocketId(receiverId)
        if(receiverSocketId){//envoie evenement uniquement au socket
            io.to(receiverSocketId).emit("newMessage", newMessage.toObject())
        }

        res.status(200).json({
            message: "Message envoyé avec succès",
            data: newMessage,
        })
    } catch (error) {
        console.error("error en sendMessages middleware:", error)
        res.status(500).json({
            message: error.message
        })
    }

} 