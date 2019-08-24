document.addEventListener('DOMContentLoaded', function() {
	load();

	document.getElementById("loginForm").addEventListener("keyup", function(e){
		var keyCode = e.keyCode;
		if (keyCode == 13){ // Key Enter
			save();
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
		save();
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
		create();
	});

	document.getElementById("npBack").addEventListener("click", function(){
		viewPasswords();
	});

	document.getElementById("npReset").addEventListener("click", function(){
		document.getElementById("npList").value = "!@#$%^&*()_+~[]{}:;?<>,./-=";
	});

	document.getElementById("npGenerate").addEventListener("click", function(){
		useGenerator();
	});

	document.getElementById("npWebsite").addEventListener("change", function(){
		trimValue("npWebsite");
	});

	document.getElementById("npAddress").addEventListener("change", function(){
		addressChanged();
	});

	document.getElementById("npAddress").addEventListener("focus", function(){
		document.getElementById("npAddressWarning").style.display = "none";
	});

	document.getElementById("npUser").addEventListener("change", function(){
		trimValue("npUser");
	});

//	*************************************************************

});
