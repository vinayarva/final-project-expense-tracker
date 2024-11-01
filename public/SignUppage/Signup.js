function signUpForm(event) {
  event.preventDefault();

  const userDetails = {
    userName: event.target.userName.value,
    email: event.target.email.value,
    password: event.target.password.value,
  };

  axios
    .post("http://13.61.11.175/signUp", userDetails)
    .then((result) => {
      alert(result.data.message);
      window.location.href = "/Loginpage/loginpage.html";
    })
    .catch((err) => {
      alert(err.response.data.message);
    });
}
