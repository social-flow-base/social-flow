import Late from "@getlatedev/node";

export const getLateClient = () => {
  const apiKey = process.env.LATE_API_KEY;
  if (!apiKey) {
    throw new Error("LATE_API_KEY is not set");
  }
  return new Late({ apiKey });
};
