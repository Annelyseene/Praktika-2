require("dotenv").config();
const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Импорт маршрутов
const { router: authRoutes, authenticateToken } = require("./routes/auth");
app.use("/auth", authRoutes);
app.use("/films", authenticateToken, require("./routes/films"));
app.use("/actors", authenticateToken, require("./routes/actors"));
app.use("/languages", authenticateToken, require("./routes/languages"));
app.use("/categories", authenticateToken, require("./routes/categories"));

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
