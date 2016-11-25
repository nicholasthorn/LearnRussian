var ACTIVE_DICTIONARY = {}; // contains words translated on current page
var PAGE_BLACKLISTED = false;

function replaceAll(text) {
	var madeChanges = false;
	for(var i=0;i<DICTIONARY.length;i++) {
		var re = new RegExp("(\\s|^)(" + DICTIONARY[i][0] + ")(\\W|$)", "gi");
		if(text.search(re) !== -1) {
			madeChanges = true;
			text = text.replace(re, "$1" + DICTIONARY[i][1] + "$3");
			if(ACTIVE_DICTIONARY.hasOwnProperty(DICTIONARY[i][1])) {
				var words = ACTIVE_DICTIONARY[DICTIONARY[i][1]][0].split(/, /);
				if(words.indexOf(DICTIONARY[i][0]) === -1) {
					ACTIVE_DICTIONARY[DICTIONARY[i][1]][0] += ", " + DICTIONARY[i][0];
				}
			} else {
				ACTIVE_DICTIONARY[DICTIONARY[i][1]] = DICTIONARY[i];
			}
		}
	}
	return madeChanges ? text : false;
}

function containsFormattingChars(str) {
	return (str.indexOf('{') !== -1) || (str.indexOf('<') !== -1);
}

function checkBlacklistThen(callback) {
	var url = window.location.hostname;
	chrome.storage.sync.get(url, function(results) {
		if(null != results[url]) {
			PAGE_BLACKLISTED = results[url].blacklist;
			if(!results[url].permanent) {
				chrome.storage.sync.remove(url);
			}
		}
		callback(results);
	});
}

function findAndReplace() {
	if(PAGE_BLACKLISTED) return;
	var elements = document.getElementsByTagName('*');
	var swappedCount = 0;
	
	//Though this method may seem a bit ugly, it is orders of magnitude faster than jQuery shorthands like .find()
	for(var i=0;i<elements.length;i+=1) {
		var element = elements[i];
		
		for(var j=0;j<element.childNodes.length;j++) {
			var node = element.childNodes[j];
			if(node.nodeType === 3) { // Type 3 = Text
				var text = node.nodeValue;
				if(containsFormattingChars(text)) continue;
				var newText = replaceAll(text);
				if(!!newText) {
					swappedCount += 1;
					element.replaceChild(document.createTextNode(newText), node);
				}
			}
		}
	}
}

$().ready(checkBlacklistThen(findAndReplace));

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.request === "dictionary")
			if(!PAGE_BLACKLISTED) {
				sendResponse({dictionary: ACTIVE_DICTIONARY, blacklist: false});
			}
			else {
				sendResponse({blacklist: true});
			}
  });