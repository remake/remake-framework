/**
 * **WHAT DOES THIS SCRIPT DO? (in 10 simple steps)**
 * 1. Once the HTMLElement with the id *runTests* (by default the button saying *Run all tests with class "selftest"*) is clicked it starts running the onclick function.
 * 2. The onclick function then hides the button and starts running *selfTestFramework.convertAllTestsByClassName*
 * 	- Which converts all the HTMLElements with the class *selftest* to tests
 * 3. The function (*selfTestFramework.convertAllTestsByClassName*) will go through all the HTMLElements with the class *selftest* and will call *selfTestFramework.convertElementsToTest*
 * 	- Which will convert the individual HTMLElements to tests
 * 4. The function (*selfTestFramework.convertElementsToTest*) will get the function it has to test from the *data-selftest-test* attribute
 * 5. Then it will extract the inner html code out of the *xmp* (tags) childs
 * 6. Afterwards it will clear the parent's inner html to be prepared for displaying result data
 * 7. And at last the function (*selfTestFramework.convertElementsToTest*) runs *selfTestFramework.createTestsFromArray* to go through all of the individual test codes (the inner *xmp* tag content)
 * 8. ...to generate arguments for the test function,
 * 9. ...execute the function
 * 10. And getting and displaying the results
 */


/**
 * @param {!String} htmlString A String that contains HTML
 * @returns {!Element} Returns converted string to HTML
 * @desc Creates an HTMLElement by string including HTML
 */
function createElementByHTMLString(htmlString) {
	let orphanParent = document.createElement("div")
	orphanParent.innerHTML = htmlString.trim()
	return orphanParent.children[0]
}

// Keep for (maybe) future use
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
 * The whole parse stuff and covert it into code Framework (aka The Self Test Framework)
 */
class selfTestFramework {
	/**
	 * @generator
	 * @throws {Error} When the argument `(test-xmp-element)` has been found but no `testCodeElement` has been passed via options
	 * @param {!String} selfTestArgumentsValue The string value of the HTML attribute 'data-selftest-arguments'
	 * @param {?Object} [options={}] Values that need special filling. (IE: 'testCodeElement')
	 * *Valid options are:*
	 * - testCodeElement | The HTML code converted into an HTMLElement that was originally in the inner XMP tag in the parent self test element
	 * @returns {!Array} Returns array with replaced arguments
	 * @summery Replaces all special arguments with their corresponding value.
	 * @desc Replaces all special arguments with their corresponding value.
	 * *Special arguments are:*
	 * - (test-xmp-element) | Replaces that argument with the code within the xmp tag
	 */
	static createTestFunctionArguments(selfTestArgumentsValue, options = {}) {
		// Prepare/Initiate the return array
		let correctArgs = []
		// Split the given arguments from a string to an array
		let arrArgs = selfTestArgumentsValue.split(",")
		// Go through all the given arguments
		for (let i = 0; i < arrArgs.length; i++) {
			const argument = arrArgs[i];
			// If the current argument is the special argument (test-xmp-element)
			if (argument == "(test-xmp-element)") {
				// Check if the HTMLElement that has to be passed to the function is available in options
				if (options.testCodeElement != null) {
					// Push the HTMLElement to the return arguments array
					correctArgs.push(options.testCodeElement)
				} else {
					// Throw an error since the argument is specified but no HTMLElement is available from the 'options' object
					throw new Error("(test-xmp-element) has been found as argument but no test code has been provided in the options")
				}
			// If the current argument is not a special argument then just add it to the return arguments array
			} else {
				correctArgs.push(argument)
			}
		}
		// And finally return the newly generated arguments array
		return correctArgs
	}

	/**
	 * @param {!String} className Name of the class where the selftests are located in the html file
	 * @desc Gets all the tests that have to be performed (aka an alias for `document.getElementsByClassName()`)
	 */
	static getSelfTestElements(className = "selftest") {
		return document.getElementsByClassName(className)
	}

	/**
	 * @private
	 * @param {!HTMLElement} htmlElement The parent self test HTML element
	 * @param {!String} testFunc The name of the test function
	 * @throws {Error} `htmlElement` must be a valid HTMLElement
	 * @desc Gets html code out of inner XMP tag of parent (self test HTML element)
	 */
	static getTestCodes(htmlElement, testFunc) {
		// Throw an error is no htmlElement is set
		if (htmlElement == null) throw new Error(`Given HTMLElement is invalid or is not set.`)
		let testCodes = []
		// Find all the tests by looping through the children of the parent
		log(`[${testFunc}] Getting all the tests...`, "info")
		for (let i = 0; i < htmlElement.children.length; i++) {
			const child = htmlElement.children[i];
			log(`[${testFunc}] Checking the following child: `, "debug", child)
			// If child has a xmp tag and has html inside of it continue
			if (child.localName == "xmp" && child.innerHTML.length > 0) {
				// Save the inner HTML of the xmp tag for later use
				testCodes.push(child.innerHTML.trim())
			}
		}
		return testCodes
	}

	/**
	 * @private
	 * @param {!HTMLElement} htmlElement The parent self test HTML element
	 * @throws {Error} `htmlElement` must be a valid HTMLElement
	 * @desc Initiates the front end to display results of the given tests
	 */
	static initiateSelfTestFrontEnd(htmlElement) {
		// Throw an error is no htmlElement is set
		if (htmlElement == null) throw new Error(`Given HTMLElement is invalid or is not set.`)
		// Clearing the parent div for new generate code
		htmlElement.innerHTML = ""
		// Creating headers for the preview and result boxes (which will come soon)
		let headerDiv = document.createElement("div")
		headerDiv.classList.add("header-tests", "leave-some-room-for-jesus")
		headerDiv.style.display = "flex"
		headerDiv.style.textAlign = "center"
		let previewH4 = document.createElement("h4")
		previewH4.innerText = "Preview code"
		let resultsH4 = document.createElement("h4")
		resultsH4.innerText = "Result"
		// Add the heading tags to the header div and the header div to the parent element
		headerDiv.append(previewH4)
		headerDiv.append(resultsH4)
		htmlElement.append(headerDiv)
	}

	/**
	 * @private
	 * @param {!HTMLElement} htmlElement The parent self test HTML element
	 * @param {!String} testFunc The name of the test function
	 * @param {!Object} options An object with options for `createTestFunctionArguments()`
	 * @see selfTestFramework.createTestFunctionArguments
	 * @desc Initiates the front end to display results of the given tests
	 */
	static argumentGenerator(htmlElement, testFunc, options) {
		let args = []
		// Check if arguments are needed to be passed to the function
		if (htmlElement.getAttribute('data-selftest-arguments') != null) {
			// Convert any special arguments to their correct value
			// Also supply certain special argument values (when necessary)
			log(`[${testFunc}] Creating arguments for test code`, "debug")
			args = selfTestFramework.createTestFunctionArguments(htmlElement.getAttribute('data-selftest-arguments'), options)
			log(`[${testFunc}] Arguments created for test code`, "debug", args)
		} else {
		}
		return args
	}

	/**
	 * @private
	 * @param {!HTMLElement} htmlElement The parent self test HTML element
	 * @param {!String} testFunc The name of the test function
	 * @param {!Array} testCodes Array with test html strings
	 * @see selfTestFramework.argumentGenerator
	 * @desc Initiates the front end to display results of the given tests
	 */
	static createTestsFromArray(htmlElement, testFunc, testCodes) {
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

						// Get arguments from HTML parent attribute (if any)
						let args = selfTestFramework.argumentGenerator(htmlElement, testFunc, {testCodeElement: createElementByHTMLString(testCode)})

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
			passingElem.classList.add("test-pass-message", "leave-some-room-for-jesus")
			// Set the passing message from earlier
			passingElem.innerText = passing.msg
			// Set the passing color from earlier
			passingElem.style.color = passing.color
			// Add the preview HTML box to the output container
			outputContainer.append(previewHTML)
			// Add the result box to the output container
			outputContainer.append(resultBox)
			// Add the output container to the parent
			htmlElement.append(outputContainer)
			// Add the passing element to the parent
			htmlElement.append(passingElem)
		}
	}

	/**
	 * @generator
	 * @param {!HTMLElement} htmlElement The selftest parent HTML element
	 * @throws {Error} `htmlElement` must be a valid HTMLElement
	 * @summary Converts all xmp innerText's to tests, executes these tests and renders a response on the page
	 * @see selfTestFramework.getTestCodes
	 * @see selfTestFramework.initiateSelfTestFrontEnd
	 * @see selfTestFramework.createTestsFromArray
	 * @desc Converts all xmp innerText's to tests, executes these tests and renders a response on the page
	 * MAKE SURE THAT THE PARENT ELEMENT HAVE THE FOLLOWING ATTRIBUTES AND ARE FILLED:
	 * - 'data-selftest-test="functionYouWantToExecute"' | (Optional) defaults to *getDataFromRootNode*
	 * - 'data-selftest-arguments="firstArgument,secondArgument,thirdArgument,etc"'
	 * *Argument can also be:*
	 * - '(test-xmp-element)' - *Without quotes* This will pass the inner xmp code to the function
	 */
	static convertElementsToTest(htmlElement) {
		// Throw an error is no htmlElement is set
		if (htmlElement == null) throw new Error(`Given HTMLElement is invalid or is not set.`)
		// Getting the test function's name if the 'data-selftest-test' is set, defaults to the getDataFromRootNode() function
		let testFunc = (htmlElement.getAttribute('data-selftest-test') != null) ? htmlElement.getAttribute('data-selftest-test') : "getDataFromRootNode";
		
		// Fetch testCodes
		let testCodes = selfTestFramework.getTestCodes(htmlElement, testFunc)
		log(`[${testFunc}] Found the following tests: `, "log", testCodes)

		// Initiate front end html
		selfTestFramework.initiateSelfTestFrontEnd(htmlElement)

		// Start going through all test codes, make output containers, convert special arguments (if needed) and test the function
		selfTestFramework.createTestsFromArray(htmlElement, testFunc, testCodes)
		
		// Finished! Results are displayed on page.
		log(`[${testFunc}] Job's done!`, "info")
	}

	/**
	 * @param {!String} className Name of the class where the selftests are located in the html file
	 * @see selfTestFramework.getSelfTestElements
	 * @see selfTestFramework.convertElementsToTest
	 * @desc Loops through all the HTML elements with the same class name to convert them to tests and displaying it on the front end
	 */
	static convertAllTestsByClassName(className = "selftest") {
		// Gets all test parents by class name
		let allTestParents = selfTestFramework.getSelfTestElements(className)
		// Loops through all the test parents
		for (let i = 0; i < allTestParents.length; i++) {
			const testParent = allTestParents[i];
			log(`Preparing test for following HTML element: `, "debug", testParent)
			// Converting current test parent to a test
			selfTestFramework.convertElementsToTest(testParent)
		}
		// Done!
		log("All tests have been converted!", "info")
	}
}

/**
 * @desc Short little test to see if this file got imported correctly
 */
function selfTest_selfTest() {
	console.log("What are you trying to do? Of course I work, duh!")
}

/**
 * @desc When an HTMLElement with the ID "runTests" gets clicked we convert all "selftest" classes to tests
 */
document.getElementById("runTests").onclick = function(event) {
	// Hide the element
	document.getElementById("runTests").style.display = "none"
	// Start converting all test parents to tests
	selfTestFramework.convertAllTestsByClassName("selftest")
}