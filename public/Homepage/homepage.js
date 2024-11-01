

const date =  document.getElementById("date")
const headerDate =  document.getElementById("headerDate")
const today = new Date()
const formattedToday = today.toISOString().split("T")[0]
const formattedDate = today.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
date.value = formattedToday
headerDate.innerText = formattedDate + " (Today)"
date.max = formattedToday

document.getElementById("signOut").addEventListener("click",()=>{
    localStorage.clear();
    window.location.href = "http://localhost:4000/Loginpage/loginpage.html"
})

date.addEventListener("change",(event)=>{

        const Currentdate =  event.target.value
        // console.log(Currentdate)
        let formattedDate = new Date(Currentdate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
        headerDate.innerText = formattedDate

        fetchExpense(Currentdate).then((result) => {
            displayExpense(result)
        }).catch((err) => {
            
        });    
})


function fetchExpense(value){
    return axios.post("http://localhost:4000/expenseFetch",{date : value},{
        headers :{Authorization : localStorage.getItem("token")}}).then((result) => {
            // displayExpense(result.data.content)
            
            return result.data.content
    }).catch((err) => {
        console.log(err)
    }); 
}


async function expenseForm(event) {
  event.preventDefault();

  try {

    const expense = {
      price: event.target.price.value,
      category: event.target.category.value,
      description: event.target.description.value,
      date: date.value,
    };

    const fileInputName = event.target.fileInputName.files[0]; // Assuming your file input has name="fileInput"


    const formData = new FormData();
    formData.append("data", JSON.stringify(expense)); // Append JSON data
    if (fileInputName) {
        formData.append("fileInputName", fileInputName); // Append file if provided
    }


    const UpdateID =  document.getElementById("hidden_input").value

    if(UpdateID){

      await axios.put(`http://localhost:4000/update/${UpdateID}`, formData, {
        headers: { Authorization: localStorage.getItem("token") ,'Content-Type': 'multipart/form-data' },
      });

      document.getElementById("hidden_input").value = ""


    }else{

      await axios.post("http://localhost:4000/expenseAdd", formData, {
        headers: { Authorization: localStorage.getItem("token") ,'Content-Type': 'multipart/form-data'},
      });
  
    }

    const fetch= await fetchExpense(expense.date);
  
      displayExpense(fetch);

    event.target.price.value = "";
    event.target.category.value = "";
    event.target.description.value = "";
    event.target.fileInputName.value = "";

    
  } catch (error) {
    console.log(error);
  }

    
}

function displayExpense(data) {

    const tbody =  document.getElementById("expense-list-tbody")
    tbody.innerHTML = ""
    let total =  0;
    data.forEach((element) => {
        const tr =  document.createElement('tr')
        tr.innerHTML = `
                
                <td class="capitalize-first-letter">${element.category}</td>
                <td class="capitalize-first-letter">${element.description}</td>
                <td class="text-danger capitalize-first-letter">${element.price}.00 $</td>
        
                <td>
                  <button class="btn btn-warning btn-sm me-2 view_btn hide" data.id="${element.ID}">View</button>
                  <button class="btn btn-success btn-sm me-2 edit_btn" data.id="${element.ID}">Edit</button>
                  <button class="btn btn-danger btn-sm delete_btn" data.id="${element.ID}">Delete</button>
                </td>
             
            
        `          
        tbody.appendChild(tr)
        total += element.price
    });
    document.getElementById("sum").innerText = total + ".00 $"



    document.querySelectorAll(".delete_btn").forEach((button) => {
      button.addEventListener("click", (e) => {

        const ID = e.target.getAttribute("data.id");
            deleteExpense(ID)
      });
    });

    document.querySelectorAll(".edit_btn").forEach((button) => {
      button.addEventListener("click", (e) => {

        const ID = e.target.getAttribute("data.id");
            editExpense(ID)
      });
    });

    const token = localStorage.getItem("token")
    const payload = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));


    if(decodedPayload.membership === "premium"){

      document.querySelectorAll(".view_btn").forEach((element)=>{
        element.classList.remove("hide")
        element.addEventListener("click",async(e)=>{

          const ID = e.target.getAttribute("data.id");

          const result =  await axios.get("http://localhost:4000/editFetch/"+ID, {
            headers: { Authorization: localStorage.getItem("token") },
          })
            const url = result.data.content.fileLink
          if(url !== null){
            const downloadButton = document.getElementById('downloadButton');
            downloadButton.dataset.file = url;
            openFileInModal(url);
          }


        })
      })
    }else{
      document.getElementById("premium").style.display = "block"
    }

  }

  document.getElementById('downloadButton').addEventListener('click', async () => {
    const fileUrl = downloadButton.dataset.file; // Get the file URL from the data attribute
    
    try {
        const response = await fetch(fileUrl); // Fetch the image
        if (!response.ok) throw new Error('Network response was not ok'); // Handle fetch errors
        
        const blob = await response.blob(); // Convert the response to a Blob
        const link = document.createElement('a'); // Create a link element
        link.href = URL.createObjectURL(blob); // Create a Blob URL
        
        // Extract the file extension from the URL and set the download filename
        const fileExtension = fileUrl.split('.').pop(); // Get the last part after the last dot
        link.setAttribute('download', `BillExpense.${fileExtension}`); // Set the filename with the correct extension
        
        document.body.appendChild(link); // Append link to the body
        link.click(); // Simulate a click to trigger download
        document.body.removeChild(link); // Clean up by removing the link
        URL.revokeObjectURL(link.href); // Release the Blob URL
    } catch (error) {
        console.error('Error downloading the image:', error); // Log any errors
    }
});



  function openFileInModal(fileUrl) {
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = '';  // Clear previous content

    const fileType = fileUrl.split('.').pop().toLowerCase();

    if (fileType === 'pdf') {
        // If the file is a PDF, use an iframe
        modalContent.innerHTML = `<iframe src="${fileUrl}" width="100%" height="500px" allowfullscreen></iframe>`;
    } else if (['jpeg', 'jpg', 'png', 'gif'].includes(fileType)) {
        // If the file is an image, use an img tag
        modalContent.innerHTML = `<img src="${fileUrl}" alt="Image Preview" style="max-width: 100%; height: auto;">`;
    }

    // Show the modal
    const fileModal = new bootstrap.Modal(document.getElementById('fileModal'));
    fileModal.show();

    // Show the download button
    downloadButton.style.display = 'block';
}

function editExpense(id){

  document.getElementById("hidden_input").value = id

  axios.get("http://localhost:4000/editFetch/"+id, {
    headers: { Authorization: localStorage.getItem("token") },
  }).then((result) => {
      
      document.getElementById("priceInput").value = result.data.content.price;
      document.getElementById("categoryDropdown").value = result.data.content.category;
      document.getElementById("descriptionInput").value = result.data.content.description;

  }).catch((err) => {
    console.log(err)
  });

}


async function  deleteExpense(id){

  try{

    await axios.delete("http://localhost:4000/deleteExpense/"+id, {
      headers: { Authorization: localStorage.getItem("token") },
    })

    const data = await fetchExpense(date.value)

       displayExpense(data)

  }catch(err){
    console.log(err)
  }

}


document.addEventListener("DOMContentLoaded", async () => {
    try {

      const token = localStorage.getItem("token");

    if (token) {
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));

        const user_profile = document.getElementById("user_profile");
        user_profile.innerText = decodedPayload.userName;
        user_profile.style.display = 'block'

        if (decodedPayload.membership === "premium") {
            // Enable premium features
            document.querySelectorAll(".disable").forEach((element) => {
                element.classList.remove("disable");
            });

            // const data = document.querySelectorAll(".edit_btn")
            // console.log(data)

            // const prem_btn = document.getElementById("premium");
            // if (prem_btn) {
            //     prem_btn.innerText = "Premium User";
            //     prem_btn.classList.add("disable");
            //     prem_btn.classList.add("premium_btn")
            //     prem_btn.classList.remove("hidden-on-load");
            // }

            document.getElementById("container_fileupload").style.display = "block";
            document.getElementById("premium").style.display = "none"
        }else{
          document.getElementById("premium").style.display = "block"
        }
    }
      
       const todayData = await fetchExpense(formattedToday);
        displayExpense(todayData)
    } catch (error) {
      console.log(error);
    }
  });

document.getElementById("premium").addEventListener("click", async (e) => {
    try {
        const response = await axios.get("http://localhost:4000/expense/premium", {
            headers: { Authorization: `${localStorage.getItem("token")}` },
        });

        const order_id = response.data.id;

        const options = {
            key: "rzp_test_m2xurDMBsJulme", // Replace with your Razorpay key ID
            amount: response.data.amount, // Amount should be in paise (100 paise = 1 INR)
            currency: "INR",
            name: "Expense Tracker",
            description: "Premium Membership Payment",
            order_id: order_id,
            handler: async (paymentResponse) => {
                // Handle the payment success response here
                // console.log("Payment successful:", paymentResponse);

                // Optionally, send the payment details back to the server for verification
                const result = await axios.post(
                    "http://localhost:4000/expense/verify",
                    paymentResponse,
                    {
                        headers: { Authorization: `${localStorage.getItem("token")}` },
                    }
                );
  
                localStorage.setItem("token", result.data.token);

                document.querySelectorAll(".disable").forEach((element) => {
                  element.classList.remove("disable");
                                                              });

                  document.getElementById("premium").style.display = "none"
                
            },
            prefill: {
                name: "Username", // Prefill user's name
                email: "user@example.com", // Prefill user's email
                contact: "9999999999", // Prefill user's contact number
            },
            theme: {
                color: "#3399cc",
            },
        };

        const paymentWindow = new Razorpay(options);
        paymentWindow.open();  

        // Enable any disabled elements after payment process

    } catch (error) {
        console.log(error);
    }
});
