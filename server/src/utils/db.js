import { connect } from "mongoose";

const dbConnection = async () => {
  try {
    await connect("mongodb+srv://giovaciccale:45ZgrOpY4dAr8SJR@mycluster-ciccale.tag7jqq.mongodb.net/super?retryWrites=true&w=majority", {
      serverSelectionTimeoutMS: 5000, // Opcional, pero puedes mantenerlo si quieres
    });
    console.log("db mongo connected");
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error.message);
  }
};

export default dbConnection;
