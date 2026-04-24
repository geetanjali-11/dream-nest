const jwtSecret = process.env.JWT_SECRET;
const mongoUrl = process.env.MONGO_URL;
const clientUrl = process.env.CLIENT_URL;
const isProduction = process.env.NODE_ENV === "production";

if (!mongoUrl) {
  throw new Error("MONGO_URL is not configured.");
}

if (!jwtSecret) {
  throw new Error("JWT_SECRET is not configured.");
}

const getCorsOrigin = () => {
  if (!clientUrl) {
    return true;
  }

  return clientUrl.split(",").map((origin) => origin.trim());
};

module.exports = {
  clientUrl,
  getCorsOrigin,
  isProduction,
  jwtSecret,
  mongoUrl,
};
