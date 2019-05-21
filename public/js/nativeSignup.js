function formReload() {
	document.getElementById("name").value ="";
	document.getElementById("account").value = "";
	document.getElementById("mail").value = "";
	document.getElementById("password1").value = "";
	document.getElementById("password2").value = "";

	document.getElementById("nameCheck").innerText = "";
	document.getElementById("accountCheck").innerText = "";
	document.getElementById("mailCheck").innerText = "";
	document.getElementById("psdCheck").innerText = "";
	document.getElementById("psdConfirmCheck").innerText = "";
	document.getElementById("recaptchaCheck").innerText = "";
	
	grecaptcha.reset();
}

function signup(){
	let name     = document.getElementById("name").value;
	let account  = document.getElementById("account").value;
	let mail     = document.getElementById("mail").value;
	let password1 = document.getElementById("password1").value;
	let password2 = document.getElementById("password2").value;
	let recaptchaRes = document.getElementsByClassName("g-recaptcha-response")[0].value;

	let nameCheckStatus = document.getElementById("nameCheck");
	let accountCheckStatus = document.getElementById("accountCheck");
	let mailCheckStatus = document.getElementById("mailCheck");
	let psdCheckStatus = document.getElementById("psdCheck");
	let psdConfirmCheckStatus = document.getElementById("psdConfirmCheck");
	let recaptchaCheckStatus = document.getElementById("recaptchaCheck")

	console.log(name);
	console.log(account);
	console.log(mail);
	console.log(password1);
	console.log(password2);

	let requestData = {
		"name": name,
	    "account": account,
	    "mail": mail,
	    "password": password1,
	    "passwordConfirm": password2,
	    "recaptchaRes": recaptchaRes
	}
	console.log(requestData);

	let data = JSON.stringify(requestData);

	let xhr = new XMLHttpRequest();
	xhr.open("POST", "/api/1.0/member/signup", false);
	xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");

	xhr.onreadystatechange = function () {
	    if (xhr.readyState === 4 && xhr.status === 200) {
	        let result = JSON.parse(xhr.responseText);
	        console.log(result);

	        if ( result.signupResult ) {
	        	window.location.replace(`/member/verifyStatus?account=${result.account}`);

	        } else {

	        	switch( result.status ) {
					case 0:
						formReload();
						nameCheckStatus.innerText = result.msg;
						break;
					case 1:
						formReload();
						accountCheckStatus.innerText = result.msg;
						break;
					case 2:
						formReload();
						mailCheckStatus.innerText = result.msg;
						break;
					case 3:
						formReload();
						psdCheckStatus.innerText = result.msg;
						break;
					case 4:
						formReload();
						psdConfirmCheckStatus.innerText = result.msg;
						break;
					case 5:
						formReload();
						recaptchaCheckStatus.innerText = result.msg;
						break;
				}
	        }
	    }
	};

	xhr.send(data);	

}