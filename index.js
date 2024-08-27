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
    });
});

// Explicit route to '/report/index'
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
    console.log("Processed data: ", report);
    res.render("report/create", {
        userdata: req.body,
        report: report
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
        let remainingpayment = (entrydata.Price + entrydata.Downpayment) / entrydata.Wage;
        //TODO Change this to a variable rendered client side, depending on if the user wants to include weekends or not
        var report = { Totalexpenses: totalexpenses, Monhtlyexpenses: monhtlyexpenses, Monthlyhours: monthlyhours, Weeklyhours: weeklyhours, Dailyhours: dailyhours, Remainingpayment: remainingpayment };
        return report;
    }
    return {};

}