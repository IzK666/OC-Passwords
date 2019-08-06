function processDatabase() {
	if (!database.vault) {
		return;
	}
	for (let i=0; i<database.vault.length; i++) {
		database.vault[i].url = processURL(database.vault[i].address);
		//var entryWebsite = processURL(database.vault[i].website);
	}
}

// Search current tab's url (inputURL) in database
function processPasswords(inputURL) {
	if (!database.vault) {
		return;
	}
	var host = processURL(inputURL);
	var results = [];
	var websiteList = [];
	var userList = [];
	var passwordList = [];
	let n = firstPass(host);
	if (n !== false) {
		while (host === database.vault[n].url) {
			results.push({'website': database.vault[n].website, 'user': database.vault[n].loginname, 'pass': database.vault[n].pass});
			n++;
		}
	}
	if (results.length > 0) {
		if (results.length > 1)
			results.sort(dynamicSort("user/i")); // Sort list by username
		for (let i = 0; i < results.length; i++) {
			websiteList.push(results[i].website);
			userList.push(results[i].user);
			passwordList.push(results[i].pass);
		}
		browser.browserAction.setBadgeText({text: (results.length).toString()});
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

//Process inputURL to remove those parts ignored by user configuration
function processURL(inputURL) {
	let settings = parseInt(localStorage.getItem("ignorePath")) * 16 +
					parseInt(localStorage.getItem("ignoreProtocol")) * 8 +
					parseInt(localStorage.getItem("ignorePort")) * 4 +
					parseInt(localStorage.getItem("ignoreSubdomain")) * 2 +
					parseInt(localStorage.getItem("ignoreTLD"));

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
	var protocol = URLobj.protocol; // settings & 8
	var host = URLobj.hostname;
	var path = URLobj.pathname; // settings & 16
	var port = URLobj.port; // settings & 4
	var hostnoport = host;

	if (host === null || host === "") {
		return inputURL;
	}

	if (protocol.match("^(f|ht)tp") == null)
		return inputURL;

	if (URLobj.port) {
		// remove port from host
		hostnoport = host.replace(":"+URLobj.port, "");
	}

	let isIP = (hostnoport.match(/^\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}$/) !== null)

	let baseHost = "";

	if (isIP) {
		baseHost = host;
	}
	else
	{
		if ((settings & 3) == 0)
			baseHost = host;
		else
			baseHost = trimDomain(host, settings & 3);
	}

	let returnURL = "";
	if (!(settings & 8)) // include protocol
		returnURL = protocol + "//";

	returnURL += baseHost;

	if ((port) && !(settings & 4))
		returnURL += ":" + port;

	if (!(settings & 16)) // include path
		returnURL += path;

	if (returnURL.slice(-1) === "/") {
		returnURL = returnURL.slice(0, -1);
	}
	return returnURL;
}

//Search passwords in the vault (localStorage)
function searchPasswords(string) {
	if (!database.vault) {
		return;
	}
	var results = [];
	var websiteList = [];
	var addressList = [];
	var hasAddress = [];
	var userList = [];
	var passwordList = [];
	for (let i = 0; i < database.vault.length; i++) {
		var entry =	JSON.stringify(database.vault[i]);
		if (entry.toLowerCase().indexOf(string.toLowerCase()) >= 0) {
			results.push({'website': database.vault[i].website, 'address': database.vault[i].address, 'hasAddress': (database.vault[i].address.length ? 1 : 0), 'user': database.vault[i].loginname, 'password': database.vault[i].pass});
		}
	}
	if (results.length > 0) {
		if (results.length > 1)
			results.sort(dynamicSortMultiple("website/i", "user/i"));
		for (let i = 0; i < results.length; i++) {
			websiteList.push(results[i].website);
			addressList.push(results[i].address);
			hasAddress.push(results[i].hasAddress);
			userList.push(results[i].user);
			passwordList.push(results[i].password);
		}
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

function trimDomain(host, options=2) {
	// Return the domain without the www part, subdomains and TLD.
	// Options allows you to choose the parts to remove:
	//	1: Remove TLD
	//	2: Remove subdomain
	
	// Example: getDomain("www.google.com", 1|2)

	var splittedURL = host.split(".");
	if (splittedURL[0].match("^www\d?$"))
		splittedURL.splice(0, 1);
	if (splittedURL.length > 5)
		if (isTLD(splittedURL[splittedURL.length-5] + "." + splittedURL[splittedURL.length-4] + "." + splittedURL[splittedURL.length-3] + "." + splittedURL[splittedURL.length-2] + "." + splittedURL[splittedURL.length-1], 4, 0, TLD4.length)) {
			switch (options) {
				case 3:
					return splittedURL[splittedURL.length-6];
					break;
				case 2:
					splittedURL.splice(0,splittedURL.length-6);
					return splittedURL.join(".");
					break;
				case 1:
					splittedURL.splice(splittedURL.length-5, 5);
					return splittedURL.join(".");
					break;
			}
		}
	if (splittedURL.length > 4)
		if (isTLD(splittedURL[splittedURL.length-4] + "." + splittedURL[splittedURL.length-3] + "." + splittedURL[splittedURL.length-2] + "." + splittedURL[splittedURL.length-1], 3, 0, TLD3.length)) {
			switch (options) {
				case 3:
					return splittedURL[splittedURL.length-5];
					break;
				case 2:
					splittedURL.splice(0,splittedURL.length-5);
					return splittedURL.join(".");
					break;
				case 1:
					splittedURL.splice(splittedURL.length-4, 4);
					return splittedURL.join(".");
					break;
			}
		}
	if (splittedURL.length > 3)
		if (isTLD(splittedURL[splittedURL.length-3] + "." + splittedURL[splittedURL.length-2] + "." + splittedURL[splittedURL.length-1], 2, 0, TLD2.length)) {
			switch (options) {
				case 3:
					return splittedURL[splittedURL.length-4];
					break;
				case 2:
					splittedURL.splice(0,splittedURL.length-4);
					return splittedURL.join(".");
					break;
				case 1:
					splittedURL.splice(splittedURL.length-3, 3);
					return splittedURL.join(".");
					break;
			}
		}
	if (splittedURL.length > 2)
		if (isTLD(splittedURL[splittedURL.length-2] + "." + splittedURL[splittedURL.length-1], 1, 0, TLD1.length)) {
			switch (options) {
				case 3:
					return splittedURL[splittedURL.length-3];
					break;
				case 2:
					splittedURL.splice(0,splittedURL.length-3);
					return splittedURL.join(".");
					break;
				case 1:
					splittedURL.splice(splittedURL.length-2, 2);
					return splittedURL.join(".");
					break;
			}
		}
	switch (options) {
		case 3:
			return splittedURL[splittedURL.length-2];
			break;
		case 2:
			splittedURL.splice(0,splittedURL.length-2);
			return splittedURL.join(".");
			break;
		case 1:
			splittedURL.splice(splittedURL.length-1, 1);
			return splittedURL.join(".");
			break;
	}
}

//	Check if tld is a real tld
function isTLD (tld, num, top, bottom) {
	tld = tld.toLowerCase();
	let look = parseInt((top + bottom) / 2);
	let comp = this["TLD"+num][look];
	if (tld < comp)
		if (bottom - top <= 1)
			return false;
		else
			return isTLD (tld, num, top, look);
	else if (comp < tld)
		if (bottom - top <= 1)
			return false;
		else
			return isTLD (tld, num, look, bottom);
	else
		return true;
}

/*	Search the first ocurrence for "url"
	Returns:	False if nothing found
				index of first match
*/
function firstPass(url, top=0, bottom=database.vault.length) {
	url = url.toLowerCase();
	let look = parseInt((top + bottom) / 2);
	let comp = database.vault[look].url.toLowerCase();
	if (url < comp)
		if (bottom - top <= 1)
			return false;
		else
			return firstPass (url, top, look);
	else if (comp < url)
		if (bottom - top <= 1)
			return false;
		else
			return firstPass (url, look, bottom);
	else { // Found
		// Now look back to find the first ocurrence, as some url can have more than a password
		var n = look-1;
		while (url == database.vault[n].url.toLowerCase()) {
			n--;
		}
		return n+1;
	}
}