function formReload() {
    document.getElementById("account").value = "";
    document.getElementById("password1").value = "";

    document.getElementById("accountCheck").innerText = "";
    document.getElementById("psdCheck").innerText = "";
    document.getElementById("recaptchaCheck").innerText = "";
    
    grecaptcha.reset();
}

function signin(){
    let account  = document.getElementById("account").value;
    let password1 = document.getElementById("password1").value;
    let recaptchaRes = document.getElementsByClassName("g-recaptcha-response")[0].value;

    let accountCheckStatus = document.getElementById("accountCheck");
    let psdCheckStatus = document.getElementById("psdCheck");
    let recaptchaCheckStatus = document.getElementById("recaptchaCheck");


    formReload()

    let requestData = {
        "account": account,
        "password": password1,
        "recaptchaRes": recaptchaRes
    }

    let data = JSON.stringify(requestData);

    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/1.0/member/nativesignin", false);
    xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let result = JSON.parse(xhr.responseText);
            console.log(result);

            if ( result.signinResult ) {
                window.location.replace(`/post/member?account=${result.account}`);

            } else {

                switch( result.status ) {
                    case 0:
                        formReload();
                        accountCheckStatus.innerText = result.msg;
                        if ( result.msg === "此帳號尚未驗證 email" ) {
                            swal({
                                title: "是否需要修改信箱？",
                                text: "您的信箱尚未進行驗證，若信箱錯誤導致無法驗證，要修改信箱請至修改信箱頁面！",
                                icon: "warning",
                                buttons: true,
                                dangerMode: true,
                            })
                            .then((willDelete) => {
                                if (willDelete) {
                                    window.location.replace('/member/modify/important');
                                } else {
                                    swal("請儘速去您的信箱進行驗證!");
                                }
                            });
                        }
                        break;
                    case 1:
                        formReload();
                        psdCheckStatus.innerText = result.msg;
                        break;
                    case 2:
                        formReload();
                        recaptchaCheckStatus.innerText = result.msg;
                        break;
                }
            }
        }
    };

    xhr.send(data); 

}