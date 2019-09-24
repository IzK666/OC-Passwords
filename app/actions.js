document.addEventListener('DOMContentLoaded', function() {
	load();

	document.getElementById("loginForm").addEventListener("keyup", function(e){
		var keyCode = e.keyCode;
		if (keyCode == 13){ // Key Enter
			login();
		} else if (keyCode == 27){ // Key escape
			window.close();
		}
	});

	document.getElementById("searchText").addEventListener("keyup", function(e){
		var keyCode = e.keyCode;
		if (keyCode == 27){ // Key Escape. Not working in Firefox.
			if (document.getElementById("searchText").value == "")
				window.close();
			else
				searchRemove();
		}
	});

//	*************************************************************
//	Login page

	document.getElementById("loginHost").addEventListener("change", function(){
		hostChanged();
	});

	document.getElementById("loginGo").addEventListener("click", function(){
		access();
	});

	document.getElementById("loginSave").addEventListener("click", function(){
		login();
	});

//	*************************************************************

//	*************************************************************
//	Main page. Search related

	document.getElementById("searchText").addEventListener("input", function(){
		searchChanged();
	});

	document.getElementById("searchCancel").addEventListener("click", function(){
		searchRemove();
	});

//	*************************************************************

//	*************************************************************
//	Main page. Buttons related.

	document.getElementById("controlNewPass").addEventListener("click", function(){
		browser.runtime.sendMessage({ Action: "setView", View: "new"});
		viewNew();
		loadNew();
	});

	document.getElementById("controlRefresh").addEventListener("click", function(){
		refresh();
	});

	document.getElementById("controlServer").addEventListener("click", function(){
		server();
	});

	document.getElementById("controlLogout").addEventListener("click", function(){
		logout();
	});

//	*************************************************************
//	New password page

	document.getElementById("npSave").addEventListener("click", function(){
		createNew();
	});

	document.getElementById("npReset").addEventListener("click", function(){
		resetNew();
	});

	document.getElementById("npBack").addEventListener("click", function(){
		browser.runtime.sendMessage({ Action: "setView", View: "main"});
		viewPasswords();
	});

	document.getElementById("npGenReset").addEventListener("click", function(){
		document.getElementById("npList").value = "!@#$%^&*()_+~[]{}:;?<>,./-=";
		localStorage.removeItem("npList");
	});

	document.getElementById("npGenerate").addEventListener("click", function(){
		useGenerator();
		localStorage.setItem("npPass", document.getElementById("npPass").value);
	});

	document.getElementById("npAddress").addEventListener("change", function(){
		addressChanged();
		localStorage.setItem("npAddress", document.getElementById("npAddress").value);
	});

	document.getElementById("npUrl").addEventListener("click", function(){
		document.getElementById("npAddress").value = localStorage.getItem("currentUrl");
		localStorage.setItem("npAddress", localStorage.getItem("currentUrl"));
		addressChanged();
	});

	document.getElementById("npWebsite").addEventListener("change", function(){
		trimValue("npWebsite");
		localStorage.setItem("npWebsite", document.getElementById("npWebsite").value);
	});

	document.getElementById("npUser").addEventListener("change", function(){
		trimValue("npUser");
		localStorage.setItem("npUser", document.getElementById("npUser").value);
	});

	document.getElementById("npPass").addEventListener("focusout", function(){
		localStorage.setItem("npPass", document.getElementById("npPass").value);
	});

	document.getElementById("npPass").addEventListener("focus", function(){
		this.select();
	});

	document.getElementById("npNotes").addEventListener("change", function(){
		localStorage.setItem("npNotes", document.getElementById("npNotes").value);
	});

	document.getElementById("npList").addEventListener("change", function(){
		localStorage.setItem("npList", document.getElementById("npList").value);
	});

	document.getElementById("npLength").addEventListener("change", function(){
		localStorage.setItem("npLength", document.getElementById("npLength").value);
	});

//	*************************************************************

});
