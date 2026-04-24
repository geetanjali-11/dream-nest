const mongoose = require("mongoose");
const { mongoUrl } = require("./config");
const { attachGridFsBucket } = require("./uploads");

let connectionPromise;

const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(mongoUrl, {
        dbName: "Dream_Nest",
      })
      .then((mongooseInstance) => {
        attachGridFsBucket(mongooseInstance.connection.db);
        return mongooseInstance.connection;
      })
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }

  return connectionPromise;
};

module.exports = { connectToDatabase };
