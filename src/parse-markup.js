let parserDoc;

/** Parse markup into a DOM using the given mimetype.
 *	@param {String} markup
 */
export default function parseMarkup(markup, type) {
	let doc,
		mime = type==='html' ? 'text/html' : 'application/xml',
		parserError, wrappedMarkup, tag;

	// wrap with an element so we can find it after parsing, and to support multiple root nodes
	if (type==='html') {
		tag = 'body';
		wrappedMarkup = '<!DOCTYPE html>\n<html><body>'+markup+'</body></html>';
	}
	else {
		tag = 'xml';
		wrappedMarkup = '<?xml version="1.0" encoding="UTF-8"?>\n<xml>'+markup+'</xml>';
	}

	// if available (browser support varies), using DOMPaser in HTML mode is much faster, safer and cleaner than injecting HTML into an iframe.
	try {
		doc = new DOMParser().parseFromString(wrappedMarkup, mime);
	} catch (err) {
		parserError = err;
	}

	// fall back to using an iframe to parse HTML (not applicable for XML, since DOMParser() for XML works in IE9+):
	if (!doc && type==='html') {
		doc = parserDoc || (parserDoc = buildParserFrame());
		doc.open();
		doc.write(wrappedMarkup);
		doc.close();
	}

	if (!doc) return;

	// retrieve our wrapper node
	let out = doc.getElementsByTagName(tag)[0],
		fc = out.firstChild;

	if (markup && !fc) {
		out.error = 'Document parse failed.';
	}

	// pluck out parser errors
	if (fc && String(fc.nodeName).toLowerCase()==='parsererror') {
		// remove post/preamble to get just the error message as text
		fc.removeChild(fc.firstChild);
		fc.removeChild(fc.lastChild);
		out.error = (fc.textContent || fc.nodeValue || parserError || 'Unknown error');
		// remove the error from the DOM leaving things nice and tidy
		out.removeChild(fc);
	}

	return out;
}

/** A shared frame is used for the fallback HTML parser, built on-demand. */
function buildParserFrame() {
	if (document.implementation && document.implementation.createHTMLDocument) {
		return document.implementation.createHTMLDocument('');
	}
	let frame = document.createElement('iframe');
	frame.style.cssText = 'position:absolute; left:0; top:-999em; width:1px; height:1px; overflow:hidden;';
	frame.setAttribute('sandbox', 'allow-forms');
	document.body.appendChild(frame);
	return frame.contentWindow.document;
}
