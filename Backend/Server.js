const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 8081;

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

// Parse JSON bodies
app.use(bodyParser.json());

// Create connection to the database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Mysql-prakashs',
  database: 'msrfruits'
});

// Connect to the database
db.connect(err => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('MySQL connected...');
});

// Route to get all products
app.get('/prodects', (req, res) => {
  const sql = 'SELECT * FROM prodects';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Database query error' });
    }
    res.json(results);
  });
});

// Route to add a new product
app.post('/prodects', (req, res) => {
  const { OrderId, Fruit, Quantity, Price, Amount, TotalAmount } = req.body;
  const sql = 'INSERT INTO prodects (OrderId, Fruit, Quantity, Price, Amount, TotalAmount) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [OrderId, Fruit, Quantity, Price, Amount, TotalAmount], (err, result) => {
    if (err) {
      console.error('Database insertion error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'New product added', id: result.insertId });
  });
});

// Route to delete a product by ID
app.delete('/prodects/:id', (req, res) => {
  const id = req.params.id;
  console.log('ID received for deletion:', id); // Debugging log

  if (!id || isNaN(id)) {
    return res.status(400).send('Invalid id.');
  }

  const query = 'DELETE FROM prodects WHERE id = ?';
  db.query(query, [id], (error, results) => {
    if (error) {
      console.error('Error deleting record:', error);
      return res.status(500).send('Error deleting record.');
    }
    res.send('Record deleted successfully.');
  });
});








// Route to delete all products
app.delete('/prodects', (req, res) => {
  const sql = 'DELETE FROM prodects';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Database deletion error:', err);
      return res.status(500).json({ error: 'Database deletion error' });
    }
    res.json({ message: 'All products deleted', affectedRows: result.affectedRows });
  });
});






// Route to handle posting user data
app.post('/users', (req, res) => {
  const { OrderId, UserName, UserMobile } = req.body;
  const query = 'INSERT INTO users (OrderId, UserName, UserMobile) VALUES (?, ?, ?)';
  db.query(query, [OrderId, UserName, UserMobile], (err, result) => {
    if (err) {
      console.error('Error inserting user data:', err);
      return res.status(500).json({ error: 'Error inserting data' });
    }
    res.status(201).json({ message: 'User data inserted successfully' });
  });
});

// Route to get all customer data
app.get('/customerlist', (req, res) => {
  const query = `
    SELECT cl.*, os.OrderStatus
    FROM customerlist cl
    LEFT JOIN orderstatus os ON cl.OrderId = os.OrderId;
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching data:', error);
      res.status(500).send('Error fetching data.');
    } else {
      res.json(results);
    }
  });
});





// Route to get details of a specific order by OrderId
app.get('/customerlist/:orderId', (req, res) => {
  const { orderId } = req.params;
  const sql = 'SELECT * FROM customerlist WHERE OrderId = ?';

  db.query(sql, [orderId], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Database query error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: `Order with ID ${orderId} not found.` });
    }

    res.json(results);
  });
});



app.post('/customerlist', (req, res) => {
  const { 
    OrderId, 
    UserName, 
    UserMobile, 
    tableData, 
    TotalAmount, 
    TotalItem, 
    OrderStatus, 
    Comm, 
    LorryRent, 
    Cooly, 
    NoteCash, 
    CommTableTotal, 
    OrderType, 
    OverAllAmount // Include OverAllAmount in the request body
  } = req.body;

  // Insert into customerlist
  const customerQuery = `
    INSERT INTO customerlist (
      OrderId, 
      UserName, 
      UserMobile, 
      Fruit, 
      Quantity, 
      Price, 
      Amount, 
      OrderStatus, 
      Comm, 
      LorryRent, 
      Cooly, 
      NoteCash, 
      CommTableTotal, 
      OrderType,
      OverAllAmount  -- Include OverAllAmount in the SQL query
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // Loop through the tableData and insert each row
  tableData.forEach(async (item) => {
    const customerValues = [
      OrderId,
      UserName,
      UserMobile,
      item.Fruit,
      item.Quantity,
      item.Price,
      item.Amount,
      OrderStatus,
      Comm,
      LorryRent,
      Cooly,
      NoteCash,
      CommTableTotal,
      OrderType,
      OverAllAmount  // Include OverAllAmount in the values array
    ];

    db.query(customerQuery, customerValues, (error, results) => {
      if (error) {
        console.error('Error inserting customer data:', error);
        return res.status(500).send('Error inserting customer data.');
      }
    });
  });

  // Insert into prodects (assuming product information is also in tableData)
  const productQuery = `
    INSERT INTO prodects (OrderId, Fruit, Quantity, Price, Amount, TotalAmount)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  tableData.forEach(async (item) => {
    const productValues = [
      OrderId,
      item.Fruit,
      item.Quantity,
      item.Price,
      item.Amount,
      TotalAmount
    ];

    db.query(productQuery, productValues, (error, results) => {
      if (error) {
        console.error('Error inserting product data:', error);
        return res.status(500).send('Error inserting product data.');
      }
    });
  });

  res.send('Data inserted successfully.');
});





// app.get('/customerlist/length', async (req, res) => {
//   try {
//     const customers = await CustomerModel.find(); // Adjust according to your DB
//     res.json({ length: customers.length });
//   } catch (error) {
//     res.status(500).json({ error: 'Error fetching customer list length.' });
//   }
// });

// Route to post order status
app.post('/orderstatus', (req, res) => {
  const { OrderId, OrderStatus } = req.body;

  if (!OrderId || !OrderStatus) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = 'INSERT INTO orderstatus (OrderId, OrderStatus) VALUES (?, ?)';
  db.query(query, [OrderId, OrderStatus], (error, results) => {
    if (error) {
      console.error('Error inserting order status:', error);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ message: 'Order status added successfully' });
  });
});



// orderitem


// Route to get customerlist data filtered by created_at
app.get('/customerlist', (req, res) => {
  const { startDate, endDate } = req.query;

  // Query to filter by created_at column, check if startDate and endDate are provided
  let sql = 'SELECT * FROM customerlist WHERE 1=1';  // Default query to get all data
  const queryParams = [];

  if (startDate) {
    sql += ' AND created_at >= ?';
    queryParams.push(startDate);
  }

  if (endDate) {
    sql += ' AND created_at <= ?';
    queryParams.push(endDate);
  }

  db.query(sql, queryParams, (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Database query error' });
    }
    res.json(results);
  });
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
