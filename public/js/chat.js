function addMessage(sendID, receiveID, message){
	let otherImgURL = "";
	let msgContainer = document.getElementById("messageBox");


	if (sendID === "radiohead") {
		otherImgURL = "../../public/img/online-support.png";
	
	} else if (sendID === "system"){
		otherImgURL = "../../public/img/announcement.png";

	} else {
		otherImgURL = "https://bootdey.com/img/Content/user_3.jpg";

	}
	
	let msgBox = document.createElement("li");
	msgBox.setAttribute("class",(sendID===receiveID?"right":"left") + " clearfix")

	let imgBox = document.createElement("span");
	imgBox.setAttribute("class", "chat-img " + (sendID===receiveID?"pull-right":"pull-left"));
	
	let img = document.createElement("img");
	img.setAttribute("src",sendID===receiveID?"https://bootdey.com/img/Content/user_1.jpg":otherImgURL);
	imgBox.appendChild(img);

	let bodyBox = document.createElement("div");
	bodyBox.setAttribute("class","chat-body clearfix");

	let bodyHeader = document.createElement("div");
	bodyHeader.setAttribute("class","body-header");

	let sender = document.createElement("strong");
	sender.setAttribute("class","primary-font");
	sender.innerText = sendID;

	bodyHeader.appendChild(sender);
	
	let bodyP = document.createElement("p");
	bodyP.innerText = message;

	bodyBox.appendChild(bodyHeader);
	bodyBox.appendChild(bodyP);

	msgBox.appendChild(imgBox);
	msgBox.appendChild(bodyBox);
	msgContainer.appendChild(msgBox);

	autoScrollDown();
}

function autoScrollDown() {
	let messageContainer = document.getElementsByClassName("chat-message")[0];
	let isScrolledToBottom = messageContainer.scrollHeight - messageContainer.clientHeight <= messageContainer.scrollTop + 1;

	if(!isScrolledToBottom) {
		messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;
	}
}

function sendMessageByEnter() {
	if(event.keyCode=="13"){
		document.getElementById("send-button").click();
	}
}