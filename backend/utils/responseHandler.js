const isApiRequest = (req) => {
  return Boolean(
    req.xhr ||
    req.headers.accept?.includes("application/json") ||
    req.originalUrl.startsWith("/api")
  );
};

const sendResponse = (req, res, options = {}) => {
  const {
    statusCode = 200,
    success = statusCode < 400,
    message = "",
    data = null,
    redirectUrl = null,
    renderView = null,
    flashType = statusCode >= 400 ? "error" : "info",
  } = options;

  if (isApiRequest(req)) {
    const payload = { success };
    if (message) payload.message = message;
    if (data && typeof data === "object") {
      Object.assign(payload, data);
    }
    return res.status(statusCode).json(payload);
  }

  if (message && flashType && typeof req.flash === "function") {
    req.flash(flashType, message);
  }

  if (renderView) {
    return res.status(statusCode).render(renderView, { message, ...data });
  }

  if (redirectUrl) {
    return res.redirect(redirectUrl);
  }

  return res.status(statusCode).send(message);
};

module.exports = {
  isApiRequest,
  sendResponse,
};
