function checkStorage() {
	// Check localStorage variables
	if (localStorage.getItem("user") && localStorage.getItem("pass")) {
		login (localStorage.getItem("host"), localStorage.getItem("user"), localStorage.getItem("pass"));
	}
	else if (sessionStorage.getItem("user") && sessionStorage.getItem("pass")) {
		login (localStorage.getItem("host"), sessionStorage.getItem("user"), sessionStorage.getItem("pass"));
	}
	else {
//		console.log("Started. Missing login data.");
	}
}

function login(Host, User, Pass) {
	// retrieve passwords from server
	localStorage.removeItem("vault");
	let Login = btoa(User + ":" + Pass);
	database = {
		Host,
		User,
		Pass,
		Login
	};
	fetchAll(database, loggedIn);
}

function loggedIn() {
	// Once logged in, do something
	browser.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
		try {
			processPasswords(tabs[0].url);
		} catch (err) {}
	});
}

function toClipboard(val) {
	let body = document.getElementsByTagName("body")[0];
	let item = document.createElement("input");
	item.id="removeme";
	item.type = "text";
	item.value = val;
	body.appendChild(item);
	item.select();
	document.execCommand('copy');
	body.removeChild(item);
}

// Clear clipboard after certain time
function countdown(time) {
	sessionStorage.timer = time;
	if (sessionStorage.x)
		clearInterval (sessionStorage.x);
	sessionStorage.x = setInterval(function() {
		time -= 1;
		sessionStorage.timer = time;
		if (time < 0)
		{
			clearInterval (sessionStorage.x);
			toClipboard(" "); // Empty clipboard
			delete sessionStorage.timer;
			delete sessionStorage.x
		}
	}, 1000);

}