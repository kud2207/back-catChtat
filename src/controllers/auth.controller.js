import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";


/**
 creer un compte
 */
export const signup = async (req, res) => {
    try {
        const { fullName, email, password } = req.body
        if (!fullName || !email || !password) {
            return res.status(400).json({
                message: "Veuillez remplir tous les champs"
            })
        }
        if (password.length < 6) {
            return res.status(400).json({
                message: "Le mot de passe doit contenir au moins 6 caractères"
            })
        }

        const user = await User.findOne({ email })

        if (user) {
            return res.status(400).json({
                message: "L'utilisateur existe déjà"
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        })


        if (newUser) {
            const token = generateToken(newUser._id, res)
            await newUser.save()
            res.status(201).json({
                message: "Utilisateur créé avec succès",
                data: newUser,
                token: token
            })
        } else {
            res.status(400).json({
                message: "Erreur lors de la création de l'utilisateur"
            })
        }

    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: error.message
        })
    }
}

/**
 login compte
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            res.status(400).json({
                message: "Veuillez remplir tous les champs"
            })
        }

        const user = await User.findOne({ email })
        if (!user) {
            res.status(400).json({
                message: "L'utilisateur n'existe pas"
            })
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if (!isPasswordCorrect) {
            res.status(400).json({
                message: "Mot de passe incorrect"
            })
        }

        const token = generateToken(user._id, res)
        res.status(200).json({
            message: "Connexion réussie",
            data: user,
            token: token
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: error.message
        })
    }
}

/**
 logout compte
 */
export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", {
            maxAge: 0,
        })
        res.status(200).json({
            message: "Déconnexion réussie"
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: error.message
        })
    }
}


/**
 update photo profil
 */
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "L'image de profil est obligatoire" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    // Supprimer l'ancienne photo si elle existe
    if (user.profilePicId) {
      try {
        await cloudinary.uploader.destroy(user.profilePicId);
      } catch (err) {
        console.warn("⚠️ Erreur suppression ancienne photo :", err.message);
      }
    }

    // Uploader la nouvelle image
    const uploadResponse = await cloudinary.uploader.upload(profilePic, {
      folder: "profiles",
    });

    // Mettre à jour l'utilisateur avec la nouvelle photo et son public_id
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: uploadResponse.secure_url,
        profilePicId: uploadResponse.public_id,
      },
      { new: true }
    );

    res.status(200).json({
      message: "Profil mis à jour avec succès",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Erreur updateProfile :", error);
    res.status(500).json({ message: error.message });
  }
};


/**
 check si user est connecté
 */
export const checkAuth = async (req, res) => {
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.error("Error in ckechAuth middleware:", error.message)
        res.status(500).json({
            message: error.message
        })
    }
}