// import express from "express";
// const app = express();
// app.use(express.json());

// app.get("/", (req, res) => {
//     res.send("API Running");
// });

// app.listen(5000, () => {
//     console.log("Server running on port 5000");
// });

import app from "./app.js";

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});