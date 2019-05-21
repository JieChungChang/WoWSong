//header start
function renderHeader() {
	let account = document.getElementById("memberAccount").innerText;

	countPost(account);
	countFollow(account);
	countFollower(account);
} 

function countPost(account) {
	//貼文數
	let postCount = document.getElementById("postCount");
	fetch('/api/1.0/post/countAll?account='+account)
	.then((response) => {
		return response.json(); 
	})
	.then(resJSON=>{
		if ( resJSON ) {
			postCount.innerText=resJSON.count + " 則貼文";
		}
	})
	.catch((err) => {
		console.log('錯誤:', err);
	});
}

function countFollow(account) {
	//追蹤人數
	let followCount = document.getElementById("followCount");
	fetch('/api/1.0/member/follow?account='+account)
	.then((response) => {
		return response.json(); 
	})
	.then(resJSON=>{
		if ( resJSON ) {
			followCount.innerText=resJSON.count + " 位追蹤";
		}
	})
	.catch((err) => {
		console.log('錯誤:', err);
	});
}

function countFollower(account) {
	//粉絲人數
	let followerCount = document.getElementById("followerCount");
	fetch('/api/1.0/member/follower?account='+account)
	.then((response) => {
		return response.json(); 
	})
	.then(resJSON=>{
		if ( resJSON ) {
			followerCount.innerText=resJSON.count + " 位粉絲";
		}
	})
	.catch((err) => {
		console.log('錯誤:', err);
	});
}

//header start end