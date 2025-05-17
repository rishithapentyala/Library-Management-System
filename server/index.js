import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'library_management_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database with sample data if needed
const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Create tables if they don't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_login (
        email_id VARCHAR(255) PRIMARY KEY,
        password VARCHAR(255) NOT NULL
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS librarian_login (
        admin_id VARCHAR(255) PRIMARY KEY,
        password VARCHAR(255) NOT NULL
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_database (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        email_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        FOREIGN KEY (email_id) REFERENCES user_login(email_id)
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS books (
        book_id INT AUTO_INCREMENT PRIMARY KEY,
        book_title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        edition VARCHAR(50) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        no_of_copies INT NOT NULL,
        available_books INT NOT NULL
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS requests (
        request_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        book_id INT NOT NULL,
        book_title VARCHAR(255) NOT NULL,
        approve_status BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user_database(user_id),
        FOREIGN KEY (book_id) REFERENCES books(book_id)
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_inventory (
        ui_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        book_id INT NOT NULL,
        book_title VARCHAR(255) NOT NULL,
        issue_date DATE NOT NULL,
        return_date DATE NOT NULL,
        fine INT DEFAULT 0,
        returned BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (user_id) REFERENCES user_database(user_id),
        FOREIGN KEY (book_id) REFERENCES books(book_id)
      )
    `);
    
    // Insert sample data if tables are empty
    const [userRows] = await connection.query('SELECT * FROM user_login');
    if (userRows.length === 0) {
      // Insert sample user_login
      const hashedPassword = await bcrypt.hash('password123', 10);
      await connection.query(`
        INSERT INTO user_login (email_id, password) VALUES 
        ('student1@srmap.edu.in', ?),
        ('student2@srmap.edu.in', ?)
      `, [hashedPassword, hashedPassword]);
      
      // Insert sample user_database
      await connection.query(`
        INSERT INTO user_database (email_id, name, phone_number) VALUES 
        ('student1@srmap.edu.in', 'John Doe', '9876543210'),
        ('student2@srmap.edu.in', 'Jane Smith', '9876543211')
      `);
    }
    
    const [adminRows] = await connection.query('SELECT * FROM librarian_login');
    if (adminRows.length === 0) {
      // Insert sample librarian_login
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await connection.query(`
        INSERT INTO librarian_login (admin_id, password) VALUES 
        ('admin1', ?),
        ('admin2', ?)
      `, [hashedPassword, hashedPassword]);
    }
    
    const [bookRows] = await connection.query('SELECT * FROM books');
    if (bookRows.length === 0) {
      // Insert sample books
      await connection.query(`
        INSERT INTO books (book_title, author, edition, subject, no_of_copies, available_books) VALUES 
        ('Data Structures and Algorithms', 'Thomas H. Cormen', '3rd Edition', 'Computer Science', 5, 5),
        ('Introduction to Machine Learning', 'Andrew Ng', '2nd Edition', 'Artificial Intelligence', 3, 3),
        ('Fundamentals of Database Systems', 'Ramez Elmasri', '7th Edition', 'Database Management', 4, 4),
        ('Computer Networks', 'Andrew S. Tanenbaum', '5th Edition', 'Networking', 3, 3),
        ('Operating System Concepts', 'Abraham Silberschatz', '10th Edition', 'Operating Systems', 6, 6),
        ('Artificial Intelligence: A Modern Approach', 'Stuart Russell', '4th Edition', 'Artificial Intelligence', 2, 2),
        ('Software Engineering', 'Ian Sommerville', '10th Edition', 'Software Development', 4, 4),
        ('Computer Organization and Architecture', 'William Stallings', '11th Edition', 'Computer Architecture', 3, 3),
        ('Introduction to Algorithms', 'Thomas H. Cormen', '4th Edition', 'Computer Science', 5, 5),
        ('Discrete Mathematics', 'Kenneth H. Rosen', '8th Edition', 'Mathematics', 4, 4)
      `);
    }
    
    connection.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

// Routes
// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate email format
    if (!email.endsWith('@srmap.edu.in')) {
      return res.status(400).json({ message: 'Invalid email format. Must be a university email.' });
    }
    
    const [rows] = await pool.query('SELECT * FROM user_login WHERE email_id = ?', [email]);
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Fetch user details
    const [userRows] = await pool.query('SELECT * FROM user_database WHERE email_id = ?', [email]);
    
    if (userRows.length === 0) {
      return res.status(404).json({ message: 'User account not found' });
    }
    
    const userData = userRows[0];
    
    // Generate JWT token
    const token = jwt.sign(
      { id: userData.user_id, email: userData.email_id, role: 'user' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        user_id: userData.user_id,
        email: userData.email_id,
        name: userData.name,
        phone: userData.phone_number
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.post('/api/auth/admin-login', async (req, res) => {
  try {
    const { adminId, password } = req.body;
    
    const [rows] = await pool.query('SELECT * FROM librarian_login WHERE admin_id = ?', [adminId]);
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid admin ID or password' });
    }
    
    const admin = rows[0];
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid admin ID or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: admin.admin_id, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      admin: {
        admin_id: admin.admin_id,
        name: 'Librarian', // Default name for admin
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during admin login' });
  }
});

// Books routes
app.get('/api/books', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM books ORDER BY book_title');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Server error while fetching books' });
  }
});

app.get('/api/books/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM books WHERE book_id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching book details:', error);
    res.status(500).json({ message: 'Server error while fetching book details' });
  }
});

app.post('/api/books/request', async (req, res) => {
  try {
    const { user_id, book_id, book_title } = req.body;
    
    // Check if user has already requested this book
    const [existingRequests] = await pool.query(
      'SELECT * FROM requests WHERE user_id = ? AND book_id = ? AND approve_status = 0', 
      [user_id, book_id]
    );
    
    if (existingRequests.length > 0) {
      return res.status(400).json({ message: 'You have already requested this book' });
    }
    
    // Check if user has already borrowed this book
    const [existingBorrowed] = await pool.query(
      'SELECT * FROM user_inventory WHERE user_id = ? AND book_id = ? AND returned = 0', 
      [user_id, book_id]
    );
    
    if (existingBorrowed.length > 0) {
      return res.status(400).json({ message: 'You have already borrowed this book' });
    }
    
    // Check if the book is available
    const [bookRows] = await pool.query('SELECT available_books FROM books WHERE book_id = ?', [book_id]);
    
    if (bookRows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    if (bookRows[0].available_books === 0) {
      return res.status(400).json({ message: 'This book is currently unavailable' });
    }
    
    // Create the request
    const [result] = await pool.query(
      'INSERT INTO requests (user_id, book_id, book_title) VALUES (?, ?, ?)', 
      [user_id, book_id, book_title]
    );
    
    const [newRequest] = await pool.query('SELECT * FROM requests WHERE request_id = ?', [result.insertId]);
    
    res.status(201).json(newRequest[0]);
  } catch (error) {
    console.error('Error requesting book:', error);
    res.status(500).json({ message: 'Server error while requesting book' });
  }
});

app.get('/api/books/user-request/:userId/:bookId', async (req, res) => {
  try {
    const { userId, bookId } = req.params;
    
    const [rows] = await pool.query(
      'SELECT * FROM requests WHERE user_id = ? AND book_id = ?', 
      [userId, bookId]
    );
    
    if (rows.length === 0) {
      return res.json(null);
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching user request:', error);
    res.status(500).json({ message: 'Server error while fetching user request' });
  }
});

app.get('/api/books/borrowed/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [rows] = await pool.query(
      'SELECT * FROM user_inventory WHERE user_id = ? ORDER BY returned ASC, return_date ASC', 
      [userId]
    );
    
    // Calculate fines for overdue books
    const today = new Date();
    const updatedRows = rows.map(book => {
      const returnDate = new Date(book.return_date);
      
      if (!book.returned && today > returnDate) {
        const daysDiff = Math.floor((today - returnDate) / (1000 * 60 * 60 * 24));
        book.fine = daysDiff * 1; // ₹1 per day
      }
      
      return book;
    });
    
    res.json(updatedRows);
  } catch (error) {
    console.error('Error fetching borrowed books:', error);
    res.status(500).json({ message: 'Server error while fetching borrowed books' });
  }
});

// Admin routes
app.post('/api/books', async (req, res) => {
  try {
    const { book_title, author, edition, subject, no_of_copies } = req.body;
    
    if (!book_title || !author || !edition || !subject || !no_of_copies) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const available_books = no_of_copies; // Initially all copies are available
    
    await pool.query(
      'INSERT INTO books (book_title, author, edition, subject, no_of_copies, available_books) VALUES (?, ?, ?, ?, ?, ?)', 
      [book_title, author, edition, subject, no_of_copies, available_books]
    );
    
    res.status(201).json({ message: 'Book added successfully' });
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ message: 'Server error while adding book' });
  }
});

app.put('/api/books/:id', async (req, res) => {
  try {
    const { book_title, author, edition, subject, no_of_copies } = req.body;
    const bookId = req.params.id;
    
    if (!book_title || !author || !edition || !subject || !no_of_copies) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Get current available books to calculate the difference
    const [currentBookRows] = await pool.query('SELECT available_books, no_of_copies FROM books WHERE book_id = ?', [bookId]);
    
    if (currentBookRows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    const currentBook = currentBookRows[0];
    const copiesDifference = no_of_copies - currentBook.no_of_copies;
    const newAvailableBooks = currentBook.available_books + copiesDifference;
    
    if (newAvailableBooks < 0) {
      return res.status(400).json({ message: 'Cannot reduce copies below the number currently borrowed' });
    }
    
    await pool.query(
      'UPDATE books SET book_title = ?, author = ?, edition = ?, subject = ?, no_of_copies = ?, available_books = ? WHERE book_id = ?', 
      [book_title, author, edition, subject, no_of_copies, newAvailableBooks, bookId]
    );
    
    res.json({ message: 'Book updated successfully' });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ message: 'Server error while updating book' });
  }
});

app.delete('/api/books/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    
    // Check if book is currently borrowed
    const [borrowedRows] = await pool.query(
      'SELECT * FROM user_inventory WHERE book_id = ? AND returned = 0', 
      [bookId]
    );
    
    if (borrowedRows.length > 0) {
      return res.status(400).json({ message: 'Cannot delete book that is currently borrowed' });
    }
    
    // Check if book has pending requests
    const [requestRows] = await pool.query(
      'SELECT * FROM requests WHERE book_id = ? AND approve_status = 0', 
      [bookId]
    );
    
    if (requestRows.length > 0) {
      return res.status(400).json({ message: 'Cannot delete book that has pending requests' });
    }
    
    // Delete from user_inventory if returned
    await pool.query('DELETE FROM user_inventory WHERE book_id = ? AND returned = 1', [bookId]);
    
    // Delete approved requests
    await pool.query('DELETE FROM requests WHERE book_id = ?', [bookId]);
    
    // Delete the book
    await pool.query('DELETE FROM books WHERE book_id = ?', [bookId]);
    
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Server error while deleting book' });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM user_database ORDER BY name');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

app.get('/api/admin/requests', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.*, u.name as user_name, u.email_id as user_email
      FROM requests r
      JOIN user_database u ON r.user_id = u.user_id
      ORDER BY r.created_at DESC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Server error while fetching requests' });
  }
});

app.put('/api/admin/requests/:id/approve', async (req, res) => {
  try {
    const requestId = req.params.id;
    
    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Get request details
      const [requestRows] = await connection.query('SELECT * FROM requests WHERE request_id = ?', [requestId]);
      
      if (requestRows.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ message: 'Request not found' });
      }
      
      const request = requestRows[0];
      
      // Check if book is still available
      const [bookRows] = await connection.query('SELECT available_books FROM books WHERE book_id = ?', [request.book_id]);
      
      if (bookRows.length === 0 || bookRows[0].available_books === 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ message: 'Book is no longer available' });
      }
      
      // Update request status
      await connection.query('UPDATE requests SET approve_status = 1 WHERE request_id = ?', [requestId]);
      
      // Calculate issue and return dates
      const issueDate = new Date();
      const returnDate = new Date();
      returnDate.setDate(returnDate.getDate() + 30); // 30 days loan period
      
      // Add to user inventory
      await connection.query(
        'INSERT INTO user_inventory (user_id, book_id, book_title, issue_date, return_date) VALUES (?, ?, ?, ?, ?)', 
        [request.user_id, request.book_id, request.book_title, issueDate, returnDate]
      );
      
      // Update book availability
      await connection.query(
        'UPDATE books SET available_books = available_books - 1 WHERE book_id = ?', 
        [request.book_id]
      );
      
      await connection.commit();
      res.json({ message: 'Request approved successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ message: 'Server error while approving request' });
  }
});

app.put('/api/admin/requests/:id/deny', async (req, res) => {
  try {
    const requestId = req.params.id;
    
    const [result] = await pool.query('DELETE FROM requests WHERE request_id = ?', [requestId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    res.json({ message: 'Request denied successfully' });
  } catch (error) {
    console.error('Error denying request:', error);
    res.status(500).json({ message: 'Server error while denying request' });
  }
});

app.get('/api/admin/borrowed-books', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ui.*, u.name as user_name, u.email_id as user_email
      FROM user_inventory ui
      JOIN user_database u ON ui.user_id = u.user_id
      ORDER BY ui.returned ASC, ui.return_date ASC
    `);
    
    // Calculate fines for overdue books
    const today = new Date();
    const updatedRows = rows.map(book => {
      const returnDate = new Date(book.return_date);
      
      if (!book.returned && today > returnDate) {
        const daysDiff = Math.floor((today - returnDate) / (1000 * 60 * 60 * 24));
        book.fine = daysDiff * 1; // ₹1 per day
      }
      
      return book;
    });
    
    res.json(updatedRows);
  } catch (error) {
    console.error('Error fetching borrowed books:', error);
    res.status(500).json({ message: 'Server error while fetching borrowed books' });
  }
});

app.put('/api/admin/returns/:id/mark-returned', async (req, res) => {
  try {
    const uiId = req.params.id;
    
    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Get borrowed book details
      const [borrowedRows] = await connection.query('SELECT * FROM user_inventory WHERE ui_id = ?', [uiId]);
      
      if (borrowedRows.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ message: 'Borrowed book record not found' });
      }
      
      const borrowedBook = borrowedRows[0];
      
      if (borrowedBook.returned) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ message: 'Book has already been returned' });
      }
      
      // Calculate fine
      const today = new Date();
      const returnDate = new Date(borrowedBook.return_date);
      let fine = 0;
      
      if (today > returnDate) {
        const daysDiff = Math.floor((today - returnDate) / (1000 * 60 * 60 * 24));
        fine = daysDiff * 1; // ₹1 per day
      }
      
      // Update return status and fine
      await connection.query(
        'UPDATE user_inventory SET returned = 1, fine = ? WHERE ui_id = ?', 
        [fine, uiId]
      );
      
      // Update book availability
      await connection.query(
        'UPDATE books SET available_books = available_books + 1 WHERE book_id = ?', 
        [borrowedBook.book_id]
      );
      
      await connection.commit();
      res.json({ message: 'Book marked as returned successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error marking book as returned:', error);
    res.status(500).json({ message: 'Server error while marking book as returned' });
  }
});

app.get('/api/admin/dashboard-stats', async (req, res) => {
  try {
    // Get total and available books
    const [booksStats] = await pool.query(`
      SELECT SUM(no_of_copies) as totalBooks, SUM(available_books) as availableBooks
      FROM books
    `);
    
    // Get total users
    const [usersStats] = await pool.query(`
      SELECT COUNT(*) as totalUsers
      FROM user_database
    `);
    
    // Get active requests
    const [requestsStats] = await pool.query(`
      SELECT COUNT(*) as activeRequests
      FROM requests
      WHERE approve_status = 0
    `);
    
    // Get pending returns and total fines
    const [returnsStats] = await pool.query(`
      SELECT COUNT(*) as pendingReturns, SUM(fine) as totalFines
      FROM user_inventory
      WHERE returned = 0
    `);
    
    const stats = {
      totalBooks: booksStats[0].totalBooks || 0,
      availableBooks: booksStats[0].availableBooks || 0,
      totalUsers: usersStats[0].totalUsers || 0,
      activeRequests: requestsStats[0].activeRequests || 0,
      pendingReturns: returnsStats[0].pendingReturns || 0,
      totalFines: returnsStats[0].totalFines || 0
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard stats' });
  }
});

// Initialize database and start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });