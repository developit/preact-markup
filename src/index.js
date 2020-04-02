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
				// eslint-disable-next-line no-prototype-builtins
				if (components.hasOwnProperty(i)) {
					let name = i.replace(/([A-Z]+)([A-Z][a-z0-9])|([a-z0-9]+)([A-Z])/g, '$1$3-$2$4').toLowerCase();
					this.map[name] = components[i];
				}
			}
		}
	}

	render({ as = 'div', markupClass = 'markup', wrap=true, type, markup, components, reviver, onError, 'allow-scripts':allowScripts, 'allow-events':allowEvents, trim, ...props }) {
		let h = reviver || this.reviver || this.constructor.prototype.reviver || customReviver || defaultReviver,
			vdom;

		this.setComponents(components);

		let options = {
			allowScripts,
			allowEvents,
			trim
		};

		try {
			vdom = markupToVdom(markup, type, h, this.map, options);
		} catch (error) {
			if (onError) {
				onError({ error });
			}
			else if (typeof console!=='undefined' && console.error) {
				console.error(`preact-markup: ${error}`);
			}
		}

		if (wrap===false) return vdom && vdom[0] || null;

		// eslint-disable-next-line no-prototype-builtins
		let c = props.hasOwnProperty('className') ? 'className' : 'class',
			cl = props[c];
		if (markupClass) {
			if (!cl) props[c] = markupClass;
			else if (cl.splice) cl.splice(0, 0, markupClass);
			else if (typeof cl==='string') props[c] += ` ${markupClass}`;
			else if (typeof cl==='object') cl.markup = true;
		}

		return h(as, props, vdom || null);
	}
}
