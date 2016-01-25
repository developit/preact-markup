if (!Function.prototype.bind) {
	Function.prototype.bind = function(context, ...curry) {
		return (...args) => this.call(context, ...curry, ...args);
	};
}
