import { h as defaultReviver, Component } from 'preact';
import markupToVdom from './markup-to-vdom';

let customReviver;

export default class Markup extends Component {
	static setReviver(h) {
		customReviver = h;
	}

	shouldComponentUpdate({ markup, type }) {
		return markup!==this.props.markup || type!==this.props.type;
	}

	componentWillReceiveProps({ components }) {
		this.map = {};
		if (components) {
			for (let i in components) {
				if (components.hasOwnProperty(i)) {
					this.map[i.replace(/([a-zA-Z0-9]+)([A-Z])/g, '$1-$2').toLowerCase()] = components[i];
				}
			}
		}
	}

	render({ type, markup, components, reviver, onError, ...props }) {
		let h = reviver || this.reviver || this.constructor.prototype.reviver || customReviver || defaultReviver,
			vdom;

		try {
			vdom = markupToVdom(markup, type, h, this.map);
		} catch(error) {
			if (onError) onError({ error });
		}

		return <div class="markup" {...props}>{ vdom || null }</div>;
	}
}
