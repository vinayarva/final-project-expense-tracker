document.getElementById("signOut").addEventListener("click",()=>{
    localStorage.clear();
    window.location.href = "../Login page/login page.html"
})

document.addEventListener("DOMContentLoaded",async()=>{

    const token = localStorage.getItem("token");

    if (token) {
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));

        const user_profile = document.getElementById("user_profile");
        user_profile.innerText = decodedPayload.userName;
        user_profile.classList.remove("hidden-on-load");

    }

    try {
        const date = new Date();
        const month = date.getMonth() + 1; 
            const year = date.getFullYear();
            const response = await axios.get("http://13.61.11.175/leaderboard", {
                                                params: {
                                                    month: month,
                                                    year: year, 
                                                },
                                                headers: { Authorization: localStorage.getItem("token") }
                                            });

                            displayTable(response.data.content)
                            displaybarchart(response.data.content)
                                
    } catch (error) {
        console.log(error)
    }
})


function displaybarchart(data){

    const userNames = data.map(item => item.userName);
    const totalExpenses = data.map(item => item.totalExpense);

    const ctx = document.getElementById('myBarChart').getContext('2d');
    const myBarChart = new Chart(ctx, {
    type: 'bar', // bar chart type
    data: {
        labels: userNames.reverse(),
        datasets: [{
            label: 'Expenses',
            data: totalExpenses.reverse(), // dataset values
            backgroundColor: 'rgba(255, 0, 0,0.25)',
            borderColor: 'black',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: { display: false,
                beginAtZero: true,
                grid:{display : false, },
                ticks: { display: false },
            },
            x:{
                grid : {display : false}
            }
        }
    }
});




}


function displayTable(data){
    const tbody = document.getElementById("tbody-leaderboard")
    tbody.innerHTML = ""

    data.forEach((element,index)=>{
        const tr = document.createElement("tr")
        tr.innerHTML = `
                        <th scope="row">${index+1}</th>
                        <td>${element.userName}</td>
                         <td class="text-danger fw-semibold">${element.totalExpense} $</td>
                        `

            tbody.appendChild(tr)
    })
}




