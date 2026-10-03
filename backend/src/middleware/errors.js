export function notFound(req, res) {
  res.status(404).json({ success: false, message: "Endpoint not found." });
}
export function errors(err, req, res, next) {
  console.error(err);
  if (res.headersSent) return next(err);
  const status =
    err.status ||
    (err.name === "ValidationError" ? 400 : err.code === 11000 ? 409 : 500);
  res.status(status).json({
    success: false,
    message: status === 500 ? "Something went wrong." : err.message,
  });
}
