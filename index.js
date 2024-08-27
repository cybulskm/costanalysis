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

//List of objects stored in memory
var reports = [];
var id = 0;

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Set the 'views' directory for any views being rendered via res.render()
app.set('views', path.join(__dirname, 'views'));

// Set the view engine to render HTML files using EJS
app.engine('html', (await import('ejs')).renderFile);
app.set('view engine', 'html');

// Default route that renders 'report/create.html'
app.get('/', (req, res) => {
    console.log('Redirect to /report/create');
    res.render("report/create", {
    });
});

// Explicit route to '/report/index'
app.get('/report/all', (req, res) => {
    console.log('Render /report/all');
    res.render("report/all", {
        reports: reports
    });
});

app.get('/report/create', (req, res) => {
    console.log('Render /report/create');
    res.render("report/create", {

    });
});

app.get('/report/index', (req, res) => {
    console.log('Render /report/index');
    res.render("report/index", {
    });
});


// Handle form submissions with a POST request to '/report/create'
app.post('/report/create', express.urlencoded({ extended: true }), (req, res) => {
    console.log('POST: Form uploaded');
    console.log(req.body);
    let report = processFinances(req.body);
    let monthlyExpenses = { Insurance: req.body.Insurance, Financing: (req.body.Price - req.body.Downpayment) * req.body.Financing / 100, Other: req.body.Other }
    let userData = { Price: req.body.Price, Downpayment: req.body.Downpayment, totalMonthlyExpenses: monthlyExpenses.Insurance + monthlyExpenses.Financing + monthlyExpenses.Other };
    let savedReport = { id: id, report: report, userData: userData, monthlyExpenses: monthlyExpenses };
    id += 0;
    reports.push(savedReport);
    console.log("Processed data: ", report);
    res.render("report/index", {
        userdata: userData,
        report: report,
        monthlyExpenses: monthlyExpenses,
    });
});

// Start the server and open the default browser to the specified URL
app.listen(8080, () => {
    console.log('App listening on port 8080');
    open(`http://localhost:8080`); // Automatically open the URL
});


function processFinances(entrydata) {
    //Convert everything to ints because javascript is dumb
    for (var field in entrydata) {
        if (entrydata[field]) {
            entrydata[field] = Number(entrydata[field]);

        }
    }
    console.log("Entry data:", entrydata);


    if (typeof entrydata !== "undefined") {
        let totalexpenses = entrydata.Other + entrydata.Insurance + ((entrydata.Financing / 100) * entrydata.Price) + entrydata.Price + entrydata.Downpayment;
        let monhtlyexpenses = totalexpenses - entrydata.Downpayment - entrydata.Price;
        let monthlyhours = monhtlyexpenses / entrydata.Wage;
        let weeklyhours = monthlyhours / 4;
        let dailyhours = weeklyhours / 7
        let remainingpayment = (entrydata.Price - entrydata.Downpayment) / entrydata.Wage;
        //TODO Change this to a variable rendered client side, depending on if the user wants to include weekends or not
        var report = { monthlyhours: monthlyhours, weeklyhours: weeklyhours, dailyhours: dailyhours, remaininghours: remainingpayment };
        //Round everything to 2 decimal places
        for (var field in report) {
            if (report[field]) {
                report[field] = (Math.round(report[field] * 100) / 100).toFixed(2);
            }
        }
        return report;
    }
    return {};

}