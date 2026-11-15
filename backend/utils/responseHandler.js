/**
 * Helper utility to determine if the request is an API request expecting JSON
 * @param {Object} req - Express request object
 * @returns {boolean}
 */
const isApiRequest = (req) => {
  return Boolean(
    req.xhr ||
    req.headers.accept?.includes("application/json") ||
    req.originalUrl.startsWith("/api")
  );
};

/**
 * Unified response handler for dual support (JSON API & EJS Redirects/Views)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} options - Response configuration
 * @param {number} [options.statusCode=200] - HTTP Status Code
 * @param {boolean} [options.success] - Success flag (defaults to true if statusCode < 400)
 * @param {string} [options.message=""] - Message string for API response or flash alert
 * @param {Object} [options.data=null] - Object containing payload data for JSON response
 * @param {string} [options.redirectUrl=null] - Redirect path for traditional EJS web views
 * @param {string} [options.renderView=null] - View name for rendering EJS directly
 * @param {string} [options.flashType] - Flash alert category ('info' | 'error')
 */
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

  if (message && flashType) {
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
