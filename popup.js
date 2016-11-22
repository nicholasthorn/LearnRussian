function setBlacklist(status, permanence) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		var url = new URL(tabs[0].url);
		
		if(status) {
			var obj = {};
			obj[url.hostname] = {blacklist: status, permanent: permanence};
			chrome.storage.sync.set(obj, function() {
				chrome.tabs.reload();
				window.close();
			});
		}
		else {
			chrome.storage.sync.remove(url.hostname, function() {
				chrome.tabs.reload();
				window.close();
			});
		}
	});
}

document.addEventListener('DOMContentLoaded', function() {
	var black_button = document.getElementById('blacklist_button');
	var white_button = document.getElementById('whitelist_button');
	var blackonce_button = document.getElementById('blackonce_button');
	
	black_button.addEventListener('click', function() {
		setBlacklist(true, true);
	});
	
	white_button.addEventListener('click', function() {
		setBlacklist(false, false);
	});
	
	blackonce_button.addEventListener('click', function() {
		setBlacklist(true, false);
	});

	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {request: "dictionary"}, function(response) {
			var screen = document.getElementById('dictionary');
			if(response == null) {
				screen.innerHTML += "Something went wrong. Try reloading the page.<br>";
				return;
			}
			
			if(response.blacklist) {
				black_button.style.display = 'none';
				blackonce_button.style.display = 'none';
				screen.innerHTML += "The extension is currently disabled here.<br>";
			}
			else {
				white_button.style.display = 'none';
				var dict = response.dictionary;
				var keys = Object.keys(dict).sort();
				for(var i=0;i<keys.length;i++) {
					screen.innerHTML += dict[keys[i]][1] + " \"" + dict[keys[i]][0] + "\"<br>";
				}
			}
		});
	});
});

