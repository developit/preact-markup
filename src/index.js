import { h as defaultReviver, Component } from 'preact';
import markupToVdom from './markup-to-vdom';

let customReviver;

export default class Markup extends Component {
	static setReviver(h) {
		customReviver = h;
	}

	shouldComponentUpdate({ wrap, type, markup }) {
		let p = this.props;
		return wrap!==p.wrap || type!==p.type || markup!==p.markup;
	}

	setComponents(components) {
		this.map = {};
		if (components) {
			for (let i in components) {
				if (components.hasOwnProperty(i)) {
					this.map[i.replace(/([a-zA-Z0-9]+)([A-Z])/g, '$1-$2').toLowerCase()] = components[i];
				}
			}
		}
	}

	render({ wrap=true, type, markup, components, reviver, onError, ...props }) {
		let h = reviver || this.reviver || this.constructor.prototype.reviver || customReviver || defaultReviver,
			vdom;

		this.setComponents(components);

		let options = {'allow-scripts': this.props['allow-scripts']};
		try {
			vdom = markupToVdom(markup, type, h, this.map, options);
		} catch(error) {
			if (onError) onError({ error });
		}

		if (wrap===false) return vdom && vdom[0] || null;

		let c = props.hasOwnProperty('className') ? 'className' : 'class',
			cl = props[c];
		if (!cl) props[c] = 'markup';
		else if (cl.splice) cl.splice(0, 0, 'markup');
		else if (typeof cl==='string') props[c] += ' markup';
		else if (typeof cl==='object') cl.markup = true;

		return h('div', props, vdom || null);
	}
}
