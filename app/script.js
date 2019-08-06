window.browser = (function () {
	return window.msBrowser || window.browser || window.chrome;
})();

function load() {
	// Load settings div
	if (localStorage.getItem("host"))
		document.getElementById("host").value = localStorage.getItem("host");
	if (localStorage.getItem("user"))
		document.getElementById("user").value = localStorage.getItem("user");
	if (localStorage.getItem("pass"))
		document.getElementById("pass").value = localStorage.getItem("pass");
	document.getElementById("remember").checked = (parseInt(localStorage.getItem("remember")) ? true : false);

	hostChanged();

	browser.runtime.sendMessage({ Action: "logged" }, function(response) {
		// Background.js is logged (has passwords)
		if (response) {
			searchChanged();
			viewPasswords();
			document.getElementById("textTotalLogins").textContent = response + " logins in Database";
			document.getElementById("inputSearch").focus();

			// Get passwords for current page, if any.
			browser.runtime.sendMessage({Action: "getPasswords" }, function(response2) {
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
			browser.runtime.sendMessage({Action: "getTimer" }, function(response3) {
				if (response3)
					countdown((response3-1));
			});

			if (localStorage.getItem("searchword")) {
				document.getElementById("inputSearch").value = localStorage.getItem("searchword");
				search();
				document.getElementById("inputSearch").select();
			}
		}
		else {
			browser.browserAction.setBadgeText({text: ""});
			viewSettings();
			document.getElementById("host").focus();
		}
	});
}

function viewSettings() {
	document.getElementById("divSettings").style.display = "table";//"table-row";
	document.getElementById("divPasswords").style.display = "none";
}

function viewPasswords() {
	document.getElementById("divSettings").style.display = "none";
	document.getElementById("divPasswords").style.display = "table";
}

function hostChanged() {
	var element = document.getElementById("host");
	element.value = element.value.trim().replace( new RegExp("/$"), "");

	if (element.value.length == 0) {
		document.getElementById("hostWarning").style.display = "none";
		return;
	}

	let https = element.value.match(/^(.*)(:\/\/?)/);
	// MISSING
	// Process for https:/url.com

	if (https) {
		document.getElementById("hostWarning").style.display = (https[1].toLowerCase() == "https" ? "none" : "table-row");
	}
	else {
		element.value = "https://" + element.value;
		document.getElementById("hostWarning").style.display = "none";
	}
}

function searchChanged() {
	var element = document.getElementById("inputSearch").value.trim();

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

function save() {
	// Save FORM values
	let Host = document.getElementById("host").value;
	let User = document.getElementById("user").value;
	let Pass = document.getElementById("pass").value
	localStorage.setItem("host", Host);
	localStorage.setItem("remember", (document.getElementById("remember").checked ? 1 : 0));
	if (document.getElementById("remember").checked) {
		localStorage.setItem("user", User);
		localStorage.setItem("pass", Pass);
	}
	else {
		localStorage.removeItem("user");
		localStorage.removeItem("pass");
	}
	window.close();

	// Send values to background script
	browser.runtime.sendMessage({Action: "login", Host, User, Pass});
}

function cancel() {
	document.getElementById("host").value = localStorage.getItem("host");
	document.getElementById("remember").checked = (parseInt(localStorage.getItem("remember")) ? true : false);
	if (document.getElementById("remember").checked) {
		document.getElementById("user").value = localStorage.getItem("user");
		document.getElementById("pass").value = localStorage.getItem("pass");
	}
	else {
		//load from somewhere else
	}
	window.close();
}

function refresh() {
	browser.runtime.sendMessage({ Action: "refresh" });
	window.close();
}

function search() {
	var string = document.getElementById("inputSearch").value.trim();
	var parent = document.getElementById("tableSearch");


	// remove last search, if any
	let destroy = document.getElementById("searchResults");
	if (destroy)
			destroy.remove();

	// if no search value, exit
	if (string.length < 3)
		return

	localStorage.setItem("searchword", string);

	browser.runtime.sendMessage({Action: "search"}, function (response) {
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
	document.getElementById("inputSearch").value = "";

	browser.runtime.sendMessage({Action: "searchRemove"});
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
				browser.runtime.sendMessage({Action: "openLink", source: "searchResults", list: "addressList", id: el.parentNode.rowIndex });
				window.close();
				break;
			case 1:
			case 2:
				browser.runtime.sendMessage({Action: "copy", source: "searchResults", list: (el.cellIndex == 1 ? "userList" : "passwordList"), id: el.parentNode.rowIndex });
				if (sessionStorage.x)
					clearInterval(sessionStorage.x)
				countdown(parseInt(localStorage.getItem("countDown")));
				break;
		}
	} else { // webResults
		browser.runtime.sendMessage({Action: "copy", source: "webResults", list: (el.cellIndex == 0 ? "userList" : "passwordList"), id: el.parentNode.rowIndex });
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
	browser.runtime.sendMessage({Action: "fill", id: this.parentNode.rowIndex });
	window.close();
}

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
