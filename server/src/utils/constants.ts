export const __port__ = 4000;
export const __prod__ = process.env.NODE_ENV === "production";
export const REDIS_URL = __prod__ ? process.env.REDIS_URL : "";
