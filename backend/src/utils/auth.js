import jwt from "jsonwebtoken";

export function signToken(user) {
  const secret = process.env.JWT_SECRET || "devsecret";
  return jwt.sign(user, secret, { expiresIn: "15m" }); // 15 minute session
}

export function signRefreshToken(user) {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || "devsecret";
  return jwt.sign(user, secret, { expiresIn: "7d" }); // 7 day refresh
}

export function verifyRefreshToken(token) {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || "devsecret";
  return jwt.verify(token, secret);
}

export function requireAuth(roles) {
  return (req, res, next) => {
    try {
      const raw = req.header("auth-token") || req.header("authorization") || "";
      const token = raw.replace(/^Bearer\s+/i, "");
      if (!token) return res.status(401).json({ message: "Missing token" });
      const secret = process.env.JWT_SECRET || "devsecret";
      const user = jwt.verify(token, secret);
      if (roles && !roles.includes(user.role)) return res.status(403).json({ message: "Forbidden" });
      req.user = user;
      next();
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
}


