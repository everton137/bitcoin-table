import axios from 'axios';
import "core-js/stable";
import "regenerator-runtime/runtime";
import moment from 'moment';
import * as config from "./config";

const today = moment(),
    yesterday = moment().subtract(1, "days"),
    firstDay = moment().subtract(config.histDays, "days");
const table = document.getElementById("bitcoinTable");

// Getting the historical and current data
async function getBitcoinData() {
    let histUrl = `${config.corsApiUrl}https://api.coindesk.com/v1/bpi/historical/close.json?start=${firstDay.format("YYYY-MM-DD")}&end=${yesterday.format("YYYY-MM-DD")}`,
        curUrl = `${config.corsApiUrl}https://api.coindesk.com/v1/bpi/currentprice/USD.json`;
    try {
        let bitcoinResp = await axios.all([axios.get(histUrl), axios.get(curUrl)]);
        const histData = bitcoinResp[0].data.bpi,
            curData = bitcoinResp[1].data.bpi.USD.rate_float;
        return { hist: histData, cur: curData };
    } catch (error) {
        console.log(error);
    }
}

// Populating the table
async function populateTable() {
    try {
        const data = await getBitcoinData();
        for (var key of Object.keys(data.hist)) {
            const row = table.insertRow(1),
                cell1 = row.insertCell(0),
                cell2 = row.insertCell(1);
            cell1.innerHTML = moment(key, 'YYYY-MM-DD').format('DD MMM YYYY');
            cell2.innerHTML = data.hist[key];
            row.className = "mdc-data-table__row";
            cell1.className = "mdc-data-table__cell";
            cell2.className = "mdc-data-table__cell mdc-data-table__cell--numeric";
        }
        const row = table.insertRow(1),
            cell1 = row.insertCell(0),
            cell2 = row.insertCell(1);
        cell1.innerHTML = today.format('DD MMM YYYY');
        cell2.innerHTML = data.cur;
        row.className = "mdc-data-table__row";
        cell1.className = "mdc-data-table__cell";
        cell2.className = "mdc-data-table__cell mdc-data-table__cell--numeric";
    } catch (error) {
        console.log(error);
    }
}

// Update the table with the current value. In case the previous day changed, updates the whole table
async function updateTable() {
    try {
        const data = await getBitcoinData();
        table.rows[1].cells[1].innerHTML = data.cur;
        }
    } catch (error) {
        console.log(error);
    }
}

// Invoke function to populate the table
populateTable();
// Update the table every 5 seconds
setInterval(updateTable, 5000);