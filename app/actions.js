document.addEventListener('DOMContentLoaded', function() {
	load();

	document.getElementById("form").addEventListener("keyup", function(e){
		var keyCode = e.keyCode;
		if (keyCode == 13){ // Key Enter
			save();
		} else if (keyCode == 27){ // Key escape
			window.close();
		}
	});

	document.getElementById("inputSearch").addEventListener("keyup", function(e){
		var keyCode = e.keyCode;
		if (keyCode == 27){ // Key Escape. Not working in Firefox.
			if (document.getElementById("inputSearch").value == "")
				window.close();
			else
				searchRemove();
		}
	});

	document.getElementById("save").addEventListener("click", function(){
		save();
	});

	document.getElementById("cancel").addEventListener("click", function(){
		window.close();
	});

/*	document.getElementById("buttonIcon").addEventListener("click", function(){
		seticon();
	});*/

	document.getElementById("buttonSettings").addEventListener("click", function(){
		viewSettings();
	});

	document.getElementById("buttonRefresh").addEventListener("click", function(){
		refresh();
		window.close();
	});

	document.getElementById("cancelSearch").addEventListener("click", function(){
		searchRemove();
	});

	document.getElementById("host").addEventListener("change", function(){
			hostChanged();
	});

	document.getElementById("inputSearch").addEventListener("input", function(){
			searchChanged();
	});

});
