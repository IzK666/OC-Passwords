var database = new Object();

window.browser = (function () {
	return window.msBrowser || window.browser || window.chrome;
})();

browser.runtime.onInstalled.addListener(function() {
	checkStorage();
});

browser.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		switch (request.Action) {
			case "login":
				login(request.Host, request.User, request.Pass);
				break;

			case "logged":
				sendResponse((database.vault ? database.vault.length : false));
				break;

			case "getPasswords":
				sendResponse({passwords: (database.passwords ? database.passwords.userList : null)});
				break;

			case "refresh":
				fetchAll(database, loggedIn);
				break;

			case "copy":
				if (request.source == "searchResults")
					toClipboard(database.search[request.list][request.id]);
				else
					toClipboard(database.passwords[request.list][request.id]);

				countdown(10);
				break;

			case "openLink":
				var a = document.createElement("a");
				browser.tabs.create({ url: database.search[request.list][request.id] });
/*				a.href = database.search[request.list][request.id];
				a.target = "_blank";
				var clickEvent = new MouseEvent("click");
				a.dispatchEvent(clickEvent);*/
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
				database.searchword = request.string;
				delete database.search;
				searchPasswords(request.string);
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
				delete database.search;
				delete database.searchword;
				break;

			case "setIcon":
				browser.browserAction.setIcon({path: "images/icon_black.png"});
				break;

			default:
				sendResponse({result: "Action not recognized"});
				break;
		}
	}
);

browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (changeInfo.url)
	{
		try {
			processPasswords(changeInfo.url);
		} catch (err) {}
	}
});

browser.tabs.onActivated.addListener( function(info) {
	browser.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
		try {
			processPasswords(tabs[0].url);
		} catch (err) {}
	});
});
