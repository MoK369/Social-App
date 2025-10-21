import { connect } from "mongoose";

const connectDB = async (): Promise<Boolean> => {
  try {
    const result = await connect(process.env.DB_URI!);
    console.log(result.models);
    console.log("MongoDB connected!👌");
    return true;
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
    return false;
  }
};

export default connectDB;
