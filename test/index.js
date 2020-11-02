import { h, render, rerender, Component } from 'preact';
import assertJsx from 'preact-jsx-chai';
import sinonChai from 'sinon-chai';
chai.use(assertJsx);
chai.use(sinonChai);
import Markup from 'src';

/*eslint-env browser,mocha*/
/*global sinon,expect,chai*/

describe('Markup', () => {
	let scratch;

	before( () => {
		scratch = document.createElement('div');
		(document.body || document.documentElement).appendChild(scratch);
	});

	beforeEach( () => {
		scratch.innerHTML = '';
	});

	after( () => {
		scratch.parentNode.removeChild(scratch);
		scratch = null;
	});

	it('should render valid JSX', () => {
		expect(
			<Markup markup="<em>hello!</em><h1>asdflkj</h1>" />
		).to.eql(
			<div class="markup">
				<em>hello!</em>
				<h1>asdflkj</h1>
			</div>
		);
	});

	it('should render simple static markup', () => {
		let markup = `<em>hello!</em><h1>asdflkj</h1>`;
		render(<Markup markup={markup} />, scratch);
		expect(scratch.firstChild.innerHTML).to.equal(markup);
	});

	it('should render xml', () => {
		render(<Markup markup="<div><x-foo /></div>" />, scratch);
		expect(scratch.firstChild.innerHTML).to.equal('<div><x-foo></x-foo></div>');
	});

	it('should call onError for invalid XML', () => {
		let onError = sinon.spy();
		render(<Markup markup="<2-element> <2/> </a> <div>" onError={onError} />, scratch);

		expect(scratch.firstChild.innerHTML).to.equal('');

		expect(onError).to.have.been.calledOnce;
		expect(onError.firstCall.args[0])
			.to.have.property('error')
			.that.is.an('error')
			.with.property('message')
			.that.is.a('string')
			.that.matches(/(failed|invalid|parse)/i);
	});

	it('should render html', () => {
		let markup = '<div><x-foo></x-foo><img src="about:blank"></div>';
		render(<Markup markup={markup} type="html" />, scratch);
		expect(scratch.firstChild.innerHTML).to.equal(markup);
	});

	it('should mercilessly render invalid HTML as one does', () => {
		let onError = sinon.spy();
		render(<Markup markup="<2-element> <2/> </a> <div>" type="html" onError={onError} />, scratch);
		expect(onError).not.to.have.been.called;
		expect(scratch.firstChild.innerHTML).to.equal('&lt;2-element&gt; &lt;2/&gt;<div></div>');
	});

	it('should render invalid HTML to the correct JSX', () => {
		expect(
			<Markup markup="<2-element> <2/> </a> <div>" type="html" />
		).to.eql(
			<div class="markup">
				&lt;2-element&gt; &lt;2/&gt;<div />
			</div>
		);
	});

	it('should render empty attributes as empty', () => {
		render(<Markup markup={'<img alt="" src="" />'} />, scratch);
		expect(scratch.firstChild.innerHTML).to.equal('<img alt="" src="">');
	});

	it('should render mapped components from XML', () => {
		const Foo = ({ a, b, camelCasedProperty, children }) =>
			(<div class="foo" camelCasedProperty={camelCasedProperty} data-a={a} data-b={b}>{ children }</div>);

		expect(
			<Markup markup='<foo a="1" b="two" camel-cased-property="2" />' components={{ Foo }} />
		).to.eql(
			<div class="markup">
				<div class="foo" data-a="1" data-b="two" camelCasedProperty="2"/>
			</div>
		);

		let markup = `<FOO a="1" b="2"><em>italic</em><strong>bold</strong></FOO>`;
		expect(
			<Markup markup={markup} components={{ Foo }} />
		).to.eql(
			<div class="markup">
				<div class="foo" data-a="1" data-b="2">
					<em>italic</em>
					<strong>bold</strong>
				</div>
			</div>
		);
	});

	it('should correctly map XML properties', () => {
		const Foo = ({camelCasedProperty, children}) =>
			(<div class="foo" camelCasedProperty={camelCasedProperty}>{ children }</div>);

		expect(
			<Markup markup='<foo camelCasedProperty="2" />' components={{ Foo }}/>
		).to.eql(
			<div class="markup">
				<div class="foo" camelCasedProperty="2"/>
			</div>
		);
		expect(
			<Markup markup='<foo camel-cased-property="2" />' components={{ Foo }}/>
		).to.eql(
			<div class="markup">
				<div class="foo" camelCasedProperty="2"/>
			</div>
		);

		expect(
			<Markup markup='<foo camel-cased-property="2"><div data-foo="foo"></div></foo>' components={{ Foo }}/>
		).to.eql(
			<div class="markup">
				<div class="foo" camelCasedProperty="2">
					<div data-foo="foo"></div>
				</div>
			</div>
		);
	});

	it('should correctly map HTML properties', () => {
		const Foo = ({camelCasedProperty, children}) =>
			(<div class="foo" camelCasedProperty={camelCasedProperty}>{ children }</div>);

		//Notice that camelCasedProperty is gone in the output cause it's mapped in `prop.camelcasedproperty`
		// and Foo isn't aware of it
		expect(
			<Markup type="html" markup='<foo camelCasedProperty="2" />' components={{ Foo }}/>
		).to.eql(
			<div class="markup">
				<div class="foo"/>
			</div>
		);

		expect(
			<Markup type="html" markup='<foo camel-cased-property="2" />' components={{ Foo }}/>
		).to.eql(
			<div class="markup">
				<div class="foo" camelCasedProperty="2"/>
			</div>
		);

		expect(
			<Markup type="html" markup='<foo camel-cased-property="2"><div data-foo="foo"></div></foo>' components={{ Foo }}/>
		).to.eql(
			<div class="markup">
				<div class="foo" camelCasedProperty="2">
					<div data-foo="foo"></div>
				</div>
			</div>
		);

	});

	it('should render mapped components from HTML', () => {
		const XFoo = ({ p, camelCasedProperty, children }) =>
			(<div class="x-foo" camelCasedProperty={camelCasedProperty} asdf={p}>hello { children }</div>);

		expect(
			<Markup type="html" markup='<x-foo p="1" camel-cased-property="2"/>' components={{ XFoo }} />
		).to.eql(
			<div class="markup">
				<div class="x-foo" asdf="1" camelCasedProperty="2">hello </div>
			</div>
		);

		let markup = `<x-foo p="2"><em>italic</em><strong>bold</strong></x-foo>`;
		expect(
			<Markup markup={markup} components={{ XFoo }} />
		).to.eql(
			<div class="markup">
				<div class="x-foo" asdf="2">
					hello{' '}
					<em>italic</em>
					<strong>bold</strong>
				</div>
			</div>
		);
	});

	describe('allow-scripts option', () => {
		before( () => {
			window.stub = sinon.stub();
		});

		beforeEach( () => {
			window.stub.reset();
		});

		after( () => {
			delete window.stub;
		});

		it('should ignore script tags by default', () => {
			let markup = `<em>hello!</em><h1>asdflkj</h1><script type="text/javascript">window.stub();</script>`;
			render(<Markup markup={markup} />, scratch);

			markup = `<em>hello!</em><h1>asdflkj</h1><script>window.stub();</script>`;
			render(<Markup markup={markup} />, scratch);

			expect(window.stub).not.to.have.been.called;
		});

		it('should allow script tags if allow-scripts is enabled', () => {
			let markup = `<em>hello!</em><h1>asdflkj</h1><script type="text/javascript">window.stub();</script>`;
			render(<Markup markup={markup} allow-scripts />, scratch);
			expect(window.stub).to.have.been.calledOnce;
		});
	});

	describe('allow-events option', () => {
		beforeEach(() => {
			window.stub = sinon.stub();
			scratch = document.createElement('div');
			(document.body || document.documentElement).appendChild(scratch);
		});

		afterEach(() => {
			delete window.stub;
		});

		it('should correctly proxy on* handlers defined as strings', () => {
			let markup = `<div onClick="stub(arguments[0]);">Hello world</div>`;
			render(<Markup markup={markup} wrap={false} allow-events />, scratch);
			let element = scratch.childNodes[0];
			let ev = document.createEvent("MouseEvent");
			ev.initMouseEvent("click");
			expect(window.stub.called,"stub should not be called before click handler").to.equal(false);
			element.dispatchEvent(ev);
			expect(window.stub.called,"stub should be called from click handler").to.equal(true);
			expect(window.stub, "click handler should be supplied event as argument").to.have.been.calledWithExactly(ev);
		});

		it('should NOT proxy on* handlers if allow-events is not enabled', (done) => {
			let markup = `<div onClick="stub(arguments[0]);">Hello world</div>`;
			let error = null;
			render(<Markup markup={markup} wrap={false} />, scratch);
			let element = scratch.childNodes[0];
			let ev = document.createEvent("MouseEvent");
			ev.initMouseEvent("click");
			// Errors thrown by dispatchEvent are always uncaught exceptions
			window.onerror = (e) => {
				expect(window.stub.called,"stub should NOT be called from click handler").to.equal(false);
				done();
			};
			element.dispatchEvent(ev);
		});
	});

	it('should pipe parse errors to console', () => {
		sinon.stub(console, 'error');

		let invalidXml = `<h1>Test with & symbol</h1>`;

		render(<Markup markup={invalidXml} />, scratch);

		expect(console.error)
			.to.have.been.calledOnce
			.and.calledWithMatch('preact-markup: Error: error on line 2 at column 21: xmlParseEntityRef: no name');

		console.error.restore();
	});

	it('should trim whitespace by default', () => {
		expect(
			<Markup markup="<div> <em> hello! </em>   <h1>	asdflkj	</h1> </div>" />
		).to.eql(
			<div class="markup">
				<div>
					<em>hello!</em>
					{' '}
					<h1>asdflkj</h1>
				</div>
			</div>
		);

		expect(
			<Markup markup="<span> </span>" />
		).to.eql(
			<div class="markup">
				<span>{' '}</span>
			</div>
		);
	});

	it('should trim all whitespace for trim="all"', () => {
		expect(
			<Markup trim="all" markup="<em> hello! </em>   <h1>	asdflkj	</h1>" />
		).to.eql(
			<div class="markup">
				<em>hello!</em>
				<h1>asdflkj</h1>
			</div>
		);

		expect(
			<Markup trim="all" markup="<span> </span>" />
		).to.eql(
			<div class="markup">
				<span />
			</div>
		);
	});
});
