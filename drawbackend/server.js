const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");


const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb+srv://username:passwordcluster0.6qjfwdy.mongodb.net/myecom',{
  useNewUrlParser: true,
  useUnifiedTopology: true,
   // specify the database name separately
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB connection error:', err));



// Define User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

app.use(express.json());
app.use(cors());

// Register Route
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create new user
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login Route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    // Generate JWT token
    const token = jwt.sign({ email: user.email }, 'secret');
    
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const server = http.createServer(app);
const io = socketio(server);

app.get('/', (req, res) => {
  res.send("server started");
});

io.engine.on("connection_error", (err) => {
  console.log(err.req);      // the request object
  console.log(err.code);     // the error code, for example 1
  console.log(err.message);  // the error message, for example "Session ID unknown"
  console.log(err.context);  // some additional error context
});

io.on("connection", (socket) => {
  let roomIdg, messageg;
  socket.on("whiteboarddata", (data) => {
    messageg = data.message;
    socket.broadcast.to(roomIdg).emit("whiteboardrespponse", { message: messageg });

    io.to(roomIdg).emit("whiteboardresponse", { message: "Initial message" });
  });

  socket.on('cursorMove', (data) => {
    io.emit("cursorMove", { postion: data.position, userid: socket.id });
  });

  socket.on("userjoined", (data) => {
    const { name, userId, roomId, host, presenter } = data;
    roomIdg = roomId;
    socket.join(roomId);
    socket.emit("userIsJoined", { success: true, roomId: roomId });
    io.to(roomId).emit("whiteboardresponse", { message: socket.id });
  });

  socket.on("sendmessage", (data) => {
    console.log(data.message);
  });

  socket.on('drawing', (data) => {
    io.emit("mousedown", data);
    socket.emit('drawing', data);
  });

  console.log("user connectedd");
});

const port = process.env.PORT || 5000;
server.listen(port, () => console.log("server running on port"));
