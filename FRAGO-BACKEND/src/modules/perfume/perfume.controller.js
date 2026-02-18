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
      // Helper function to upload buffer to Cloudinary using streams
      const uploadFromBuffer = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: uploadFolder },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            },
          );
          uploadStream.end(fileBuffer);
        });
      };

      for (const file of req.files) {
        const result = await uploadFromBuffer(file.buffer);
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
  try {
    const data = await Perfume.getAllPerfumes();
    res.json(data || []);
  } catch (err) {
    res.status(200).json([]);
  }
};

export const getVendorPerfumesController = async (req, res) => {
  try {
    const vendor_id = req.user.userID;
    const data = await Perfume.getPerfumesByVendor(vendor_id);
    res.json(data || []);
  } catch (err) {
    res.status(200).json([]);
  }
};

export const getPerfumeByIdController = async (req, res) => {
  try {
    const perfume = await Perfume.getPerfumeById(req.params.id);

    if (!perfume) {
      return res.status(200).json({
        success: false,
        message: "Perfume not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      data: perfume,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch perfume details",
      error: err.message,
    });
  }
};

export const updatePerfumeController = async (req, res) => {
  try {
    const { id } = req.params;
    const images = [];

    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing" });
    }

    const perfumeName = req.body.name;
    // We only need folder name if there are new files to upload
    if (req.files?.length && perfumeName) {
      const folderName = perfumeName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");

      const uploadFolder = `perfumes/${folderName}`;

      const uploadFromBuffer = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: uploadFolder },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            },
          );
          uploadStream.end(fileBuffer);
        });
      };

      for (const file of req.files) {
        const result = await uploadFromBuffer(file.buffer);
        images.push(result.secure_url);
      }
    }

    const updated = await Perfume.updatePerfume(id, {
      ...req.body,
      variants: req.body.variants, // Already stringified or array depending on middleware
      images: images, // New images only
    });

    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
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
