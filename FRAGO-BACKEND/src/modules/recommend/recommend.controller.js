import * as Recommendation from "./recommend.model.js";
import {
  MOODS,
  CATEGORIES,
  PLACES,
} from "../../utils/recommendationConstants.js";

export const getRecommendationOptions = (req, res) => {
  res.json({
    moods: MOODS,
    categories: CATEGORIES,
    places: PLACES,
  });
};

export const recommendPerfumeController = async (req, res) => {
  try {
    const { mood, category_id, place } = req.query;

    if (!mood || !category_id || !place) {
      return res.status(400).json({
        message: "mood, category_id and place are required",
      });
    }

    const perfumes = await Recommendation.getRecommendedPerfumes({
      mood,
      category_id,
      place,
    });

    res.json({
      count: perfumes.length,
      data: perfumes,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
