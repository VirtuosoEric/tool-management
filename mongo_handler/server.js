const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

let mongoUrlLocal = "mongodb://admin:password@localhost:27017/tool_management";
let mongoUrlDocker = "mongodb://admin:password@mongodb/tool_management";

// MongoDB connection
mongoose.connect(mongoUrlDocker, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  authSource: 'admin' // Ensure authentication against the 'admin' database
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
  console.log('Database Name:', db.name); // Log the database name
});

// Tool schema and model
const toolSchema = new mongoose.Schema({
  name: String,
  distance: String,
  health: String
});
const Tool = mongoose.model('Tool', toolSchema);

// POST endpoint to create a new tool
app.post('/api/tools', async (req, res) => {
  console.log('Received POST request at /api/tools');
  console.log('Request body:', req.body);

  const newTool = new Tool(req.body);

  try {
    const savedTool = await newTool.save();
    console.log('Tool saved successfully:', savedTool);
    res.status(201).json(savedTool);
  } catch (error) {
    console.error('Error saving tool:', error);
    res.status(400).json({ message: 'Error saving tool', error });
  }
});

// GET endpoint to retrieve all tools (for verification)
app.get('/api/tools', async (req, res) => {
  try {
    const tools = await Tool.find();
    console.log('Retrieved tools:', tools);
    res.json(tools);
  } catch (error) {
    console.error('Error retrieving tools:', error);
    res.status(400).json({ message: 'Error retrieving tools', error });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
