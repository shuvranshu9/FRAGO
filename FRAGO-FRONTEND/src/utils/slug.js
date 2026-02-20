export const generateSlug = (name, id) => {
  if (!name) return id.toString();
  const sanitizedName = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/-+/g, "-"); // Replace multiple - with single -

  return `${sanitizedName}-${id}`;
};

export const extractIdFromSlug = (slug) => {
  if (!slug) return null;
  const parts = slug.split("-");
  const id = parts[parts.length - 1];
  return isNaN(id) ? null : id;
};
