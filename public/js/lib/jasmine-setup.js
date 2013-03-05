var jasmineEnv = jasmine.getEnv();
jasmineEnv.updateInterval = 1000;

var trivialReporter = new jasmine.TrivialReporter();
var console_reporter = new jasmine.ConsoleReporter();

jasmineEnv.addReporter(trivialReporter);
jasmineEnv.addReporter(console_reporter);
jasmineEnv.specFilter = function(spec) {
	return trivialReporter.specFilter(spec);
};

var currentWindowOnload = window.onload;

window.onload = function() {
	if (currentWindowOnload) {
		currentWindowOnload();
	}
	execJasmine();
};

function execJasmine() {
	jasmineEnv.execute();
}