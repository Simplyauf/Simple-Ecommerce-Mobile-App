const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { config } = require("./config/config");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const uploadRouter = require("./routes/upload");
const categoryRoutes = require("./routes/categories");
const orderRoutes = require("./routes/orders");
const errorHandler = require("./middleware/errorHandler");
const responseHandler = require("./middleware/responseHandler");
const fileUpload = require("express-fileupload");

const app = express();

app.use(responseHandler);

app.use(
  fileUpload({
    createParentPath: true,
    limits: {
      fileSize: 2 * 1024 * 1024,
    },
  })
);

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/upload", uploadRouter);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);

app.use(errorHandler);

const PORT = config.port || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
