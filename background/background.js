var database = new Object();

window.browser = (function () {
	return window.msBrowser || window.browser || window.chrome;
})();

browser.runtime.onInstalled.addListener(function() {
	// Remove old variables not longer used
	delete localStorage.pass;
	start();
});

browser.runtime.onStartup.addListener(function() {
	setTimeout(start, 5000);
	//start();
});

browser.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		switch (request.Action) {
			case "login":
				if (request.User)
					login(request.Host, request.User, request.Pass);
				else
					login(request.Host, request.Code);
				break;

			case "logged":
				sendResponse({items: database.vault ? database.vault.length : false, view: database.currentView});
				break;

			case "getPasswords":
				sendResponse({ passwords: (database.passwords ? database.passwords.userList : null) });
				break;

			case "createPassword":
				createNew(database, request.Pass);
				break;

			case "refresh":
				fetchAll(database, loggedIn);
				break;

			case "copy":
				if (request.source == "searchResults")
					toClipboard(database.search[request.list][request.id]);
				else
					toClipboard(database.passwords[request.list][request.id]);

				countdown(parseInt(localStorage.getItem("countDown")));
				break;

			case "openLink":
				var a = document.createElement("a");
				browser.tabs.create({ url: database.search[request.list][request.id] });
				searchRemove();
				break;

			case "openUrl":
				var a = document.createElement("a");
				browser.tabs.create({ url: request.url });
				break;

			case "fill":
				browser.tabs.executeScript(null, {
					code: 'var user = "' + database.passwords.userList[request.id] + '"; var password = "' + database.passwords.passwordList[request.id] + '";'
				}, function() {
					browser.tabs.executeScript(null, {file: 'background/fill-password.js'});
				});
				break;

			case "getTimer":
				sendResponse((sessionStorage.timer ? sessionStorage.timer : null));
				break;

			case "search":
				delete database.search;
				searchPasswords(localStorage.getItem("searchword"));
				if (database.search)
					sendResponse({
						websiteList: database.search.websiteList,
						hasAddress: database.search.hasAddress,
						userList: database.search.userList
					});
				else
					sendResponse(null);
				break;

			case "searchRemove":
				searchRemove();
				break;

			case "setIcon":
				if (database.vault)
					if (localStorage.getItem("icon"))
						browser.browserAction.setIcon({ path: "images/" + localStorage.getItem("icon") + ".png" });
					else
						browser.browserAction.setIcon({ path: "images/icon_black.png" });
				break;

			case "setView":
				database.currentView = request.View;
				break;

			case "getView":
				sendResponse(database.currentView);
				break;

			case "getCategories":
				sendResponse((database.categories) ? database.categories : false);

			case "reloadURLs":
				processDatabase();
				break;

			case "logout":
				logout();
				break;

			case "alarm":
				browser.alarms.clear("idle");
				if ((parseInt(localStorage.getItem("idleTime")) == 1) && (database.vault))
					enableAlarm();
				break;

			default:
				sendResponse({ result: "Action not recognized" });
				break;
		}
	}
);

browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (changeInfo.url)
	{
		try {
			localStorage.setItem("currentUrl", changeInfo.url);
			processPasswords(changeInfo.url);
		} catch (err) {}
	}
});

browser.tabs.onActivated.addListener( function(info) {
	browser.tabs.query({ 'active': true, 'lastFocusedWindow': true}, function (tabs) {
		try {
			localStorage.setItem("currentUrl", tabs[0].url);
			processPasswords(tabs[0].url);
		} catch (err) {}
	});
});

browser.alarms.onAlarm.addListener(function(alarm) {
	logout();
});