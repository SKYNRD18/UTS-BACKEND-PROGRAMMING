// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Initialize express app
const app = express();
const port = 4000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/bankDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

// Define MongoDB schema
const transactionSchema = new mongoose.Schema({
  NIM: String,
  amount: Number,
  dateTime: Date,
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Middleware for parsing JSON bodies
app.use(bodyParser.json());

// Endpoint for depositing money
app.post('/transactions/deposit', async (req, res) => {
  try {
    const { NIM, amount, dateTime } = req.body;
    const transaction = new Transaction({ NIM, amount, dateTime });
    await transaction.save();
    res.status(201).send('Deposit successful.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint for getting account balance
app.get('/accounts/balance', async (req, res) => {
  try {
    // Fetch balance from database
    const balance = await Transaction.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    // Fetching last transaction
    const lastTransaction = await Transaction.findOne().sort({ dateTime: -1 });
    // Return balance and last transaction details
    res.status(200).json({ balance: balance[0].total, lastTransaction });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint for updating transaction details
app.put('/transactions/transfer/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, targetAccount } = req.body;
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { amount, targetAccount },
      { new: true }
    );
    res.status(200).json(updatedTransaction);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint for canceling a transaction
app.delete('/transactions/cancel/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Transaction.findByIdAndDelete(id);
    res.status(200).send('Transaction canceled successfully.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server runs at port ${port} in development environment`);
});
