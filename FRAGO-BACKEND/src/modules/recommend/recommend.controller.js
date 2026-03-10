import * as Recommendation from "./recommend.model.js";
import { MOODS, GENDERS, PLACES } from "../../utils/recommendationConstants.js";
import * as Category from "../category/category.model.js";

export const getRecommendationOptions = async (req, res) => {
  try {
    const categories = await Category.getAllCategories();
    res.json({
      moods: MOODS,
      genders: GENDERS,
      categories: categories, // real categories from DB
      places: PLACES,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const recommendPerfumeController = async (req, res) => {
  try {
    const { mood, gender, category_id, place } = req.query;

    if (!mood || !place) {
      return res.status(400).json({
        message: "mood and place are required",
      });
    }

    const perfumes = await Recommendation.getRecommendedPerfumes({
      mood: mood.toLowerCase(),
      gender: gender ? gender.toLowerCase() : null,
      category_id: category_id || null,
      place, // place is used for constant mapping, keep case if needed or normalize
    });

    res.json({
      count: perfumes.length,
      data: perfumes,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
