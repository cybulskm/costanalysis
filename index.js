import http from 'http';
import fs from 'fs';
import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';
import { error } from 'console';

// Import the 'open' module dynamically
const { default: open } = await import('open');

const app = express();

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Set the 'views' directory for any views being rendered via res.render()
app.set('views', path.join(__dirname, 'views'));

// Set the view engine to render HTML files using EJS
app.engine('html', (await import('ejs')).renderFile);
app.set('view engine', 'html');

// Default route that renders 'report/index.html'
app.get('/', (req, res) => {
    console.log('Redirect to /report/index');
    res.render("report/index", {
        report: []
    });
});

// Explicit route to '/report/index'
app.get('/report/index', (req, res) => {
    console.log('Render /report/index');
    res.render("report/index", {
        report: []
    });
});

// Handle form submissions with a POST request to '/report/create'
app.post('/report/create', express.urlencoded({ extended: true }), (req, res) => {
    console.log('POST: Form uploaded');
    console.log(req.body);

    res.render("report/create", {
        report: req.body
    });
});

// Start the server and open the default browser to the specified URL
app.listen(8080, () => {
    console.log('App listening on port 8080');
    open(`http://localhost:8080`); // Automatically open the URL
});
