// deeply convert an XML DOM to VDOM
export default function toVdom(node, visitor, h) {
	walk.visitor = visitor;
	walk.h = h;
	return walk(node);
}

function walk(n) {
	if (n.nodeType===3) return 'textContent' in n ? n.textContent : n.nodeValue;
	if (n.nodeType!==1) return null;
	let out = walk.h(
		String(n.nodeName).toLowerCase(),
		getProps(n.attributes),
		walkChildren(n.childNodes)
	);
	if (walk.visitor) walk.visitor(out);
	return out;
}

function getProps(attrs) {
	let len = attrs && attrs.length;
	if (!len) return null;
	let props = {};
	for (let i=0; i<len; i++) {
		let { name, value } = attrs[i];
		if (value==='') value = true;
		props[name] = value;
	}
	return props;
}

function walkChildren(children) {
	let c = children && Array.prototype.map.call(children, walk).filter(exists);
	return c && c.length ? c : null;
}

let exists = x => x;
