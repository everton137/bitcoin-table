import axios from 'axios';
import "core-js/stable";
import "regenerator-runtime/runtime";
import moment from 'moment';
import * as config from "./config";

const today = moment(),
    yesterday = moment().subtract(1, "days"),
    firstDay = moment().subtract(config.histDays, "days");

// parse historical bitcoin data for the specified days range
async function getHistBitcoin() {
    const bitcoinUrl = `${config.corsApiUrl}https://api.coindesk.com/v1/bpi/historical/close.json?start=${firstDay.format("YYYY-MM-DD")}&end=${yesterday.format("YYYY-MM-DD")}`;

    try {
        const bitcoinReq = await axios.get(bitcoinUrl);
        const bitcoinData = bitcoinReq.data;
        return bitcoinData.bpi;
    } catch (error) {
        console.log(error);
    }
}

// parse bitcoin data for the current day
async function getCurBitcoin() {
    const bitcoinUrl = `${config.corsApiUrl}https://api.coindesk.com/v1/bpi/currentprice/USD.json`;

    try {
        const bitcoinReq = await axios.get(bitcoinUrl);
        const bitcoinData = bitcoinReq.data;
        return bitcoinData.bpi;
    } catch (error) {
        console.log(error);
    }
}

// update the row with the current value
async function updateCurRow() {
    const table = document.getElementById("bitcoinTable");
    try {
        const curData = await getCurBitcoin();
        table.rows[1].cells[1].innerHTML = curData.USD.rate_float;
    } catch (error) {
        console.log(error);
    }

}

// populate the table
async function populateTable() {
    const table = document.getElementById("bitcoinTable");

    try {
        const histData = await getHistBitcoin();

        for (var key of Object.keys(histData)) {
            const row = table.insertRow(1),
                cell1 = row.insertCell(0),
                cell2 = row.insertCell(1);
            cell1.innerHTML = moment(key, 'YYYY-MM-DD').format('DD MMM YYYY');
            cell2.innerHTML = histData[key];
            row.className = "mdc-data-table__row";
            cell1.className = "mdc-data-table__cell";
            cell2.className = "mdc-data-table__cell mdc-data-table__cell--numeric";
        }
    } catch (error) {
        console.log(error);
    }

    try {
        const curData = await getCurBitcoin();
        const row = table.insertRow(1),
            cell1 = row.insertCell(0),
            cell2 = row.insertCell(1);
        cell1.innerHTML = moment(today).format('DD MMM YYYY');
        cell2.innerHTML = curData.USD.rate_float;
        row.className = "mdc-data-table__row";
        cell1.className = "mdc-data-table__cell";
        cell2.className = "mdc-data-table__cell mdc-data-table__cell--numeric";
    } catch (error) {
        console.log(error);
    }
}

populateTable();

// update the row with the current data every 5 seconds
setInterval(updateCurRow, 5000);