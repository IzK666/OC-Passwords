window.browser = (function () {
	return window.msBrowser || window.browser || window.chrome;
})();

function load() {
	// Load login div
	document.getElementById("loginHost").value = localStorage.getItem("host");
	document.getElementById("loginUser").value = localStorage.getItem("user");
	document.getElementById("loginPass").placeholder = (localStorage.getItem("code")) ? "******" : "";
	document.getElementById("loginRemember").checked = (parseInt(localStorage.getItem("remember")) ? true : false);

	hostChanged();

	browser.runtime.sendMessage({ Action: "logged"}, function(response) {
		// Background.js is logged (has passwords)
		if (response) {
			searchChanged();
			viewPasswords();
			document.getElementById("textTotalLogins").textContent = response + " items";
			document.getElementById("searchText").focus();

			// Get passwords for current page, if any.
			browser.runtime.sendMessage({ Action: "getPasswords" }, function(response2) {
				if (response2.passwords) {
					document.getElementById("divPasswords").removeChild(document.getElementById("divLogins"));

					let table = document.createElement("table");
					table.id = "webResults";

					for (let i = 0; i < response2.passwords.length; i++) {
						let row = document.createElement("tr");
						row.id = i;
						let td0 = document.createElement("td");
						let td1 = document.createElement("td");
						let td2 = document.createElement("td");
						td0.className = "bold";
						td0.style.width = "55%";
						td0.addEventListener("click", clickCell, false);
						td0.addEventListener("mouseenter", enterCell, false);
						td0.addEventListener("mouseleave", leaveCell, false);
						td1.className = "center";
						td1.style.width = "25%";
						td1.addEventListener("click", clickCell, false);
						td1.addEventListener("mouseenter", enterCell, false);
						td1.addEventListener("mouseleave", leaveCell, false);
						td2.style.width = "20%";
						td2.addEventListener("click", clickFill, false);
						let td0T = document.createTextNode(response2.passwords[i]);
						let td1T = document.createTextNode("*****");
						let td2B = document.createElement("button");
						let td2BT = document.createTextNode("Fill");

						td2B.appendChild(td2BT);

						td0.appendChild(td0T);
						td1.appendChild(td1T);
						td2.appendChild(td2B);

						row.appendChild(td0);
						row.appendChild(td1);
						row.appendChild(td2);
						table.appendChild(row);
					}
					document.getElementById("divPasswords").insertAdjacentElement('afterbegin', table);

				}
			});

			// Show countdown, if required
			browser.runtime.sendMessage({ Action: "getTimer"}, function(response3) {
				if (response3)
					countdown((response3-1));
			});

			if (localStorage.getItem("searchword")) {
				document.getElementById("searchText").value = localStorage.getItem("searchword");
				search();
				document.getElementById("searchText").select();
			}

			// reset Alarm
			browser.runtime.sendMessage({ Action: "alarm" });
		}
		else {
			browser.browserAction.setBadgeText({ text: "" });
			viewLogin();
			document.getElementById("loginHost").focus();
		}
	});

	// Add categories
	browser.runtime.sendMessage({ Action: "getCategories"}, function (response) {
		if (response !== false) {
			console.log(response);
			var node = document.createElement("select");
			node.setAttribute("id", "npCategory");
			let o = document.createElement("option");
			o.setAttribute("value", "0");
			o.appendChild(document.createTextNode("-- No category --"));
			node.appendChild(o);
			for (let i = 0; i < response.length; i++) {
				let o = document.createElement("option");
				o.setAttribute("value", response[i].id);
				o.setAttribute("label", response[i].name);
				o.appendChild(document.createTextNode(response[i].name));
				node.appendChild(o);
			}
			node.addEventListener("change", function(k){localStorage.setItem("npCat", document.getElementById("npCategory").value);}, false);
			var cell = document.createElement("td");
			cell.setAttribute("colspan", 3);
			cell.appendChild(node);
			var row = document.createElement("tr").appendChild(cell);
			var ref = document.getElementById("npRef");
			ref.parentNode.insertBefore(row, ref);
		}
	});
}

//	*************************************************************
//	Change views

function viewLogin() {
	document.getElementById("divLogin").style.display = "table";//"table-row";
	document.getElementById("divNew").style.display = "none";
	document.getElementById("divPasswords").style.display = "none";
}

function viewPasswords() {
	document.getElementById("divLogin").style.display = "none";
	document.getElementById("divPasswords").style.display = "table";
	document.getElementById("divNew").style.display = "none";
//	document.getElementById("rowGenerator").style.display = "none";
}

function viewNew() {
	document.getElementById("divPasswords").style.display = "none";
	document.getElementById("divLogin").style.display = "none";
	document.getElementById("divNew").style.display = "table";
	addressChanged();
	document.getElementById("npAddress").focus();

}

//	*************************************************************

//	*************************************************************
//	Login page

function hostChanged() {
	var element = document.getElementById("loginHost");
	element.value = element.value.trim().replace( new RegExp("/$"), "");

	if (element.value.length == 0) {
		document.getElementById("loginHostWarning").style.display = "none";
		return;
	}

	element.value = element.value.replace(new RegExp("^(htt?p)(s?):\/\/?(.*)$", "gi"), "http$2://$3"); // Detects and corrects single 'T' and single '/' from https
	let https = element.value.match(/^(.*)(:\/\/?)/);
	// MISSING
	// Process for https:/url.com

	if (https) {
		document.getElementById("loginHostWarning").style.display = (https[1].toLowerCase() == "https" ? "none" : "table-row");
	}
	else {
		element.value = "https://" + element.value;
		document.getElementById("loginHostWarning").style.display = "none";
	}
}

function access() {
	let dest = document.getElementById("loginHost").value;
	if (isURL(dest)) {
		browser.runtime.sendMessage({ Action: "openUrl", url: dest });
		window.close();
	} else {
		showWarning("loginHost", "The url is incorrect");
	}
}

function login() {
	// Save FORM values
	let Host = document.getElementById("loginHost").value;
	let User = document.getElementById("loginUser").value;
	let Pass = document.getElementById("loginPass").value;

	if (User.length == 0) {
		showWarning("loginUser", "User can't be empty");
		if ((Pass.length == 0) && (!localStorage.getItem("code")))
			showWarning("loginPass", "Password can't be empty");
			return;
	}

	localStorage.setItem("host", Host);
	localStorage.setItem("remember", (document.getElementById("loginRemember").checked ? 1 : 0));
	if (document.getElementById("loginRemember").checked) {
		localStorage.setItem("user", User);
	}
	else {
		localStorage.removeItem("user");
		localStorage.removeItem("login");
	}

	if (Pass.length == 0) {
		let Code = localStorage.getItem("code");
		if (Code) {
			browser.runtime.sendMessage({ Action: "login", Host, Code });
		} else {
			showWarning("loginPass", "Password can't be empty");
			return;
		}
	} else {
		// Send values to background script
		if (document.getElementById("loginRemember").checked) {
			browser.runtime.sendMessage({ Action: "login", Host, User, Pass}, function(response) {
				localStorage.setItem("code", response);
			});
		}
		else {
			browser.runtime.sendMessage({ Action: "login", Host, User, Pass });
		}
	}
	window.close();
}

function cancel() {
	document.getElementById("loginHost").value = localStorage.getItem("host");
	document.getElementById("loginRemember").checked = (parseInt(localStorage.getItem("remember")) ? true : false);
	if (document.getElementById("loginRemember").checked) {
		document.getElementById("loginUser").value = localStorage.getItem("user");
	}
	window.close();
}
//	*************************************************************

//	*************************************************************
//	Main page. Search related

function searchChanged() {
	var element = document.getElementById("searchText").value.trim();

	if (element.length == 0) {
		document.getElementById("searchWarning").style.display = "none";
	} else if (element.length < 3) {
		document.getElementById("searchWarning").style.display = "table-row";
	}
	else {
		document.getElementById("searchWarning").style.display = "none";
	}
	search();
}

function search() {
	var string = document.getElementById("searchText").value.trim();
	var parent = document.getElementById("tableSearch");

	// remove last search, if any
	let destroy = document.getElementById("searchResults");
	if (destroy)
			destroy.remove();

	// if no search value, exit
	if (string.length < 3)
		return

	localStorage.setItem("searchword", string);

	browser.runtime.sendMessage({ Action: "search"}, function (response) {
		if (response) {

			let random = parseInt(Math.random() * 10 + 1);

			let table = document.createElement("table");
			table.id = "searchResults";
			for (let i = 0; i < response.websiteList.length; i++) {
				let row = document.createElement("tr");
				row.id = i;

				let td0 = document.createElement("td");
				td0.style.width = "40%";
				if (response.hasAddress[i]) {
					td0.tabIndex = 0;
					td0.className = "href";
					td0.addEventListener("click", clickCell, false);
					td0.addEventListener("keyup", keyCell, false);
				}
				td0.addEventListener("mouseenter", enterCell, false);
				td0.addEventListener("mouseleave", leaveCell, false);

				let td1 = document.createElement("td");
				td1.className = "center";
				td1.style.width = "35%";
				td1.addEventListener("click", clickCell, false);
				td1.addEventListener("mouseenter", enterCell, false);
				td1.addEventListener("mouseleave", leaveCell, false);

				let td2 = document.createElement("td");
				td2.className = "center";
				td2.style.width = "25%";
				td2.addEventListener("click", clickCell, false);
				td2.addEventListener("mouseenter", enterCell, false);
				td2.addEventListener("mouseleave", leaveCell, false);

				let td0T = document.createTextNode(response.websiteList[i]);
				let td1T = document.createTextNode(response.userList[i]);
				let td2T = document.createTextNode("*****");

				td0.appendChild(td0T);
				td1.appendChild(td1T);
				td2.appendChild(td2T);

				row.appendChild(td0);
				row.appendChild(td1);
				row.appendChild(td2);

				table.appendChild(row);
			}
			parent.parentNode.insertBefore(table, parent.nextSibling);
		}
	});
}

function searchRemove() {
	// remove last search, if any
	let destroy = document.getElementById("searchResults");
	if (destroy)
			destroy.remove();

	localStorage.removeItem("searchword");
	document.getElementById("searchText").value = "";

	browser.runtime.sendMessage({ Action: "searchRemove" });
}

function clickCell(e) {
	clickElement(this);
}

function keyCell(e) {
	var keyCode = e.keyCode;
	if (keyCode == 13 || keyCode == 32){
		clickElement(this);
	}
}

function clickElement(el) {
	if (el.parentElement.parentElement.id === "searchResults") {
		switch (el.cellIndex) {
			case 0:
				browser.runtime.sendMessage({ Action: "openLink", source: "searchResults", list: "addressList", id: el.parentNode.rowIndex });
				window.close();
				break;
			case 1:
			case 2:
				browser.runtime.sendMessage({ Action: "copy", source: "searchResults", list: (el.cellIndex == 1 ? "userList" : "passwordList"), id: el.parentNode.rowIndex });
				if (sessionStorage.x)
					clearInterval(sessionStorage.x)
				countdown(parseInt(localStorage.getItem("countDown")));
				break;
		}
	} else { // webResults
		browser.runtime.sendMessage({ Action: "copy", source: "webResults", list: (el.cellIndex == 0 ? "userList" : "passwordList"), id: el.parentNode.rowIndex });
		if (sessionStorage.x)
			clearInterval(sessionStorage.x)
		countdown(parseInt(localStorage.getItem("countDown")));
	}
}

function enterCell(e) {
	this.classList.add("highlightCell");
}

function leaveCell (e) {
	this.classList.remove("highlightCell");
}

function clickFill(e) {
	browser.runtime.sendMessage({ Action: "fill", id: this.parentNode.rowIndex });
	window.close();
}

function showWarning(node, warn) {
	let span = document.createElement("span");
	span.className = "warning";
	span.innerHTML = warn;
	let parent = document.getElementById(node).parentNode;
	parent.appendChild(span);
	setTimeout(function(){parent.removeChild(span);}, 4000);
}

//	*************************************************************

//	*************************************************************
//	Main page. Buttons related

function refresh() {
	browser.runtime.sendMessage({ Action: "refresh" });
	window.close();
}

function logout() {
	browser.runtime.sendMessage({ Action: "logout" });
	resetNew();
	searchRemove();
	window.close();
}

//	*************************************************************

//	*************************************************************
//	New password page.

//	*************************************************************

function loadNew() {
	document.getElementById("npWebsite").value = localStorage.getItem("npWebsite");
	document.getElementById("npAddress").value = localStorage.getItem("npAddress");
	document.getElementById("npUser").value = localStorage.getItem("npUser");
	document.getElementById("npPass").value = localStorage.getItem("npPass");
	if (document.getElementById("npCategory"))
		document.getElementById("npCategory").value = (localStorage.getItem("npCat")) ? localStorage.getItem("npCat") : 0;
	document.getElementById("npNotes").value = localStorage.getItem("npNotes");
	document.getElementById("npList").value = (localStorage.getItem("npList")) ? localStorage.getItem("npList"): "!@#$%^&*()_+~[]{}:;?<>,./-=";
	document.getElementById("npLength").value = (localStorage.getItem("npLength")) ? localStorage.getItem("npLength") : 30;
}

function resetNew() {
		document.getElementById("npWebsite").value = "";
		document.getElementById("npAddress").value = "";
		document.getElementById("npUser").value = "";
		document.getElementById("npPass").value = "";
		if (document.getElementById("npCaegory"))
			document.getElementById("npCategory").value = "0";
		document.getElementById("npNotes").value = "";
		document.getElementById("npLower").checked = 1;
		document.getElementById("npUpper").checked = 1;
		document.getElementById("npNumber").checked = 1;
		document.getElementById("npSpecial").checked = 1;
		document.getElementById("npList").value = "!@#$%^&*()_+~[]{}:;?<>,./-=";
		document.getElementById("npLength").value = 30;
		localStorage.removeItem("npWebsite");
		localStorage.removeItem("npAddress");
		localStorage.removeItem("npUser");
		localStorage.removeItem("npPass");
		localStorage.removeItem("npList");
		localStorage.removeItem("npLength");
		localStorage.removeItem("npCat");
		localStorage.removeItem("npNotes");
}

function createNew() {
	let newLogin = document.getElementById("npUser").value;
	let newPass = document.getElementById("npPass").value;
	let newWeb = document.getElementById("npWebsite").value;
	let newAddress = document.getElementById("npAddress").value;
	let newNotes = document.getElementById("npNotes").value;
	let newCategory = (document.getElementById("npCategory")) ? document.getElementById("npCategory").value : 0;
	
	let errors = 0;
	if (newLogin.length == 0) {
		showWarning("npUser", "Login or email required");
		errors++;
	}
	if (newPass.length == 0) {
		showWarning("npPass", "Password required");
		errors++;
	}
	if (newWeb.length == 0) {
		showWarning("npWebsite", "Site name required");
		errors++;
	}
	if (errors > 0)
		return;
	if (addressChanged) { // Check if address is correct
		let Pass = {
			loginname: newLogin,
			pass: newPass,
			website: newWeb,
			address: newAddress,
			category: newCategory,
			notes: newNotes
		};
		browser.runtime.sendMessage({ Action: "createPassword", Pass });
		resetNew();
		window.close();
	}
}

function useGenerator() {
	//let gpo = document.getElementById("rowGenerator");
	//if (gpo.style.display === "table-row") { // Generate a password
	let gLow = document.getElementById("npLower").checked;
	let gUp = document.getElementById("npUpper").checked;
	let gNum = document.getElementById("npNumber").checked;
	let gSpecial = document.getElementById("npSpecial").checked;
	let gLength = parseInt(document.getElementById("npLength").value);
	document.getElementById("npPass").value= generatepw(gLow, gUp, gNum, gSpecial, gLength);
	//} else { // Show Generator
	//	gpo.style.display = "table-row";
	//}
}

function trimValue(id) {
	var element = document.getElementById(id);
	element.value = element.value.trim();
}

function addressChanged() {

	var url = document.getElementById("npAddress").value.trim();

	if (url.length == 0) { // No URL
		return true;
	} else
	if (isURL(url)) { // URL is correct
		url = url.replace(new RegExp(/^(?!http(s?):\/\/)(.*)$/, "gi"), "https://$2"); // Add https if omitted
		document.getElementById("npAddress").value = url;
		if (document.getElementById("npWebsite").value.length == 0) {
			var objurl = new URL(url)
			document.getElementById("npWebsite").value = objurl.hostname;
		}
		return true;
	} else { // URL is wrong
		showWarning("npAddress", "Fill in a valid URL.<br>This field is optional and can be left blank");
		return false;
	}
}

function generatepw(lower, upper, number, special, length_chars) {

	var length_calc = Math.floor(length_chars / (lower + upper + number + special));

	var Wlower = "";
	var Wupper = "";
	var Wnumber = "";
	var Wspecial = "";

	if (lower) {
		Wlower = random_characters(0, length_calc);
	}
	if (upper) {
		Wupper = random_characters(1, length_calc);
	}
	if (number) {
		Wnumber = random_characters(2, length_calc);
	}
	if (special) {
		Wspecial = random_characters(3, length_calc);
	}

	var ww = "" + Wlower + Wupper + Wnumber + Wspecial;

	// e.g. length 27 with all 4 options = 6 char for every option (24) so 3 remaining
	// so fill up, starting with special, then number, then upper, then lower:
	var difference = length_chars - length_calc * (lower + upper + number + special);
	if (special) {
		ww = ww + random_characters(3, difference);
	} else if (number) {
		ww = ww + random_characters(2, difference);
	} else if (upper) {
		ww = ww + random_characters(1, difference);
	} else if (lower) {
		ww = ww + random_characters(0, difference);
	}

	// do a Fisher-Yates shuffle
	var a = ww.split("");
	var n = a.length;

	for (var i = n - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var tmp = a[i];
		a[i] = a[j];
		a[j] = tmp;
	}

	ww = a.join("");

	return ww;

}

function random_characters(char_kind, size_wanted) {

	var allowed = "";
	var text = "";

	switch (char_kind) {
		// No | l I 1 B 8 0 O o due to reading ability
		case 0:
			allowed = "abcdefghijkmnpqrstuvwxyz";
			break;
		case 1:
			allowed = "ACDEFGHJKLMNPQRSTUVWXYZ";
			break;
		case 2:
			allowed = "2345679";
			break;
		case 3:
			allowed = document.getElementById("npList").value;
			break;
	}

	for (var i = 0; i < size_wanted; i++)
	text += allowed.charAt(Math.floor(Math.random() * allowed.length));

	return text;
}

function isURL(url) {
	url = url.trim().toLowerCase();
	var re = new RegExp(/^(https?:\/\/www\.|https?:\/\/)?(([a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5})|(([0-9]{1,3}\.){3}[0-9]{1,3}))(:[0-9]{1,5})?(\/.*)?$/, "gi");

	return re.test(url);
}

//	*************************************************************
//	Countdown page.

function countdown(time) {
	if (time > 0) {
		document.getElementById("divCountdown").textContent = time;
		document.getElementById("divCountdown").style.display = "block";
		sessionStorage.x = setInterval(function() {
			time -= 1;
			document.getElementById("divCountdown").textContent = time;
			if (time < 0)
			{
				clearInterval(sessionStorage.x);
				delete sessionStorage.x
				document.getElementById("divCountdown").style.display = "none";
			}
		}, 1000);
	} else {
		document.getElementById("divCountdown").style.display = "none";
	}
}
//	*************************************************************

