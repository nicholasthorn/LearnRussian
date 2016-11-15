var ACTIVE_DICTIONARY = {}; // contains words translated on current page

function replaceAll(text) {
	var madeChanges = false;
	for(var i=0;i<DICTIONARY.length;i++) {
		var re = new RegExp("(\\s|^)(" + DICTIONARY[i][0] + ")(\\W|$)", "gi");
		if(text.search(re) !== -1) {
			madeChanges = true;
			text = text.replace(re, "$1" + DICTIONARY[i][1] + "$3");
			ACTIVE_DICTIONARY[DICTIONARY[i][1]] = DICTIONARY[i];
		}
	}
	return madeChanges ? text : false;
}

function containsFormattingChars(str) {
	return (str.indexOf('{') !== -1) || (str.indexOf('<') !== -1);
}

function findAndReplace() {
	var elements = document.getElementsByTagName('*');
	var swappedCount = 0;
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

$().ready(findAndReplace);

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.request == "dictionary")
      sendResponse({dictionary: ACTIVE_DICTIONARY});
  });