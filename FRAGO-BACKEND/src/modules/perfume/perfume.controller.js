import cloudinary from "../../config/cloudinary.js";
import * as Perfume from "./perfume.model.js";

export const createPerfumeController = async (req, res) => {
    try {
        const images = [];

        const perfumeName = req.body.name;
        if (!perfumeName) {
            return res.status(400).json({ message: "Perfume name is required" });
        }

        // sanitize folder name
        const folderName = perfumeName
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_]/g, "");

        const uploadFolder = `perfumes/${folderName}`;

        if (req.files?.length) {
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: uploadFolder,
                });
                images.push(result.secure_url);
            }
        }

        const perfume_id = await Perfume.createPerfume({
            vendor_id: req.user.userID,
            ...req.body,
            variants: JSON.parse(req.body.variants || "[]"),
            images,
        });

        res.status(201).json({
            message: "Perfume created successfully",
            perfume_id,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getAllPerfumesController = async (req, res) => {
    const data = await Perfume.getAllPerfumes();
    res.json(data);
};

export const getPerfumeByIdController = async (req, res) => {
    const data = await Perfume.getPerfumeById(req.params.id);
    if (!data) return res.status(404).json({ message: "Not found" });
    res.json(data);
};

export const updatePerfumeController = async (req, res) => {
    const updated = await Perfume.updatePerfume(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Updated successfully" });
};

export const deletePerfumeController = async (req, res) => {
    const deleted = await Perfume.deletePerfume(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted successfully" });
};

export const deletePerfumeImage = async (req, res) => {
    try {
        const { imageID } = req.params;

        if (!imageID) {
            return res.status(400).json({ message: "imageID is required" });
        }

        const deleted = await Perfume.deletePerfumeImageByID(imageID);

        if (!deleted) {
            return res.status(404).json({ message: "Image not found" });
        }

        res.json({ message: "Image deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete product image" });
    }
};

