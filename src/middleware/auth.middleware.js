import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try {

        const token = req.cookies.jwt;//verifei existance du cookie
        if (!token) {
            return res.status(401).json({
                message: "Non authentifié token"

            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET); //verifei si le decodeage est vrai
        if (!decoded){
            return res.status(401).json({
                message: "Non authentifié decode"
            })
        }

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(401).json({
                message: "Non authentifié user"
            })
        }

        req.user = user;//le fait qu'on la jouter nous permert de recuper en req.user._id
        next();

    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: error.message
        })
    }
}