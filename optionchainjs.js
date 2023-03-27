optionchain();
        const btn = document.getElementById('btn');
        btn.addEventListener('click', optionchain);

        const chartbtn = document.getElementById('chart');
        chartbtn.addEventListener('click', generateBarchart);

      async function getoptionchaindata(){
        removeExisitingTable('optionChainTable');
        showLoadingIcon();
        const index = document.getElementById('index').value;
          const url = `https://shantanujain101.pythonanywhere.com/fetchOptionChain/index=${index}`;
            await fetch(url, {
            method: 'GET',
            headers: {
               'Accept': 'application/json',
                  },
               })
                  .then(response => response.json())
                  .then((response) => {
                     jsonData = response['resultData']['opDatas'];
                     headervalue = response['resultData']['opDatas'][0];

                     // Get the container element where the table will be inserted
                    let container = document.getElementById("container");
                    
                    // Create the table element
                    let table = document.createElement("table");
                    table.setAttribute("id","optionChainTable");

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
                            td.innerText = elem; // Set the value as the text of the table cell
                            tr.appendChild(td); // Append the table cell to the table row
                            colcount++;
                        });
                        table.appendChild(tr); // Append the table row to the table
                        rowcount++;
                    });
                    container.appendChild(table) // Append the table to the container element
                  
               })
               cleanup();
               fnchangecolumnposition();
               fnchangecolumnname();
               changeColor();
               fngetmaxval();
               removerows();
               freezeHeader();
               hideLoadingIcon();
            };
            

            async function cleanup(){
            const removelist = ["calls_ask_price", "calls_bid_price", "calls_net_change","calls_change_oi",
            "puts_ask_price", "puts_bid_price", "puts_net_change","puts_change_oi",
                "expiry_date", "time", "index_close", "created_at", "call_high", "call_low"
                ,"call_open", "put_high", "put_low" ,"put_open",
                "call_delta",	"call_gamma",	"call_vega",	"call_theta",
                	"call_rho",	"put_delta",	"put_gamma",	"put_vega",	"put_theta"	,"put_rho"	,"calls_oi_value"	
                    ,"puts_oi_value", "calls_offer_price",	"puts_offer_price",
                                        "calls_average_price",	"puts_average_price",	"previous_eod_calls_oi",
                                        	"previous_eod_puts_oi"];
                for(var j=0 ; j<= removelist.length-1; j++){
                    removetabledata(removelist[j]);
                }
            }
            async function removetabledata(columnname) {
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
                
                async function changeColumnPosition(columnName, index){
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

                async function changeColor(){
                    var table = document.getElementById("optionChainTable");

                    var indexvalue="";
                            const index = document.getElementById('index').value;
                            if(index.includes('bank')){
                                    indexvalue = '^NSEBANK';
                                    roundnumber = 100;
                                } else if(index.includes('fin')){
                                    indexvalue = 'NIFTY_FIN_SERVICE.NS';
                                    roundnumber = 50;
                                }
                                else {
                                    indexvalue = '^NSEI'
                                    roundnumber = 50;
                                }
                                url = `https://shantanujain101.pythonanywhere.com/CIPHER/finance/index/${indexvalue}`
                                fetch(url.replace("CIPHER",generateciphercode()), {
                                method: "GET"
                                })
                                .then(r => r.json())
                                .then((response) =>{
                                    var closingprice = parseInt(Math.round(response['chart']['result'][0]['indicators']['quote'][0]['close'] / roundnumber)*roundnumber);
                                    console.log(closingprice);
                                    for (var i = 0; i < table.rows.length; i++) {
                                        var row = table.rows[i];

                                        // get the cell value of the first cell in the row
                                        var cellValue = row.cells[6].innerText;
                                        if (cellValue.includes(closingprice)) {
                                            // highlight the row
                                            row.style.backgroundColor = "yellow";
                                        }
                                        else if(parseInt(cellValue) < closingprice ){
                                            row.style.backgroundColor = "#F9F5EB";
                                        } if(parseInt(cellValue) > closingprice ){
                                            row.style.backgroundColor = "#ADD8E6";
                                        }
                                    }
                            });
                }

                function changeColumnName(oldName, newName){
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
                
                function removeExisitingTable(elementid){
                    const element = document.getElementById(elementid);

                    // Check if the element exists
                    if (element) {
                    // Get the parent element
                    const parent = element.parentNode;

                    // Remove the element from the parent
                    parent.removeChild(element);
                    }
                }
                
                function removerows(){
                    for(let i=0 ; i<=40; i++){
                        var rowsize = document.getElementsByTagName("tr").length;
                        document.getElementsByTagName("tr")[rowsize-1].remove();
                        console.log("Removing Row:");
                        console.log(rowsize);

                    }
                    for(let j=1 ; j<=20; j++){
                        document.getElementsByTagName("tr")[2].remove();
                        console.log("Removing Row:");
                        console.log(rowsize);

                    }
                }

                function freezeHeader(){
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
                        window.addEventListener("scroll", function() {
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

                function fnchangecolumnposition(){
                    changeColumnPosition("calls_builtup", 0);
                    changeColumnPosition("calls_volume", 1);
                    changeColumnPosition("calls_change_oi_value", 2);
                    changeColumnPosition("calls_iv", 3);
                    changeColumnPosition("calls_ltp", 4);
                    changeColumnPosition("calls_oi", 4);   
                    changeColumnPosition("calls_ltp",5);                 
                    changeColumnPosition("strike_price", 6);
                    changeColumnPosition("puts_ltp", 7);                 
                    changeColumnPosition("puts_oi", 8);   
                    changeColumnPosition("puts_iv", 9);
                    changeColumnPosition("puts_change_oi_value", 10);
                    changeColumnPosition("puts_volume", 11);
                    changeColumnPosition("puts_builtup", 12);
                }

                function fnchangecolumnname(){
                        changeColumnName("calls_builtup","Call Interpretation");
                        changeColumnName("puts_builtup","Put Interpretation");
                        changeColumnName("calls_volume","Call Volume");
                        changeColumnName("puts_volume","Put Volume");
                        changeColumnName("calls_change_oi_value", "Calls Chg OI");
                        changeColumnName("puts_change_oi_value", "Puts Chg OI");
                        changeColumnName("calls_iv", "Call IV");
                        changeColumnName("puts_iv", "Put IV");
                        changeColumnName("puts_oi", "Put OI");
                        changeColumnName("calls_oi", "Call OI");
                        changeColumnName("calls_ltp", "Call LTP");
                        changeColumnName("puts_ltp", "Put LTP");
                        changeColumnName("strike_price", "Strike Price");
                }

                function fngetmaxval(){
                        getMaxvalues('Calls Chg OI');
                        getMaxvalues('Puts Chg OI');
                        getMaxvalues('Call OI');
                        getMaxvalues('Put OI');
                }

                function optionchain(){
                    getoptionchaindata();
                    // dynamicfontsize();
                }

                function generateciphercode(){
                const min = new Date().getUTCMinutes();
                var encrypted = window.btoa(min+"DFindashbrd");
                var cipherkey = document.getElementById("cipher");
                return encrypted;
            }

            function getMaxvalues(columnName){
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
                            table.rows[i].cells[columnIndex].classList.add("highlight");
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
                            table.rows[i].classList.add("hlt");
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

            // function dynamicfontsize(){
            //     const myText = document.getElementsByTagName("tr");

            //     function setFontSize() {
            //       const width = window.innerWidth;
            //       if (width < 480) {
            //         myText.style.fontSize = "12px";
            //       } else if (width < 768) {
            //         myText.style.fontSize = "18px";
            //       } else {
            //         myText.style.fontSize = "24px";
            //       }
            //     }
                
            //     // Call the setFontSize function when the page loads
            //     setFontSize();
                
            //     // Call the setFontSize function when the window is resized
            //     window.addEventListener("resize", setFontSize);
            // }
                // Show the loading icon
                function showLoadingIcon() {
                    document.getElementById("loading").classList.remove("hidden");
                }
                
                // Hide the loading icon
                function hideLoadingIcon() {
                    document.getElementById("loading").classList.add("hidden");
                }

                function generateBarchart(){
                    const table = document.getElementById("optionChainTable");
                    const colName = "Call OI"; // name of the column to use for the chart
                    const canvas = document.getElementById("myChart");
                    const ctx = canvas.getContext("2d");

                    // Step 1: Find the index of the column by name
                    const headerRow = table.rows[0];
                    let colIndex = -1;
                    for (let i = 0; i < headerRow.cells.length; i++) {
                    if (headerRow.cells[i].textContent === colName) {
                        colIndex = i;
                        break;
                    }
                    }
                    if (colIndex === -1) {
                    console.error(`Column '${colName}' not found`);
                    return;
                    }

                    // Step 2: Loop through the rows and extract the values of the column
                    const colValues = [];
                    for (let i = 1; i < table.rows.length; i++) { // start from 1 to skip the header row
                    const cell = table.rows[i].cells[colIndex];
                    const value = parseFloat(cell.textContent);
                    colValues.push(value);
                    }

                    // Step 3: Determine the maximum value of the column
                    const maxValue = Math.max(...colValues);

                    // Step 4: Define the dimensions and spacing of the chart
                    const chartWidth = 400;
                    const chartHeight = 300;
                    const barWidth = chartWidth / colValues.length;
                    const barSpacing = barWidth / 4;

                    // Step 5: Draw the bars of the chart
                    ctx.fillStyle = "blue";
                    for (let i = 0; i < colValues.length; i++) {
                    const barHeight = (colValues[i] / maxValue) * chartHeight;
                    const x = i * (barWidth + barSpacing);
                    const y = chartHeight - barHeight;
                    ctx.fillRect(x, y, barWidth, barHeight);

                    }
                }