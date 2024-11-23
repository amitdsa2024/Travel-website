const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const app = express();

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/signupDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("Connected to MongoDB"));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); // For serving static files like your HTML form

// User Schema and Model
const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// Routes
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/signup.html"); // Serve the signup form
});

app.post("/signup", async (req, res) => {
  const { fullname, email, password, confirm_password } = req.body;

  // Validate passwords
  if (password !== confirm_password) {
    return res.status(400).send("Passwords do not match!");
  }

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("Email already registered. Please log in.");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const newUser = new User({ fullname, email, password: hashedPassword });
    await newUser.save();

    res.status(201).send("Signup successful! <a href='/../login'>Login here</a>");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

