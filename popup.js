document.addEventListener('DOMContentLoaded', function() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {request: "dictionary"}, function(response) {
			var screen = document.getElementById('dictionary');
			if(response == null) {
				screen.innerHTML += "Something went wrong. Try reloading the page.<br>";
				return;
			}
			var dict = response.dictionary;
			var keys = Object.keys(dict).sort();
			for(var i=0;i<keys.length;i++) {
				screen.innerHTML += dict[keys[i]][1] + " \"" + dict[keys[i]][0] + "\"<br>";
			}
		});
	});
});