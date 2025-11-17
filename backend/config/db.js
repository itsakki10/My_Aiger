import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose
    .connect(
      "mongodb+srv://mrh057784:Akki1310@cluster0.xm6qtbh.mongodb.net/MyAiger"
    )
    .then(() => console.log("DB connected successfully"));
};
