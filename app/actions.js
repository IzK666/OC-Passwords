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

	document.getElementById("loginSave").addEventListener("click", function(){
		login();
	});

	document.getElementById("loginCancel").addEventListener("click", function(){
		window.close();
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
		viewNew();
		loadNew();
	});

	document.getElementById("controlRefresh").addEventListener("click", function(){
		refresh();
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

	document.getElementById("npWebsite").addEventListener("change", function(){
		trimValue("npWebsite");
		localStorage.setItem("npWebsite", document.getElementById("npWebsite").value);
	});

	document.getElementById("npUrl").addEventListener("click", function(){
		document.getElementById("npAddress").value = localStorage.getItem("currentUrl");
	});

	document.getElementById("npAddress").addEventListener("change", function(){
		addressChanged();
		localStorage.setItem("npAddress", document.getElementById("npAddress").value);
	});

	document.getElementById("npAddress").addEventListener("focus", function(){
		document.getElementById("npAddressWarning").style.display = "none";
	});

	document.getElementById("npUser").addEventListener("change", function(){
		trimValue("npUser");
		localStorage.setItem("npUser", document.getElementById("npUser").value);
	});

	document.getElementById("npPass").addEventListener("change", function(){
		localStorage.setItem("npPass", document.getElementById("npPass").value);
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
