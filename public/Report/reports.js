let rowsPerPage = 5; // Initialize the number of rows per page
let currentPage = 1; // Initialize the current page
let data = []; // Initialize data array
let totalPages = 0; // Initialize totalPages globally

function toggleDateInputs() {
    const reportType = document.getElementById('report-type').value;
    document.getElementById('monthly-inputs').style.display = (reportType === 'monthly') ? 'block' : 'none';
    document.getElementById('yearly-inputs').style.display = (reportType === 'yearly') ? 'block' : 'none';
}

document.getElementById("signOut").addEventListener("click",()=>{
    localStorage.clear();
    window.location.href = "../Login page/login page.html"
})

document.addEventListener("DOMContentLoaded",()=>{
    const token = localStorage.getItem("token");

    if (token) {
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));

        const user_profile = document.getElementById("user_profile");
        user_profile.innerText = decodedPayload.userName;
        user_profile.style.display = 'block'

    }
})

async function fetchReport() {
    try {
        const reportType = document.getElementById('report-type').value;
        const monthAndYear = document.getElementById("month").value;
        const year = document.getElementById("year").value;
        const tfoot = document.getElementById("yearfooterHide")
        
        let response;
        if (reportType === "monthly") {
            
            
            const [year, month] = monthAndYear.split('-').map(Number);
            response = await axios.get("http://localhost:4000/report/monthly", {
                params: {
                    month: month,
                    year: year,
                    page: currentPage,
                    limit: rowsPerPage
                },
                headers: { Authorization: localStorage.getItem("token") }
            });
            tfoot.classList.remove("hidden_tfoot")

        } else {

            response = await axios.get("http://localhost:4000/report/yearly", {
                params: {
                    year: year,
                    page: currentPage,
                    limit: rowsPerPage
                },
                headers: { Authorization: localStorage.getItem("token") }

               
            });
            tfoot.classList.add("hidden_tfoot")
            
        }
        data = response.data.content; // Store the fetched data
        console.log(response.data)
       
        totalPages = response.data.totalPages; // Store total pages
        displayTable(currentPage,response.data.totalSum); // Display the table with the fetched data
        document.getElementById("headerTag").innerText = reportType === "monthly" ? `Monthly Expenses: ${monthAndYear}` : `Year Expenses For ${year}`;
        document.getElementById("Display").style.display = "block";



        const secondTable = response.data.monthlyYear || false
            if(secondTable){
               
                displayMonthlyYearReport(secondTable)
            }else{
                document.getElementById("secondTable").style.display =  "none"
            }


    } catch (err) {
        console.error(err); // Log the error for debugging
    }
}

function displayTable(page,sum) {
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = ''; // Clear existing rows

    const paginatedItems = data; // 'data' already contains the correct items

    paginatedItems.forEach((item, index) => {
        const row = `<tr>
                        <td>${(currentPage - 1) * rowsPerPage + index + 1}</td> <!-- Correct the index for display -->
                        <td>${item.category}</td>
                        <td>${item.description}</td>
                        <td>${item.price}</td>
                        <td>${item.date}</td>
                     </tr>`;
        tableBody.innerHTML += row;
    });
    const total = sum === null ? 0 : sum
    document.getElementById("totalmonthprice").innerText = total +" $"

    displayPagination(currentPage);
}

function displayPagination(page) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = ''; // Clear existing pagination buttons

    // Use the totalPages fetched from the backend
    // totalPages is already updated in fetchReport

    // Previous Button
    if (page > 1) {
        pagination.innerHTML += `<li class="page-item">
                                    <a class="page-link" href="#" onclick="changePage(${page - 1},event)">Previous</a>
                                  </li>`;
    }

    // Page Numbers
    for (let i = 1; i <= totalPages; i++) {
        pagination.innerHTML += `<li class="page-item ${i === page ? 'active' : ''}">
                                    <a class="page-link" href="#" onclick="changePage(${i},event)">${i}</a>
                                 </li>`;
    }

    // Next Button
    if (page < totalPages) {
        pagination.innerHTML += `<li class="page-item">
                                    <a class="page-link" href="#" onclick="changePage(${page + 1},event)">Next</a>
                                  </li>`;
    }
}

function changePage(newPage,event) {
    event.preventDefault();
    currentPage = newPage; // Update the current page
    fetchReport(); // Fetch the report for the new page
}

function changeRowsPerPage() {
    const select = document.getElementById('rowsPerPage');
    rowsPerPage = parseInt(select.value); // Get the selected number of rows per page
    currentPage = 1; // Reset to the first page
    fetchReport(); // Fetch the report with the new row limit
}


function displayMonthlyYearReport(data){

   
    const tbody = document.getElementById("monthYear")
    tbody.innerHTML = ""
    let sum = 0
    data.forEach(item =>{
        const  tr = document.createElement("tr")
        tr.innerHTML = `
            <td>${item.month}</td>
            <td>${item.total_expense}</td>
        `
        sum += Number(item.total_expense)
        tbody.appendChild(tr)
    })

    document.getElementById("totalExpenses").innerText = sum+' $'

    document.getElementById("secondTable").style.display =  "block"
}


async function Download(){
    try {
        const reportType = document.getElementById('report-type').value;
        const monthAndYear = document.getElementById("month").value;
        const year = document.getElementById("year").value;

        let response ; 
        if(reportType === "monthly"){
            const [year, month] = monthAndYear.split('-').map(Number);
            response = await axios.get("http://localhost:4000/report/monthly/download", {
                params: {
                    month: month,
                    year: year
                },
                headers: { Authorization: localStorage.getItem("token") }
            });
        }else{
            response = await axios.get("http://localhost:4000/report/yearly/download", {
                params: {
                    year: year
                },
                headers: { Authorization: localStorage.getItem("token")}})
        }

        const main = response.data.content

        const mainArray = main.map((item, index) => ([
             index + 1,
            item.date,
            item.description,
           item.category,
           item.price
          ]));

        //   console.log(mainArray)

        //   if(response.)

        const { jsPDF } = window.jspdf;
        const doc= new jsPDF();

        // doc.setFontSize(12);
        if(reportType === "monthly"){
            doc.text(`Monthly Expense of ${monthAndYear}`, doc.internal.pageSize.width / 2, 10, { align: 'center' }); // Center 'Hello world!'
            doc.autoTable({
                head: [['S/No', 'Date', 'Description', 'Category','Price']],
                body: mainArray,
                foot: [['', '', 'Total Expense', '',`${response.data.totalSum}.00$`]],
                // footStyles:  { textColor: [255, 0, 0] } , 
                margin: { top: 10, right: 10, bottom: 10, left: 10 }, // Add 10 margin
                showFoot: 'lastPage',
                theme: 'grid',
                startY: 20,
            });

        }else{
            doc.text(`Yearly Expense of ${year}`, doc.internal.pageSize.width / 2, 10, { align: 'center' }); // Center 'Hello world!'

            const secondTable = response.data.monthlyYear

            const totalSum = secondTable.reduce((acc, item) => acc + Number(item.total_expense), 0);

            const secondArray  = secondTable.map((item, index) => ([
                index + 1,
               item.month,
               item.total_expense,
             ]));


             doc.autoTable({
                startY: 20,
                head: [['S/No', 'Month', 'Total Expense']],
                body: secondArray,
                foot: [['', 'Total Expense',`${totalSum}.00$`]],
                // footStyles:  { textColor: [255, 0, 0] } , 
                margin: { top: 10, right: 10, bottom: 10, left: 10 }, // Add 10 margin
                // showFoot: 'lastPage',
                theme: 'grid',
                
            });


            doc.autoTable({
                startY: doc.lastAutoTable.finalY + 10,
                head: [['S/No', 'Date', 'Description', 'Category','Price']],
                body: mainArray,
                // foot: [['', '', 'Total Expense', '',`${response.data.totalSum}.00$`]],
                // footStyles:  { textColor: [255, 0, 0] } , 
                margin: { top: 10, right: 10, bottom: 10, left: 10 }, // Add 10 margin
                // showFoot: 'lastPage',
                theme: 'grid',
            });

        }
             

                

        doc.save("report.pdf")
        
    } catch (error) {
        console.log(error)
    }
}