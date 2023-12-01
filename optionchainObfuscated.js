document.addEventListener('contextmenu', event => event.preventDefault());

getoptionchaindata();

async function getoptionchaindata() {
    var closingprice;
    removeExisitingTable('optionChainTable');
    showLoadingIcon();

    const index = document.getElementById('index').value;
    console.log("INDEX VALUE IS:"+index);

    thrusday = getnearestExpiry(index);
    // const uri = `https://dev-api.niftytrader.in/webapi/option/fatch-option-chain?symbol=${index}&expiryDate=`
    const url = `https://logical-powerful-titmouse.ngrok-free.app/getoptionchain/${index}`
    // const url = 'https://corsproxy.io/?'+uri;
    return fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'your-rapidapi-key',
        },
    })
        .then(response => response.json())
        .then((response) => {
            jsonData = response['resultData']['opDatas'];
            headervalue = response['resultData']['opDatas'][0];
            closingprice = response['resultData']['opDatas'][0]['index_close']
            // Get the container element where the table will be inserted
            let container = document.getElementById("container");

            // Create the table element
            let table = document.createElement("table");
            table.setAttribute("id", "optionChainTable");

            // Get the keys (column names) of the first object in the JSON data
            let cols = Object.keys(headervalue);

            // Create the header element
            let thead = document.createElement("thead");
            let tr = document.createElement("tr");
            var rowcount = 0;
            // Loop through the column names and create header cells
            cols.forEach((item) => {
                let th = document.createElement("th");
                th.innerText = item; // Set the column name as the text of the header cell
                tr.appendChild(th); // Append the header cell to the header row
                th.style.background = "gray";
                th.innerText.bgColor = "white";

            });
            thead.appendChild(tr); // Append the header row to the header
            table.append(tr) // Append the header to the table

            // Loop through the JSON data and create table rows
            jsonData.forEach((item) => {
                let tr = document.createElement("tr");

                // Get the values of the current object in the JSON data
                let vals = Object.values(item);

                // Loop through the values and create table cells
                var colcount = 0;
                vals.forEach((elem) => {
                    let td = document.createElement("td");

                    td.innerText = elem;

                    // Set the value as the text of the table cell
                    tr.appendChild(td); // Append the table cell to the table row
                    colcount++;
                });
                table.appendChild(tr); // Append the table row to the table
                rowcount++;
            });
            container.appendChild(table) // Append the table to the container element
                cleanup();
                fnchangecolumnposition();
                fnchangecolumnname();
                changeColor(closingprice);
                removerows(closingprice, index);
    
                
                hideLoadingIcon();
                setTimeout(() => {
                    fngetmaxval();
                    calculateOIprctchange();
                    updatetabledata("Put OI");
                    updatetabledata("Call OI");
                    commavalues();
                 ;},1000);
        })
};


async function cleanup() {
    console.log("Inside CleanUp");
    const removelist = ["calls_ask_price", "calls_bid_price", "calls_net_change", "calls_change_oi_value",
        "puts_ask_price", "puts_bid_price", "puts_net_change", "puts_change_oi_value",
        "expiry_date", "time", "index_close", "created_at", "call_high", "call_low"
        , "call_open", "put_high", "put_low", "put_open",
        "call_delta", "call_gamma", "call_vega", "call_theta",
        "call_rho", "put_delta", "put_gamma", "put_vega", "put_theta", "put_rho", "calls_oi_value"
        , "puts_oi_value", "calls_offer_price", "puts_offer_price",
        // "calls_average_price", "puts_average_price", "previous_eod_calls_oi","previous_eod_puts_oi"];
        "calls_average_price", "puts_average_price"];

    for (var j = 0; j <= removelist.length - 1; j++) {
        removetabledata(removelist[j]);
    }
}
function removetabledata(columnname) {
    var tble = document.getElementById('optionChainTable');
    var row = tble.rows; // Getting the rows

    for (var i = 0; i < row[0].cells.length; i++) {

        // Getting the text of columnName
        var str = row[0].cells[i].innerHTML;

        // If 'Geek_id' matches with the columnName 
        if (str.search(columnname) != -1) {
            for (var j = 0; j < row.length; j++) {

                // Deleting the ith cell of each row
                row[j].deleteCell(i);
            }
        }
    }
}

function updatetabledata(columnname) {
    const index = document.getElementById('index').value;
    var value = index.includes("fin") ? 40 : index.includes("bank") ? 25 : 50;    
    var tble = document.getElementById('optionChainTable');
    var row = tble.rows; // Getting the rows

    for (var i = 0; i < row[0].cells.length; i++) {

        // Getting the text of columnName
        var str = row[0].cells[i].innerHTML;

        // If 'Put OI' matches with the columnName
        if (str.indexOf(columnname) !== -1) {
            for (var j = 1; j < row.length; j++) { // Start from j = 1 to skip the header row

                // Get the cell value and divide by 50
                var cellValue = parseInt(row[j].cells[i].innerText); // Assuming the value is an integer
                row[j].cells[i].innerText = (cellValue / value).toFixed(0); // Set the new value back to the cell
                console.log("Updated cell value:" + (cellValue / value).toFixed(2));
            }
        }
    }
}


function changeColumnPosition(columnName, index) {
    // get reference to the table element
    var table = document.getElementById("optionChainTable");

    // get reference to the header row
    var headerRow = table.rows[0];

    // loop through the header cells to find the index of the clicked column
    var columnIndex = -1;
    for (var i = 0; i < headerRow.cells.length; i++) {
        if (headerRow.cells[i].innerText === columnName) {
            columnIndex = i;
            break;
        }
    }

    // move the column to the front
    if (columnIndex !== -1) {
        for (var j = 0; j < table.rows.length; j++) {
            var row = table.rows[j];
            var cell = row.removeChild(row.cells[columnIndex]);
            row.insertBefore(cell, row.cells[index]);
        }
    }
}

function changeColor(closeprice) {
    var table = document.getElementById("optionChainTable");

    var indexvalue = "";
    const index = document.getElementById('index').value;
    if (index.includes('bank')) {
        indexvalue = '^NSEBANK';
        roundnumber = 100;
    } else if (index.includes('fin')) {
        indexvalue = 'NIFTY_FIN_SERVICE.NS';
        roundnumber = 50;
    }
    else {
        indexvalue = '^NSEI'
        roundnumber = 50;
    }
    var closingprice = parseInt(Math.round(closeprice / roundnumber) * roundnumber);
    for (var i = 0; i < table.rows.length; i++) {
        var row = table.rows[i];

        // get the cell value of the first cell in the row
        var cellValue = row.cells[6].innerText;
        row.cells[6].style.backgroundColor = "gray";
        if (cellValue.includes(closingprice)) {
            // highlight the row
            row.style.backgroundColor = "yellow";
            row.cells[6].color="white";
        }
        if( parseInt(cellValue)< closingprice){
            row.style.background = '#DCDCDC';
            for(var j=7; j<=row.cells.length-1;j++){
                row.cells[j].style.backgroundColor = "#ADD8E6";
            }
        }
        if( parseInt(cellValue)> closingprice){
            row.style.backgroundColor = "#ADD8E6";
            for(var j=7; j<=row.cells.length-1;j++){
                row.cells[j].style.backgroundColor = '#DCDCDC';
            }
        }
    }
}

function changeColumnName(oldName, newName) {
    const table = document.getElementById('optionChainTable');

    // Change the column header name
    const headers = table.getElementsByTagName('th');
    for (let i = 0; i < headers.length; i++) {
        if (headers[i].innerHTML === oldName) {
            headers[i].innerHTML = newName;
            break;
        }
    }
}

function removeExisitingTable(elementid) {
    const element = document.getElementById(elementid);

    // Check if the element exists
    if (element) {
        // Get the parent element
        const parent = element.parentNode;

        // Remove the element from the parent
        parent.removeChild(element);
    }
}

function removerows(closeprice, index) {
    var table = document.getElementById("optionChainTable");
    var value =0;
    if(index.includes("bank")){
        value = 1000;
    } else{
        value = 500;
    }
    const lowerrange = parseInt(Math.round(closeprice / roundnumber) * roundnumber)-value;
    const higherrange = parseInt(Math.round(closeprice / roundnumber) * roundnumber)+value;
    var lowerrangecounter = 0;
    var higherrangecounter =0;

    for (var i = 0; i < table.rows.length; i++) {
        var row = table.rows[i];
        var cellValue = row.cells[6].innerText;
        if(parseInt(cellValue)< lowerrange){
            lowerrangecounter++;
        }
        if(parseInt(cellValue) > higherrange){
            higherrangecounter++;
        }
    }
    for(var j=1; j<=lowerrangecounter;j++){
        document.getElementsByTagName("tr")[1].remove();
    }
    for(var y=1; y<=higherrangecounter;y++){
        var rowsize = document.getElementsByTagName("tr").length;
        document.getElementsByTagName("tr")[rowsize-1].remove();
    }
}

function freezeHeader() {
    // Get the table element
    var table = document.getElementById("optionChainTable");

    // Get the table header row
    var headerRow = table.rows[0];

    // Create a new div element
    var div = document.createElement("div");

    // Set the div element's style
    div.style.position = "fixed";
    div.style.top = "0";
    div.style.display = "none";

    // Clone the header row and append it to the div element
    var clonedHeaderRow = headerRow.cloneNode(true);
    div.appendChild(clonedHeaderRow);

    // Insert the div element before the table
    table.parentNode.insertBefore(div, table);

    // Add a scroll event listener to the window object
    window.addEventListener("scroll", function () {
        // Check if the user has scrolled past the top of the table
        if (window.pageYOffset > table.offsetTop) {
            // If so, show the fixed header
            div.style.display = "block";
        } else {
            // Otherwise, hide the fixed header
            div.style.display = "none";
        }
    });
}

function fnchangecolumnposition() {
    console.log("Changing Column Positions");
    changeColumnPosition("calls_builtup", 0);
    changeColumnPosition("calls_oi", 1);
    changeColumnPosition("calls_change_oi", 2);
    changeColumnPosition("calls_volume", 3);
    changeColumnPosition("calls_iv", 4);
    changeColumnPosition("calls_ltp", 5);
    changeColumnPosition("strike_price", 6);
    changeColumnPosition("puts_ltp", 7);
    changeColumnPosition("puts_iv", 8);
    changeColumnPosition("puts_volume", 9);
    changeColumnPosition("puts_change_oi", 10);
    changeColumnPosition("puts_oi", 11);
    changeColumnPosition("puts_builtup", 12);
}

function fnchangecolumnname() {
    console.log("Changing Column Name");
    changeColumnName("calls_builtup", "Call Signal");
    changeColumnName("puts_builtup", "Put Signal");
    changeColumnName("calls_volume", "Call Volume");
    changeColumnName("puts_volume", "Put Volume");
    changeColumnName("calls_change_oi", "Calls Chg OI");
    changeColumnName("puts_change_oi", "Puts Chg OI");
    changeColumnName("calls_iv", "Call IV");
    changeColumnName("puts_iv", "Put IV");
    changeColumnName("puts_oi", "Put OI");
    changeColumnName("calls_oi", "Call OI");
    changeColumnName("calls_ltp", "Call LTP");
    changeColumnName("puts_ltp", "Put LTP");
    changeColumnName("strike_price", "Strike Price");
}

function fngetmaxval() {
    getMaxvalues('Calls Chg OI');
    getMaxvalues('Puts Chg OI');
    getMaxvalues('Call OI');
    getMaxvalues('Put OI');
}

function generateciphercode() {
    const min = new Date().getUTCMinutes();
    var encrypted = window.btoa(min + "DFindashbrd");
    var cipherkey = document.getElementById("cipher");
    return encrypted;
}

function getMaxvalues(columnName) {
    var table = document.getElementById("optionChainTable");
    const values = [];
    // Find the column index of the column to search
    var columnIndex = -1;
    for (var i = 0; i < table.rows[0].cells.length; i++) {
        if (table.rows[0].cells[i].innerHTML === columnName) {
            columnIndex = i;
            break;
        }
    }

    // Iterate through the rows to find the max value in the column
    var maxValue = -Infinity;
    for (var i = 1; i < table.rows.length; i++) {
        var cellValue = parseInt(table.rows[i].cells[columnIndex].innerHTML);
        if (cellValue > maxValue) {
            maxValue = cellValue;
        }
    }

    // Highlight the cells with the max value
    for (var i = 1; i < table.rows.length; i++) {
        var cellValue = parseInt(table.rows[i].cells[columnIndex].innerHTML);
        if (cellValue === maxValue) {
            // table.rows[i].cells[columnIndex].classList.add("highlight");
            table.rows[i].cells[columnIndex].style.backgroundColor = "#673147";
            table.rows[i].cells[columnIndex].style.color = "white";
        }
    }
    if (columnIndex !== -1) {
        // Find the second highest value in the specified column
        for (let i = 1; i < table.rows.length; i++) {
            const value = parseFloat(table.rows[i].cells[columnIndex].textContent);
            values.push(value);
        }

        const sortedValues = values.sort((a, b) => b - a);
        const secondHighest = sortedValues[1];

        // Highlight the row(s) with the second highest value in the specified column
        for (let i = 1; i < table.rows.length; i++) {
            const cellValue = parseFloat(table.rows[i].cells[columnIndex].textContent);
            if (cellValue === secondHighest) {
                // table.rows[i].cells[columnIndex].classList.add("hlt");
                table.rows[i].cells[columnIndex].style.backgroundColor = "#4169E1";
                table.rows[i].cells[columnIndex].style.color = "white";
            }
        }
    }

    //Changing color of Strike Price Column
    for (var i = 0; i < table.rows[0].cells.length; i++) {
        if (table.rows[0].cells[i].innerHTML === "Strike Price") {
            columnIndex = i;
            break;
        }
    }

    // Iterate through the rows and highlight the cells in the column
    for (var i = 1; i < table.rows.length; i++) {
        table.rows[i].cells[columnIndex].classList.add("StrikePrice");
    }
}

// Show the loading icon
function showLoadingIcon() {
    document.getElementById("loading").classList.remove("hidden");
    document.getElementById("highest").classList.add("hidden")
    document.getElementById("secondhighest").classList.add("hidden")
}

// Hide the loading icon
function hideLoadingIcon() {
    document.getElementById("loading").classList.add("hidden");
    document.getElementById("highest").classList.remove("hidden")
    document.getElementById("secondhighest").classList.remove("hidden")
}

function commavalues() {
    const table = document.getElementById("optionChainTable");

    // Loop through all the cells in the table
    for (let i = 0; i < table.rows.length; i++) {
        const cells = table.rows[i].cells;
        for (let j = 0; j < cells.length; j++) {
            const cellValue = cells[j].innerHTML.trim();
            // Check if the cell value is a number greater than 1000
            if (!isNaN(cellValue) && Number(cellValue) > 1000) {
                // Add commas to the number
                const formattedValue = Number(cellValue).toLocaleString('en-IN');
                cells[j].innerHTML = formattedValue;
            }
        }
    }
}

function getnearestExpiry(index){
    var day;
    let currentDate = new Date();
    // Get the current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    let currentDay = currentDate.getDay();

    if(index.includes("finnifty")){
        // Calculate the number of days until the next Thursday (0 = Thursday, 1 = Friday, ..., 6 = Wednesday)
        let daysUntilThursday = (2 - currentDay+7) % 7;

        // Create a new date object for the nearest Thursday
        let nearestThursday = new Date(currentDate.getTime() + daysUntilThursday * 86400000);

        day = nearestThursday.toISOString().slice(0, 10);
    } else {
        // Calculate the number of days until the next Thursday (0 = Thursday, 1 = Friday, ..., 6 = Wednesday)
        let daysUntilThursday = (11 - currentDay) % 7;

        // Create a new date object for the nearest Thursday
        let nearestThursday = new Date(currentDate.getTime() + daysUntilThursday * 86400000);

        day = nearestThursday.toISOString().slice(0, 10);
    }
    return day;
}

function calculateOIprctchange(){
    let table = document.getElementById('optionChainTable');
    let rows = table.rows;
    let headers = rows[0].cells;
    let col1, col2;

    for (let i = 0; i < headers.length; i++) {
        if (headers[i].textContent === 'previous_eod_calls_oi') {
            col1 = i;
        }
        if (headers[i].textContent === 'Call OI') {
            col2 = i;
        }
    }

    for (let i = 1; i < rows.length; i++) {
        let POI = parseFloat(rows[i].cells[col1].innerText);
        let OI = parseFloat(rows[i].cells[col2].innerText);
        let percentChange = ((OI - POI) / POI) * 100;
        rows[i].cells[col2].textContent = OI + " ("+percentChange.toFixed(1) + '%'+")";
    }

    for (let i = 0; i < headers.length; i++) {
        if (headers[i].textContent === 'previous_eod_puts_oi') {
            col3= i;
        }
        if (headers[i].textContent === 'Put OI') {
            col4= i;
        }
    }

    for (let j = 1; j < rows.length; j++) {
        let POI = parseFloat(rows[j].cells[col3].innerText);
        let OI = parseFloat(rows[j].cells[col4].innerText);
        let percentChange = ((OI - POI) / POI) * 100;
        if(percentChange == 0.00){
            rows[j].cells[col4].textContent = OI + ' (0%)';    
        } else {
        rows[j].cells[col4].textContent = OI + " ("+percentChange.toFixed(1) + '%'+")";
        }
    }
    removetabledata("previous_eod_puts_oi");
    removetabledata("previous_eod_calls_oi");
}
