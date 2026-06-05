const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse URL-encoded bodies (from HTML forms)
app.use(express.urlencoded({ extended: true }));

// Serve the login page
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login</title>
            <style>
                body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f0f2f5; }
                .login-container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 300px; }
                .form-group { margin-bottom: 15px; }
                .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
                .form-group input { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
                button { width: 100%; padding: 10px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
                button:hover { background-color: #0056b3; }
            </style>
        </head>
        <body>
            <div class="login-container">
                <h2>Login</h2>
                <form action="/login" method="POST">
                    <div class="form-group">
                        <label for="username">Username</label>
                        <input type="text" id="username" name="username" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <button type="submit">Sign In</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

// Handle login form submission
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Generic placeholder for authentication logic
    if (username === 'admin' && password === 'password') {
        res.send('<h1>Login Successful!</h1><p>Welcome to the dashboard.</p>');
    } else {
        res.status(401).send('<h1>Login Failed</h1><p>Invalid username or password.</p><a href="/">Try again</a>');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});