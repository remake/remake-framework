/**
 * @param {!String} htmlString A String with HTML inside of it
 * @returns {!Element} Returns converted string to HTML
 * @desc Creates a HTML element by string with HTML
 */
HTMLDocument.prototype.createElementByHTMLString = function(htmlString) {
	let orphanParent = this.createElement("div")
	orphanParent.innerHTML = htmlString.trim()
	return orphanParent.children[0]
}

// Keep for maybe future use
/**
 * @param {!HTMLElement} parent The element with children where the `childsID` has to be found in
 * @param {!String} childsID The id name of the child element you're looking for
 * @returns {?HTMLElement} Returns child HTMLElement when found and null when it hasn't been found
 * @desc Finds a child of parent HTMLElement by ID
 */
function findTheChildByID(parent, childsID) {
	for (let i = 0; i < parent.children.length; i++) {
		const child = parent.children[i];
		if (child.id == childsID) return child
	}
	return null
}

/**
 * @param {!String} msg Message to display in the console
 * @param {?String} [logLevel="log"] The log level the message should be displayed at.
 * Valid log levels are:
 * - info
 * - log
 * - warn
 * - debug
 * - error
 * @param {*} dirVar (Optional) An object that has to be printed with console.dir()
 * @desc One function to log stuff to console on different levels and able to print variables via console.dir all in one line!
 */
function log(msg, logLevel = "log", dirVar) {
	if (logLevel == null) logLevel = "log"
	console[logLevel](msg)
	if (dirVar != null) console.dir(dirVar)
}

/**
 * The whole parse stuff and covert it into code Framework
 */
class parse2TestFramework {
	/**
	 * @throws {Error} When the argument `(testcode)` has been found but no test code has been passed via options
	 * @param {!String} selfTestArgumentsValue The string value of the HTML attribute 'selfTest-arguments'
	 * @param {?Object} [options={}] Values that need special filling. (IE: 'testcode')
	 * @returns {!Array} Returns array with replaced arguments
	 * @desc Replaces all special arguments with their corresponding value.
	 */
	static createTestFunctionArguments(selfTestArgumentsValue, options = {}) {
		let correctArgs = []
		let arrArgs = selfTestArgumentsValue.split(",")
		for (let i = 0; i < arrArgs.length; i++) {
			const argument = arrArgs[i];
			if (argument == "(testcode)") {
				if (options.testCodeElement != null) {
					correctArgs.push(options.testCodeElement)
				} else {
					throw new Error("(testcode) has been found as argument but no test code has been provided in the options")
				}
			} else {
				correctArgs.push(argument)
			}
		}
		return correctArgs
	}
	/**
	 * @generator
	 * @param {!String} parentID ID of the parent element that contains all the tests
	 * @throws {Error} `parentID` must be a valid HTML id
	 * @summary Converts all xmp innerText's to tests, executes these tests and renders a response on the page
	 * @desc Converts all xmp innerText's to tests, executes these tests and renders a response on the page
	 * MAKE SURE THAT THE PARENT ELEMENT HAVE THE FOLLOWING ATTRIBUTES AND ARE FILLED:
	 * - 'selfTest-test="functionYouWantToExecute()"'
	 * - 'selfTest-arguments="firstArgument,secondArgument,thirdArgument,etc"'
	 * *Argument can also be:*
	 * - '(testcode)' - *Without quotes* This will pass the test code to the set function
	 */
	static convertElementsToTest(parentID) {
		// Get the element that contains all tests
		let parent = document.getElementById(parentID)
		// Throw an error is no parent is found
		if (parent == null) throw new Error(`Couldn't find any element with the id '${parentID}'`)
		// Getting the test function's name if the 'selfTest-test' is set
		let testFunc = (parent.attributes['selfTest-test'] != null && parent.attributes['selfTest-test'].value != null) ? parent.attributes['selfTest-test'].value : null;
		// Preparing to store the test codes
		let testCodes = []
		// Find all the tests by looping through the children of the parent
		log(`[${testFunc}] Getting all the tests...`, "info")
		for (let i = 0; i < parent.children.length; i++) {
			const child = parent.children[i];
			log(`[${testFunc}] Checking the following child: `, "debug", child)
			// If child has a xmp tag and has html inside of it continue
			if (child.localName == "xmp" && child.innerHTML.length > 0) {
				// Save the inner HTML of the xmp tag for later use
				testCodes.push(child.innerHTML.trim())
			}
		}
		log(`[${testFunc}] Found the following tests: `, "log", testCodes)
		// Clearing the parent div for new generate code
		parent.innerHTML = ""
		// Creating headers for the preview and result boxes (which will come soon)
		let headerDiv = document.createElement("div")
		headerDiv.className = "headerTest leaveSomeRoomForJesus"
		headerDiv.style.display = "flex"
		headerDiv.style.textAlign = "center"
		let previewH4 = document.createElement("h4")
		previewH4.innerText = "Preview code"
		let resultsH4 = document.createElement("h4")
		resultsH4.innerText = "Result"
		// Add the heading tags to the header div and the header div to the parent element
		headerDiv.append(previewH4)
		headerDiv.append(resultsH4)
		parent.append(headerDiv)
		// Start going through all test codes, make output containers, convert special arguments (if needed) and test the function
		log(`[${testFunc}] Going through all the test codes...`, "info")
		for (let i = 0; i < testCodes.length; i++) {
			const testCode = testCodes[i];
			log(`[${testFunc}] Current working on test code: `, "debug", testCode)
			// Creating new/output container
			let outputContainer = document.createElement("div")
			outputContainer.id = "outputContainer"
			outputContainer.style.display = "flex"
			// (Re-)Creating the preview HTML element
			let previewHTML = document.createElement("xmp")
			previewHTML.innerHTML = testCode
			// Creating the result box
			let resultBox = document.createElement("xmp")
			// Set temporary data (or in case no test has been set)
			resultBox.innerText = "No Test has been given."
			let passing = {
				msg: "No Test has been given.",
				color: "black" // BuT YoU shOULd uSe hExadecimaL INSTeaD of tHE nAmE Of tHE cOLoR - Spongebob Mocking Meme
			}
			// Check if a test has been set on the parent element
			if (testFunc != null) {
				// Check if the function that needs to be tested actually exists
				if (window[testFunc] != null) {
					// Try to setup arguments to pass to the function
					try {
						let args = []
						// Check if arguments are needed to be passed to the function
						if (parent.attributes['selfTest-arguments'] != null && parent.attributes['selfTest-arguments'].value != null) {
							// Convert any special arguments to their correct value
							// Also supply certain special argument values (when necessary)
							log(`[${testFunc}] Creating arguments for test code`, "debug")
							args = parse2TestFramework.createTestFunctionArguments(parent.attributes['selfTest-arguments'].value, {testCodeElement: document.createElementByHTMLString(testCode)})
							log(`[${testFunc}] Arguments created for test code`, "debug", args)
						}
						try {
							// Running the actual test and stringifying the results for the front-end
							log(`[${testFunc}] Running test with test code`, "debug")
							let results = window[testFunc](...args)
							log(`[${testFunc}] Got the results: `, "debug", results)
							resultBox.innerText = JSON.stringify(results)
							// Setting passing message and color
							passing.msg = "Test PASSED!"
							passing.color = "green" // BuT YoU shOULd uSe hExadecimaL INSTeaD of tHE nAmE Of tHE cOLoR - Spongebob Mocking Meme
						} catch (e) {
							// If an error happens while testing the function, stringify the error stack and print to console as well
							log(`[${testFunc}] ${e.stack}`, "warn")
							resultBox.innerText = JSON.stringify(e.stack)
							// Setting passing message and color
							passing.msg = "Error occurred while running the test. <See Result>"
							passing.color = "red" // BuT YoU shOULd uSe hExadecimaL INSTeaD of tHE nAmE Of tHE cOLoR - Spongebob Mocking Meme
						}
					} catch (e) {
						// If an error happens while creating arguments, stringify the error stack and print to console as well
						log(`[${testFunc}] ${e.stack}`, "error")
						resultBox.innerText = JSON.stringify(e.stack)
						console.error(e.stack)
						// Setting passing message and color
						passing.msg = "Error occurred while creating arguments. This is probably not your fault but the Remake developer's. <See Result>"
						passing.color = "red" // BuT YoU shOULd uSe hExadecimaL INSTeaD of tHE nAmE Of tHE cOLoR - Spongebob Mocking Meme
					}
				}
			}
			// Create the passing element
			let passingElem = document.createElement("p")
			passingElem.className = "testPassMsg leaveSomeRoomForJesus"
			// Set the passing message from earlier
			passingElem.innerText = passing.msg
			// Set the passing color from earlier
			passingElem.style.color = passing.color
			// Add the preview HTML box to the output container
			outputContainer.append(previewHTML)
			// Add the result box to the output container
			outputContainer.append(resultBox)
			// Add the output container to the parent
			parent.append(outputContainer)
			// Add the passing element to the parent
			parent.append(passingElem)
		}
		log(`[${testFunc}] Job's done!`, "info")
	}
}

/**
 * @desc Short little test to see if this file got imported correctly
 */
function selfTest_selfTest() {
	console.log("What are you trying to do? Of course I work, duh!")
}

// When the page is loaded run the tests!
window.onload = function() {
	parse2TestFramework.convertElementsToTest("parse2TestDiv")
}