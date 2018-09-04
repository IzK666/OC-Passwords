function processPasswords(inputURL) {
	if (!database.vault) {
		return;
	}
	var host = processURL(inputURL);
	var websiteList = [];
	var userList = [];
	var passwordList = [];
	var hits = 0;
	for (let i=0; i<database.vault.length; i++) {
		var entryAddress = processURL(database.vault[i].address);
		var entryWebsite = processURL(database.vault[i].website);
		if (host === entryAddress) {
			websiteList.push(database.vault[i].website);
			userList.push(database.vault[i].loginname);
			passwordList.push(database.vault[i].pass);
			hits = hits + 1;
		}
	}
	if (userList.length > 0) {
		browser.browserAction.setBadgeText({text: (userList.length).toString()});
		browser.browserAction.setBadgeBackgroundColor({color: "#00F"});

		var passwords = {
			websiteList,
			userList,
			passwordList
		};
		database.passwords = passwords;
	}
	else {
		browser.browserAction.setBadgeText({text: ""});
		delete database.passwords;
	}
}

function processURL(inputURL) {
	if (inputURL === null || inputURL === "") {
		return inputURL;
	}
	var URLobj = null;
	try {
		URLobj = new URL(inputURL);
	}
	catch(err) {
		try {
			URLobj = new URL("http://" + inputURL);
		}
		catch(err2) {
			return inputURL;
		}
	}
	var protocol = URLobj.protocol;
	var host = URLobj.host;
	var path = URLobj.pathname;

	if (host === null || host === "") {
		return inputURL;
	}

	var splittedURL = host.split(".");
	var isIP = false;
	if (splittedURL.length === 4) {
		isIP = true;
		for (let i=0; i<splittedURL.length; i++) {
			if (isNaN(splittedURL[i]) || splittedURL[i] < 0 || splittedURL[i] > 255) {
				isIP = false;
			}
		}
	}
	var baseHost = null;
	if (isIP) {
		baseHost = host;
	}
/*	else
	{
		var TLDlength = inputURL.getTLD(URLobj).split(".").length;
		baseHost = splittedURL.slice(- TLDlength - 1).join(".");
	}*/
	var returnURL = "";
//	if (!ignoreSubdomain) {
		returnURL += host;
/*	}
	else {
		returnURL += baseHost;
	}*/
	if (returnURL.slice(-1) === "/") {
		returnURL = returnURL.slice(0, -1);
	}
	return returnURL;
}

function searchPasswords(string) {
	if (!database.vault) {
		return;
	}
	var websiteList = [];
	var addressList = [];
	var hasAddress = [];
	var userList = [];
	var passwordList = [];
	for (let i = 0; i < database.vault.length; i++) {
		var entry =	JSON.stringify(database.vault[i]);
		if (entry.toLowerCase().indexOf(string.toLowerCase()) >= 0) {
			websiteList.push(database.vault[i].website);
			addressList.push(database.vault[i].address);
			hasAddress.push(database.vault[i].address.length ? 1 : 0);
			userList.push(database.vault[i].loginname);
			passwordList.push(database.vault[i].pass);
		}
	}
	if (userList.length > 0) {
		var search = {
			websiteList,
			addressList,
			hasAddress,
			userList,
			passwordList
		};
		database.search = search;
	}
	else {
		delete database.search;
	}
}
