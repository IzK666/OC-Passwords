window.browser = (function () {
	return window.msBrowser || window.browser || window.chrome;
})();

var change = false;

// Saves options to chrome.storage
function save_options() {
	let icon = document.getElementById('icon').value;
	localStorage.setItem("icon", icon);

	browser.runtime.sendMessage({Action: "setIcon"});

	localStorage.setItem("ignoreProtocol", (document.getElementById('ignoreProtocol').checked ? 1 : 0));
	localStorage.setItem("ignoreSubdomain", (document.getElementById('ignoreSubdomain').checked ? 1 : 0));
	localStorage.setItem("ignoreTLD", (document.getElementById('ignoreTLD').checked ? 1 : 0));
	localStorage.setItem("ignorePort", (document.getElementById('ignorePort').checked ? 1 : 0));
	localStorage.setItem("ignorePath", (document.getElementById('ignorePath').checked ? 1 : 0));
	if (change)
		browser.runtime.sendMessage({Action: "reloadURLs"});
	window.close();
}

// Restores options stored in localStorage
function restore_options() {
	document.getElementById('icon').value = (localStorage.getItem("icon") ? localStorage.getItem("icon") : "icon_black");
	document.getElementById('ignoreProtocol').checked = (parseInt(localStorage.getItem("ignoreProtocol")) ? true : false);
	document.getElementById('ignoreSubdomain').checked = (parseInt(localStorage.getItem("ignoreSubdomain")) ? true : false);
	document.getElementById('ignoreTLD').checked = (parseInt(localStorage.getItem("ignoreTLD")) ? true : false);
	document.getElementById('ignorePort').checked = (parseInt(localStorage.getItem("ignorePort")) ? true : false);
	document.getElementById('ignorePath').checked = (parseInt(localStorage.getItem("ignorePath")) ? true : false);
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);

document.getElementById('Protocol').addEventListener('mouseover', function() {document.getElementById('exampleProtocol').classList.remove('hide');});
document.getElementById('Subdomain').addEventListener('mouseover', function() {document.getElementById('exampleSubdomain').classList.remove('hide');});
document.getElementById('TLD').addEventListener('mouseover', function() {document.getElementById('exampleTLD').classList.remove('hide');});
document.getElementById('Port').addEventListener('mouseover', function() {document.getElementById('examplePort').classList.remove('hide');});
document.getElementById('Path').addEventListener('mouseover', function() {document.getElementById('examplePath').classList.remove('hide');});

document.getElementById('Protocol').addEventListener('mouseleave', function() {document.getElementById('exampleProtocol').classList.add('hide');});
document.getElementById('Subdomain').addEventListener('mouseleave', function() {document.getElementById('exampleSubdomain').classList.add('hide');});
document.getElementById('TLD').addEventListener('mouseleave', function() {document.getElementById('exampleTLD').classList.add('hide');});
document.getElementById('Port').addEventListener('mouseleave', function() {document.getElementById('examplePort').classList.add('hide');});
document.getElementById('Path').addEventListener('mouseleave', function() {document.getElementById('examplePath').classList.add('hide');});

document.getElementById('Protocol').addEventListener('change', function() {change = true;});
document.getElementById('Subdomain').addEventListener('change', function() {change = true;});
document.getElementById('TLD').addEventListener('change', function() {change = true;});
document.getElementById('Port').addEventListener('change', function() {change = true;});
document.getElementById('Path').addEventListener('change', function() {change = true;});
