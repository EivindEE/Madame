describe("SemTag", function() {
	var semTag;


	beforeEach(function() {
		semTag = semtag("content", "tag");
	});	
	it("should fail", function () {
		expect(true).toBe(false);
	});
	
	it("should construct with no less than two arguments", function() {
		expect(function () {semtag()}).toThrow({name : "MissingArgumentsException", message : "Function requires both a valid text and trigger argument"});
		expect(function () {semtag("content")}).toThrow({name : "MissingArgumentsException", message : "Function requires both a valid text and trigger argument"});
		expect(function () {semtag("content", "tag")}).not.toThrow({name : "MissingArgumentsException", message : "Function requires both a valid text and trigger argument"});
	});
	
	describe("it should check if a node is the descendant of another node or if the nodes are equal", function () {
		var body,
			ancestor,
			child,
			descendant,
			textDescendant,
			notDescendant;
			console.log(body);
		beforeEach(function() {
			body = document.body;
			ancestor = document.createElement("div");
			child = document.createElement("div");
			descendant = document.createElement("div");
			textDescendant = document.createTextNode("TextContent");
			child.appendChild(descendant);
			child.appendChild(textDescendant);
			ancestor.appendChild(child);
			notDescendant = document.createElement("div");
			body.appendChild(ancestor);
			body.appendChild(notDescendant);
		});
		
		afterEach(function() {
			body.removeChild(ancestor);
			body.removeChild(notDescendant);
		});
		
		it("should return true if the nodes are the same", function (){
			expect(semTag.ancestorOrSelf(ancestor, ancestor)).toBe(true);
		});
		
		it("should return false if the node is not a descendant", function (){
			expect(semTag.ancestorOrSelf(ancestor, notDescendant)).toBe(false);
		});
		
		it("should return true if the node is a child", function (){
			expect(semTag.ancestorOrSelf(ancestor, child)).toBe(true);
		});
		
		it("should return true if the node is a descendant", function (){
			expect(semTag.ancestorOrSelf(ancestor, descendant)).toBe(true);
		});
		
		it("should return true if a text node is a descendant", function (){
			expect(semTag.ancestorOrSelf(ancestor, textDescendant)).toBe(true);
		});
	});
});