function fetchSingle(database, id) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			database.vault.push(jsonToObject(JSON.parse(xhr.response)));
			database.vault.sort(dynamicSort("url")); // Sort the database
		}
	};
	xhr.open("GET", database.Host + "/index.php/apps/passwords/api/0.1/passwords/" + id);
	xhr.setRequestHeader("Authorization", "Basic " + database.Login);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.timeout = 5000;
	xhr.send();
}

function fetchAll(database, callback=null) {
	let loginList;
	var xhr = new XMLHttpRequest();
	xhr.open("GET", database.Host + "/index.php/apps/passwords/api/0.1/passwords");
	xhr.setRequestHeader("Authorization", "Basic " + database.Login);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.timeout = 5000;

	xhr.ontimeout = function () {
		notificationError("Connection to server timed out!\n\nMaybe the certificate is self signed.\nIf that's the case and you TRUST/OWN the server, you have to add an excepcion manually\nAccess the OC website and follow the instructions (Advanced > add exception > Confirm)");
	};
	xhr.onerror = function () {
		notificationError("The request could not be sent!\n\nMaybe the certificate is self signed.\nONLY if you TRUST/OWN the server, access the OC website and follow the instructions:\n(Advanced > add exception > Confirm)");
	};
	xhr.onload = function () {
		if (xhr.status == 401) {
			notificationError("User or password incorrect.");
		}
		else if (xhr.status == 200) {
			loginList = JSON.parse(xhr.response);
			var tempLoginList = [];
			for(let i in loginList) {
				if (loginList[i].deleted == false) {
					tempLoginList.push(jsonToObject(loginList[i]));
				}
			}
			database["vault"] = tempLoginList;
			if (callback)
				callback();
		}
		else if (xhr.status != 200) {
			notificationError("The request couldn't be answered.");
		}
	};
	xhr.send();
}

function fetchCategories(database, callback=null) {
	let categoryList;
	var xhr = new XMLHttpRequest();
	xhr.open("GET", database.Host + "/index.php/apps/passwords/api/0.1/categories");
	xhr.setRequestHeader("Authorization", "Basic " + database.Login);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.timeout = 10000;
	xhr.ontimeout = function () {
		notificationError("Connection to server timed out!");
	};
	xhr.onerror = function () {
		notificationError("The request could not be sent!");
	};
	xhr.onload = function () {
		if (xhr.status == 401) {
			notificationError("User or password incorrect.");
		}
		else if (xhr.status == 200) {
			categoryList = JSON.parse(xhr.response);
			var tempCategoryList = [];
			for(let i in categoryList) {
				tempCategoryList.push({
					id: categoryList[i].id,
					name: categoryList[i].category_name,
					colour: categoryList[i].category_colour
				});
			}
			if (tempCategoryList.length > 0)
				database["categories"] = tempCategoryList;
			if (callback)
				callback();
		}
		else if (xhr.status != 200) {
			notificationError("The request couldn't be answered.");
		}
	};
	xhr.send();
}

function createNew(database, data, callback=null) {
	var xhr = new XMLHttpRequest();
	xhr.open("POST", database.Host + "/index.php/apps/passwords/api/0.1/passwords");
	xhr.setRequestHeader("Authorization", "Basic " + database.Login);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.timeout = 10000;
	xhr.ontimeout = function () {
		notificationError("Connection to server timed out!");
	};
	xhr.onerror = function () {
		notificationError("The request could not be sent!");
	};
	xhr.onload = function () {
		if (xhr.status == 401) {
			notificationError("User or password incorrect.");
		}
		else if (xhr.status == 200) {
			let item = JSON.parse(xhr.response);
			fetchSingle(database, item.id); // Add the new item to the list
			if (callback)
				callback();
		}
		else if (xhr.status != 200) {
			notificationError("The request couldn't be answered.");
		}
	};
	xhr.send(JSON.stringify(data));
}

function escapeJSON(text) {
	var returnText = text;
	returnText = returnText.replace(/\\/g, "\\\\");
	returnText = returnText.replace(/\n/g, "\\n");
	returnText = returnText.replace(/\r/g, "\\r");
	returnText = returnText.replace(/\t/g, "\\t");
	returnText = returnText.replace(/\f/g, "\\f");
	returnText = returnText.replace(/\" *: *\"/g, "\u0000");
	returnText = returnText.replace(/\' *: *\'/g, "\u0000");
	returnText = returnText.replace(/\" *, *\"/g, "\u0001");
	returnText = returnText.replace(/\' *, *\'/g, "\u0001");
	returnText = returnText.slice(2, -2);
	returnText = returnText.replace(/\"/g, "\\\"");
	returnText = returnText.replace(/\u0000/g, "\" : \"");
	returnText = returnText.replace(/\u0001/g, "\" , \"");
	returnText = "{\"" + returnText + "\"}";
	return returnText;
}

function jsonToObject(json) {
	var object = json;
	var properties = "{" + object["properties"] + "}";
	properties = escapeJSON(properties);
	try {
		properties = JSON.parse(properties);
	}
	catch(err) {
		console.error(json);
		console.error(object["properties"]);
		console.exception(err);
		return null;
	}
	for (var key in properties) {
		if ({}.hasOwnProperty.call(properties, key)) {
			object[key] = properties[key];
		}
	}
	delete object["properties"];
	delete object["creation_date"];
	delete object["datechanged"];
	delete object["deleted"];
	delete object["length"];
	delete object["lower"];
	delete object["notes"];
	delete object["number"];
	delete object["special"];
	delete object["strength"];
	delete object["upper"];
	delete object["user_id"];
	object["url"] = processURL(object["address"]);
	return object;
}

function notificationError(body) {
	// Shows a predefined notification with some customized body.
	browser.notifications.create("0CP3rr", {
		type: "basic",
		title: "Failed to get passwords",
		iconUrl: "/images/icon_black.png",
		message: body
	});
	setTimeout(function(){browser.notifications.clear("0CP3rr");}, 5000);
}