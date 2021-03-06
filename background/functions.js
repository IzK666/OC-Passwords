
function start() {
	// Check options from localStorage and load defaults if not defined.
	if (localStorage.getItem("ignoreProtocol") == null)
		localStorage.setItem("ignoreProtocol", "1");
	if (localStorage.getItem("ignoreSubdomain") == null)
		localStorage.setItem("ignoreSubdomain", "0");
	if (localStorage.getItem("ignoreTLD") == null)
		localStorage.setItem("ignoreTLD", "0");
	if (localStorage.getItem("ignorePort") == null)
		localStorage.setItem("ignorePort", "0");
	if (localStorage.getItem("ignorePath") == null)
		localStorage.setItem("ignorePath", "1");
	if (localStorage.getItem("countDown") == null)
		localStorage.setItem("countDown", 10);


	localStorage.removeItem("searchword"); // Remove search
	browser.browserAction.setBadgeText({text: ""});
	browser.browserAction.setIcon({path: "images/icon_grey.png"});

	// Check User and Password localStorage variables
	if (localStorage.getItem("user") && localStorage.getItem("code")) {
		login (localStorage.getItem("host"), localStorage.getItem("code"));
	}
}

function login(Host, User, Pass=null) {
	// retrieve passwords from server
	// if Pass is null, asume that User is Login
	localStorage.removeItem("vault");
	let Login = (Pass == null) ? User : btoa(User + ":" + Pass);
	database = {
		Host,
		Login
	};
	fetchAll(database, function (F){fetchCategories(database);loggedIn();});
	database.currentView = "main";
	if ((Pass != null) && (localStorage.remember == 1))
		localStorage.setItem("code", Login);
}

function loggedIn() {
	// Once logged in, do something
	database.vault.sort(dynamicSort("url")); // Sort list by url, to make faster searches.
	if (localStorage.getItem("icon"))
		browser.browserAction.setIcon({path: "images/" + localStorage.getItem("icon") + ".png"});
	else
		browser.browserAction.setIcon({path: "images/icon_black.png"});
	browser.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
		try {
			processPasswords(tabs[0].url);
		} catch (err) {}
	});
	if (localStorage.getItem("idleTime")) {
		enableAlarm();
	}
}

function logout() {
	delete database.Login;
	delete database.vault;
	delete database.search;
	localStorage.removeItem("code");
	browser.browserAction.setIcon({path: "images/icon_grey.png"});
	browser.browserAction.setBadgeText({text: ""});
}

function toClipboard(val="") {
	let body = document.getElementsByTagName("body")[0];
	let item = document.createElement("input");
	item.type = "text";
	item.value = val;
	body.appendChild(item);
	item.select();
	document.execCommand('copy');
	body.removeChild(item);
}

function clearClipboard() {
	var clearClipboard = function(e) {
		e.clipboardData.setData('text/plain', "");
		e.preventDefault();
		document.removeEventListener('copy', clearClipboard); //don't listen anymore
	}

	document.addEventListener('copy', clearClipboard);
	document.execCommand('copy');
}

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
			toClipboard(" "); // Set a blank space on clipboard.
			clearClipboard(); // Empty clipboard. Not working on FF
			delete sessionStorage.timer;
			delete sessionStorage.x
		}
	}, 1000);

}

function enableAlarm() {
	let time = 60;
	if (localStorage.getItem("idleH") && localStorage.getItem("idleM"))
		time = parseInt(localStorage.getItem("idleH")) * 60 + parseInt(localStorage.getItem("idleM"));
	browser.alarms.create("idle", {delayInMinutes: time} );
}

function searchRemove() {
	delete database.search;
	localStorage.removeItem("searchword");
}

function dynamicSort(property) {
	var sortOrder = 1;
	if(property[0] === "-") {
		sortOrder = -1;
		property = property.substr(1);
	}
	if(property.substr(-2) === "/i") {
		caseSensitive = 0;
		property = property.substr(0,property.length-2);
	}
	else
		caseSensitive = 1;

	return function (a,b) {
		if (caseSensitive == 0)
			var result = (a[property].toLowerCase() < b[property].toLowerCase()) ? -1 : (a[property].toLowerCase() > b[property].toLowerCase()) ? 1 : 0;
		else
			var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
	    return result * sortOrder;
	}
}

function dynamicSortMultiple() {
    /*
     * save the arguments object as it will be overwritten
     * note that arguments object is an array-like object
     * consisting of the names of the properties to sort by
     */
    var props = arguments;
    return function (obj1, obj2) {
        var i = 0, result = 0, numberOfProperties = props.length;
        /* try getting a different result from 0 (equal)
         * as long as we have extra properties to compare
         */
        while(result === 0 && i < numberOfProperties) {
            result = dynamicSort(props[i])(obj1, obj2);
            i++;
        }
        return result;
    }
}