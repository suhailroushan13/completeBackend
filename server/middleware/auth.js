import jwt from "jsonwebtoken";
import config from "config";

const JWT_SECRET = config.get("JWT_SECRET");

const authMiddleware = (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.headers["authorization"];
  console.log(authHeader)
  
  const token = authHeader.split(" ")[1]; // Extract the token part

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Verify the token
    req.user = decoded; // Attach user information to the request object
    next(); // Proceed to the next middleware or route
  } catch (error) {
    console.error("Invalid token:", error);
    return res.status(401).json({ msg: "Invalid token" });
  }
};

export default authMiddleware;
