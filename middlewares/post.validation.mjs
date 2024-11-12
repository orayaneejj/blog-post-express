export const validateCreatePostData = (req, res, next) => {
  if (!req.body.title) {
    return res.status(400).json({
      message: "Title is required",
    });
  }

  if (!req.body.image) {
    return res.status(400).json({
      message: "Image is required",
    });
  }

  if (!req.body.category_id) {
    return res.status(400).json({
      message: "Category Id is required",
    });
  }

  if (!req.body.description) {
    return res.status(400).json({
      message: "Description is required",
    });
  }
  if (!req.body.content) {
    return res.status(400).json({
      message: "Content is required",
    });
  }
  if (!req.body.status_id) {
    return res.status(400).json({
      message: "Status Id is required",
    });
  }
  if (typeof req.body.title !== "string") {
    return res.status(400).json({
      message: "Title must be a string",
    });
  }
  if (typeof req.body.image !== "string") {
    return res.status(400).json({
      message: "Image must be a string",
    });
  }
  if (typeof req.body.category_id !== "number") {
    return res.status(400).json({
      message: "Category Id must be a number",
    });
  }
  if (typeof req.body.description !== "string") {
    return res.status(400).json({
      message: "Description must be a string",
    });
  }
  if (typeof req.body.content !== "string") {
    return res.status(400).json({
      message: "Content must be a string",
    });
  }
  if (typeof req.body.status_id !== "number") {
    return res.status(400).json({
      message: "Status Id must be a number",
    });
  }

  next();
};
