import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();



export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("Connexion mongoDB réussie");
  } catch (error) {
    console.error("Erreur de connexion à la base de données:", error);
  } 
};  
