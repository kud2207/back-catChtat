import jwt from "jsonwebtoken"

//cree token
export const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });

    // Détermine si on est en production
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("jwt", token, {
        maxAge: 1000 * 60 * 60 * 24, // 24h
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax", // ← "none" en prod, "lax" en dev
        secure: isProduction, // ← true en prod (HTTPS requis), false en dev (HTTP)
        path: "/",
    });

    return token;
};

/**
 * en prod
 * sameSite: "none"
 * secure : true
 */