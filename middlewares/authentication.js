import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authenticateUser = async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    var user = await getUser(token);
    if (user) {
      req.user = user;
      return next();
    }
  }
  return res.status(401).json({ message: "Unauthorized" });
};

const checkIfAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    var user = await getUser(token);
    if (user) {
      req.user = user;
    }
  }
  next();
};

const authorizePermission = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};

const getUser = async (token) => {
  try {
    const { email } = jwt.verify(
      token,
      "asdjpoiacvnjianouqweru3094uqbpoaf34124"
    ); //should be in .env
    return await User.findOne({ email: email });
  } catch (error) {
    return null;
  }
};

export { authenticateUser, authorizePermission };
