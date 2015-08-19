self.on("context", function() { // when right click - get selected
	selectionText = getSelectedText(window, document);
	self.postMessage({name:"context", data:selectionText});
	return true;
});
self.on("click", function() {
	self.postMessage({name:"click", data:"https://translate.yandex.ru?text=" + selectionText.replace("&", "%26")});
});

function getSelectedText(win,doc) {
	// Adapted from a post by jscher2000 at http://forums.mozillazine.org/viewtopic.php?f=25&t=2268557
	// Is supposed to solve the issue of Firefox not getting the text of a selection when
	// it is in a textarea/input/textbox.
	var ta;
	if (win.getSelection && doc.activeElement){
		if (doc.activeElement.nodeName == 'TEXTAREA' || doc.activeElement.getAttribute("id") == 'text' ||
			(doc.activeElement.nodeName == 'INPUT' &&
			doc.activeElement.getAttribute("type").toLowerCase() == 'text')
		){
			ta = doc.activeElement;
			translate();
			return ta.value.substring(ta.selectionStart, ta.selectionEnd);
		} else {
			// As of Firefox 31.0 this appears to have changed, again.
			// Type multiple methods to cover bases with different versions of Firefox.
			let returnValue = "";
			if (typeof win.getSelection === "function"){
				returnValue = win.getSelection().toString();
				if(typeof returnValue === "string" && returnValue.length > 0) {
					return returnValue
				}
			} //else
			if (typeof doc.getSelection === "function"){
				returnValue = doc.getSelection().toString();
				if(typeof returnValue === "string" && returnValue.length > 0) {
					return returnValue
				}
			} // else
			if (typeof win.content.getSelection === "function"){
				returnValue = win.content.getSelection().toString();
				if(typeof returnValue === "string" && returnValue.length > 0) {
					return returnValue
				}
			} // else
			// It appears we did not find any selected text.
			return "";
		}
	} else {
		return doc.getSelection().toString();
	}
}