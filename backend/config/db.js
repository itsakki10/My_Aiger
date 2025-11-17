import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose
    .connect(
      "REMOVED@cluster0.xm6qtbh.mongodb.net/MyAiger"
    )
    .then(() => console.log("DB connected successfully"));
};
