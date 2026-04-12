import cloudinary from "../../config/cloudinary.js";
import * as Perfume from "./perfume.model.js";

const safeParseJsonArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return null;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const hasVariantFields = (variant) =>
  variant &&
  variant.size_ml !== undefined &&
  variant.price !== undefined &&
  variant.stock_quantity !== undefined &&
  String(variant.size_ml).trim() !== "" &&
  String(variant.price).trim() !== "" &&
  String(variant.stock_quantity).trim() !== "";

export const createPerfumeController = async (req, res) => {
  try {
    const images = [];

    const name = isNonEmptyString(req.body?.name) ? req.body.name.trim() : "";
    const brand = isNonEmptyString(req.body?.brand)
      ? req.body.brand.trim()
      : "";
    const category_id = isNonEmptyString(req.body?.category_id)
      ? req.body.category_id
      : "";
    const scent_type = isNonEmptyString(req.body?.scent_type)
      ? req.body.scent_type.trim()
      : "";
    const mood = isNonEmptyString(req.body?.mood) ? req.body.mood.trim() : "";
    const origin = isNonEmptyString(req.body?.origin)
      ? req.body.origin.trim()
      : "";
    const gender = isNonEmptyString(req.body?.gender) ? req.body.gender : "";

    const parsedVariants = safeParseJsonArray(req.body?.variants);

    if (!name || !brand || !category_id || !scent_type || !mood || !origin || !gender) {
      return res
        .status(400)
        .json({ message: "Please fill all the required fields in the form" });
    }

    if (!parsedVariants) {
      return res.status(400).json({ message: "Invalid variants format" });
    }

    const validVariants = parsedVariants.filter(hasVariantFields);
    if (validVariants.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one valid variant is required" });
    }

    const perfumeName = name;

    if (!req.files?.length) {
      return res
        .status(400)
        .json({ message: "At least one product image is required" });
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
      name,
      brand,
      category_id,
      scent_type,
      mood,
      origin,
      gender,
      variants: validVariants,
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
    res.json({
      success: true,
      data: data || [],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch perfumes",
      data: [],
    });
  }
};

export const getVendorPerfumesController = async (req, res) => {
  try {
    const vendor_id = req.user.userID;
    const data = await Perfume.getPerfumesByVendor(vendor_id);
    res.json({
      success: true,
      data: data || [],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch vendor perfumes",
      data: [],
    });
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

    const name = isNonEmptyString(req.body?.name) ? req.body.name.trim() : "";
    const brand = isNonEmptyString(req.body?.brand)
      ? req.body.brand.trim()
      : "";
    const category_id = isNonEmptyString(req.body?.category_id)
      ? req.body.category_id
      : "";
    const scent_type = isNonEmptyString(req.body?.scent_type)
      ? req.body.scent_type.trim()
      : "";
    const mood = isNonEmptyString(req.body?.mood) ? req.body.mood.trim() : "";
    const origin = isNonEmptyString(req.body?.origin)
      ? req.body.origin.trim()
      : "";
    const gender = isNonEmptyString(req.body?.gender) ? req.body.gender : "";
    const parsedVariants = safeParseJsonArray(req.body?.variants);

    const keptImages = safeParseJsonArray(req.body?.existingImages) || [];
    const totalImages = keptImages.length + (req.files?.length || 0);

    if (!name || !brand || !category_id || !scent_type || !mood || !origin || !gender) {
      return res
        .status(400)
        .json({ message: "Please fill all the required fields in the form" });
    }

    if (!parsedVariants) {
      return res.status(400).json({ message: "Invalid variants format" });
    }

    const validVariants = parsedVariants.filter(hasVariantFields);
    if (validVariants.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one valid variant is required" });
    }

    if (totalImages === 0) {
      return res
        .status(400)
        .json({ message: "At least one product image is required" });
    }

    const perfumeName = name;
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
      name,
      brand,
      category_id,
      scent_type,
      mood,
      origin,
      gender,
      variants: JSON.stringify(validVariants),
      images: images,
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
