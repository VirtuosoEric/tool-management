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
  maxDistance: Number,
  remainingDistance: Number,
});
const Tool = mongoose.model('Tool', toolSchema);

// POST endpoint to create a new tool
app.post('/api/tools', async (req, res) => {
  console.log('Received POST request at /api/tools');
  console.log('Request body:', req.body);

  const { name, maxDistance, remainingDistance } = req.body;

  // Parse the distances as floating-point numbers
  const parsedMaxDistance = parseFloat(maxDistance);
  const parsedRemainingDistance = parseFloat(remainingDistance);

  // Validate the parsed values
  if (isNaN(parsedMaxDistance) || isNaN(parsedRemainingDistance)) {
    return res.status(400).send('Invalid maxDistance or remainingDistance');
  }

  const newTool = new Tool({
    name,
    maxDistance: parsedMaxDistance,
    remainingDistance: parsedRemainingDistance,
  });

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

// PUT endpoint to update an existing tool
app.put('/api/tools/:id', async (req, res) => {
  const { id } = req.params;
  const { name, maxDistance, remainingDistance } = req.body;

  try {
    const updatedTool = await Tool.findByIdAndUpdate(
      id,
      { name, maxDistance: parseFloat(maxDistance), remainingDistance: parseFloat(remainingDistance) },
      { new: true }
    );
    res.json(updatedTool);
  } catch (error) {
    console.error('Error updating tool:', error);
    res.status(400).json({ message: 'Error updating tool', error });
  }
});

// DELETE endpoint to delete an existing tool
app.delete('/api/tools/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await Tool.findByIdAndDelete(id);
    res.json({ message: 'Tool deleted successfully' });
  } catch (error) {
    console.error('Error deleting tool:', error);
    res.status(400).json({ message: 'Error deleting tool', error });
  }
});

// POST endpoint to recommend tools
app.post('/api/recommend-tools', async (req, res) => {
  const { cuttingLength, cuttingWidths } = req.body;

  try {
    const recommendedTools = [];
    const usedToolIds = new Set();

    for (const width of cuttingWidths) {
      const tool = await Tool.findOne({
        remainingDistance: { $gte: cuttingLength },
        _id: { $nin: Array.from(usedToolIds) }
      }).sort({ remainingDistance: 1 });

      if (tool) {
        recommendedTools.push(tool);
        usedToolIds.add(tool._id);
      } else {
        return res.status(404).json({ message: '刀具不足' });
      }
    }

    res.json(recommendedTools);
  } catch (error) {
    console.error('Error recommending tools:', error);
    res.status(500).json({ message: 'Error recommending tools', error });
  }
});

// POST endpoint to confirm tool selection
app.post('/api/confirm-tools', async (req, res) => {
  const { selectedTools, cuttingLength } = req.body;

  try {
    for (const toolId of selectedTools) {
      const tool = await Tool.findById(toolId);

      if (!tool) {
        return res.status(404).json({ message: `Tool with ID ${toolId} not found` });
      }

      if (tool.remainingDistance < cuttingLength) {
        return res.status(400).json({ message: '刀具不足' });
      }
    }

    // If all tools have enough remaining distance, update them
    for (const toolId of selectedTools) {
      await Tool.findByIdAndUpdate(toolId, {
        $inc: { remainingDistance: -cuttingLength }
      });
    }

    res.status(200).json({ message: 'Tools updated successfully' });
  } catch (error) {
    console.error('Error confirming tools:', error);
    res.status(500).json({ message: 'Error confirming tools', error });
  }
});

// Work schema and model
const workSchema = new mongoose.Schema({
  time: { type: Date, default: Date.now },
  tool_name: String,
  maxDistance: Number,
  remainingDistance: Number,
  health: Number
});
const Work = mongoose.model('Work', workSchema);

// POST endpoint to create a new work record
app.post('/api/work', async (req, res) => {
  const { tool_name, maxDistance, remainingDistance } = req.body;
  const health = remainingDistance / maxDistance;

  const newWork = new Work({
    tool_name,
    maxDistance,
    remainingDistance,
    health
  });

  try {
    const savedWork = await newWork.save();
    res.status(201).json(savedWork);
  } catch (error) {
    console.error('Error saving work record:', error);
    res.status(400).json({ message: 'Error saving work record', error });
  }
});

// GET endpoint to retrieve all work records
app.get('/api/work', async (req, res) => {
  try {
    const works = await Work.find().sort({ time: -1 });
    res.json(works);
  } catch (error) {
    console.error('Error retrieving work records:', error);
    res.status(400).json({ message: 'Error retrieving work records', error });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
