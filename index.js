import http from 'http';
import fs from 'fs';
import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';

// Dynamically import 'open' module
const { default: open } = await import('open');

// Initialize Express app
const app = express();

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory storage for reports
let reports = [];
let id = 0;

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Set the 'views' directory and configure EJS as the view engine
app.set('views', path.join(__dirname, 'views'));
app.engine('html', (await import('ejs')).renderFile);
app.set('view engine', 'html');

// Default route to render 'report/create.html'
app.get('/', (req, res) => {
    console.log('Redirect to /report/create');
    res.render('report/create');
});

// Route to render all reports
app.get('/report/all', (req, res) => {
    console.log('Render /report/all');
    res.render('report/all', { reports });
});

// Route to render report creation page
app.get('/report/create', (req, res) => {
    console.log('Render /report/create');
    res.render('report/create');
});

// Route to render specific report by ID
app.get('/report/index/:id', (req, res) => {
    const { id } = req.params;
    const reportData = reports[id];
    if (reportData) {
        const { userData, report, monthlyExpenses } = reportData;
        res.render('report/index', { userdata: userData, report, monthlyExpenses });
    } else {
        res.status(404).send('Report not found');
    }
});

// Handle form submissions and create new reports
app.post('/report/create', express.urlencoded({ extended: true }), (req, res) => {
    console.log('POST: Form uploaded');

    const taxIncluded = req.body.taxIncluded === "on";
    const price = Number(req.body.Price);
    let taxes = Number(req.body.tax);

    // Calculate taxes if not included in the price and adjust the total price accordingly
    if (taxIncluded) {
        taxes = price * (Number(req.body.taxRate) / 100);
    }

    const report = processFinances(req.body, taxes);
    const monthlyExpenses = {
        Insurance: Number(req.body.Insurance),
        Financing: (price - Number(req.body.Downpayment)) * Number(req.body.Financing) / 100,
        Other: Number(req.body.Other),
    };
    const userData = {
        Price: price,
        Taxes: taxes,
        Downpayment: Number(req.body.Downpayment),
        totalMonthlyExpenses: Math.round(monthlyExpenses.Insurance + monthlyExpenses.Financing + monthlyExpenses.Other).toFixed(2),
    };

    reports.push({ id: id++, report, userData, monthlyExpenses });
    res.render('report/index', { userdata: userData, report, monthlyExpenses });
});

// Start the server and automatically open the default browser
app.listen(8080, () => {
    console.log('App listening on port 8080');
    open('http://localhost:8080');
});

// Function to process financial data
function processFinances(entrydata, taxes) {
    const entry = { ...entrydata };
    for (let field in entry) {
        entry[field] = Number(entry[field]) || 0;
    }

    const totalExpenses = entry.Other + entry.Insurance + (entry.Financing / 100) * (entry.Price - entry.Downpayment) + taxes;
    const monthlyExpenses = totalExpenses / entry.Wage;
    const weeklyHours = monthlyExpenses / 4;
    const dailyHours = weeklyHours / 7;
    const remainingHours = (entry.Price - entry.Downpayment) / entry.Wage;

    const report = {
        monthlyhours: monthlyExpenses.toFixed(2),
        weeklyhours: weeklyHours.toFixed(2),
        dailyhours: dailyHours.toFixed(2),
        remaininghours: remainingHours.toFixed(2),
    };

    return report;
}
