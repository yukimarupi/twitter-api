const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const app = express();
const PORT = 4000;
const prisma = new PrismaClient();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// ユーザー登録
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  const existingUser = await prisma.user.findUnique({ where: { username } });

  if (existingUser) {
    return res.status(400).json({ error: "User already exists." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { username, password: hashedPassword } });

  res.status(201).json({ message: "User registered successfully." });
});

// ログイン
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid password." });
  }

  res.status(200).json({ message: "Login successful.", username });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
    res.send("Welcome to the API. Use /login or /register endpoints.");
  });
