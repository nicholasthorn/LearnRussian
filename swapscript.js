var ACTIVE_DICTIONARY = {}; // contains words translated on current page
var PAGE_BLACKLISTED = false;
var RUSSIAN_WORD = "";

function maintainCaps(match, p1, p2, p3) {
	if(p2.toUpperCase() === p2) return p1 + RUSSIAN_WORD.toUpperCase() + p3;
	if(p2.charAt(0) === p2.charAt(0).toUpperCase()) return p1 + RUSSIAN_WORD.charAt(0).toUpperCase() + RUSSIAN_WORD.slice(1) + p3;
	return p1 + RUSSIAN_WORD + p3;
}

function replaceAll(text) {
	var madeChanges = false;
	for(var i=0;i<DICTIONARY.length;i++) {
		var re = new RegExp("(\\s|^)(" + DICTIONARY[i][0] + ")(\\W|$)", "gi");
		if(text.search(re) !== -1) {
			madeChanges = true;
			RUSSIAN_WORD = DICTIONARY[i][1];
			//text = text.replace(re, "$1" + DICTIONARY[i][1] + "$3");
			text = text.replace(re, maintainCaps);
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
	var startTime = Date.now();
	
	//Though this method may seem a bit ugly, it is orders of magnitude faster than jQuery shorthands like .find()
	for(var i=0;i<elements.length;i+=1) {
		var element = elements[i];
		
		for(var j=0;j<element.childNodes.length;j++) {
			if(Date.now() - startTime > 5000) { // If translating takes more than 5 seconds, abort!
				console.log("Russian Лексика Tool took more than 5 seconds to alter this page.");
				return; 
			}
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

function getTranslations(text) {
	var words = text.toLowerCase().split(/[,.!?'":;\- ()]/); // because we're searching for Cyrillic chars, can't use \W
	var newText = "";
	var hasWord = false;
	for(var i=0;i<words.length;i++) {
		if(ACTIVE_DICTIONARY.hasOwnProperty(words[i])) {
			if(hasWord) newText += "; ";
			newText += ACTIVE_DICTIONARY[words[i]][1] + ": " + ACTIVE_DICTIONARY[words[i]][0];
			hasWord = true;
		}
	}
	return hasWord ? newText : "Highlight text containing Russian words to see their translation.";
}

$().ready(checkBlacklistThen(findAndReplace));

document.addEventListener("mouseup", function(ev) {
	chrome.runtime.sendMessage({request: "updateContext", newText: getTranslations(window.getSelection().toString())});
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
		//popup
    if (request.request === "dictionary") {
			if(!PAGE_BLACKLISTED) {
				sendResponse({dictionary: ACTIVE_DICTIONARY, blacklist: false});
			}
			else {
				sendResponse({blacklist: true});
			}
		}
  });
