function loginForm(event){
    event.preventDefault();

    const userDetails = {
        email : event.target.email.value,
        password : event.target.password.value
    }
  
    axios.post("http://13.61.11.175/login",userDetails).then((result) => {
        
                console.log(result)
                localStorage.setItem("token", result.data.token);  
                window.location.href = "../Homepage/homepage.html"
        
    }).catch((err) => {
        console.log(err)
        if(err.status === 404){
            alert(err.response.data.message)
            window.location.href = "../SignUp page/Signup.html"
        }else{
            alert(err.response.data.message)
        }
       
    });
}