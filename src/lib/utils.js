import jwt from "jsonwebtoken"

//cree token
export const generateToken = (userId, res) => {

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });

    res.cookie("jwt", token, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        sameSite: "strict",
        secure: "development", 
});

return token;

};