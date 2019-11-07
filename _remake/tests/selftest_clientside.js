/**
 * **WHAT DOES THIS SCRIPT DO? (in 8 simple steps)**
 * 1. Once the HTMLElement with the id *runTests* (by default the button saying *Run all tests*) is clicked it starts running the onclick function.
 * 2. The onclick function then hides the button and starts running *selfTestFramework.convertAllTestsBySelfTestObject*
 * 	- Which converts all the parent id's in the global `selfTest` variable to tests
 * 3. The function (*selfTestFramework.convertAllTestsBySelfTestObject*) will go through all the parent id's and will call *selfTestFramework.convertSelfTestObjectChildToTests*
 * 	- Which will convert the individual test codes of the parent to tests
 * 4. The function (*selfTestFramework.convertSelfTestObjectChildToTests*) will clear the parent's inner html to be prepared for displaying result data
 * 5. Then uses the given data from the child of the parent in the global `selfTest` variable
 * 6. ...to generate arguments for the test function,
 * 7. ...execute the function
 * 8. And getting and displaying the results
 */

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
	 * @throws {Error} When the argument `(inner-content)` has been found but no `testCodeElement` has been passed via options
	 * @param {!String} selfTestArgumentsValue The string value of the HTML attribute 'data-selftest-arguments'
	 * @param {?Object} [options={}] Values that need special filling. (IE: 'testCodeElement')
	 * *Valid options are:*
	 * - testCodeElement | The HTML code converted into an HTMLElement that was originally in the inner XMP tag in the parent self test element
	 * @returns {!Array} Returns array with replaced arguments
	 * @summery Replaces all special arguments with their corresponding value.
	 * @desc Replaces all special arguments with their corresponding value.
	 * *Special arguments are:*
	 * - (inner-content) | Replaces that argument with the code within the xmp tag
	 */
	static createTestFunctionArguments(selfTestArgumentsValue, options = {}) {
		// Prepare/Initiate the return array
		let correctArgs = []
		// Split the given arguments from a string to an array
		let arrArgs = selfTestArgumentsValue.split(",")
		// Go through all the given arguments
		for (let i = 0; i < arrArgs.length; i++) {
			const argument = arrArgs[i];
			// If the current argument is the special argument (inner-content)
			if (argument == "(inner-content)") {
				// Check if the HTMLElement that has to be passed to the function is available in options
				if (options.testCodeElement != null) {
					// Push the HTMLElement to the return arguments array
					correctArgs.push(options.testCodeElement)
				} else {
					// Throw an error since the argument is specified but no HTMLElement is available from the 'options' object
					throw new Error("(inner-content) has been found as argument but no test code has been provided in the options")
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
	 * @private
	 * @param {!HTMLElement} htmlElement The parent self test HTML element
	 * @throws {Error} `htmlElement` must be a valid HTMLElement
	 * @desc Initiates the front end to display results of the given tests
	 */
	static initiateSelfTestFrontEnd(htmlElement) {
		// Throw an error is no htmlElement is set
		if (htmlElement == null) throw new Error(`Given HTMLElement is invalid or is not set.`)
		// Clearing the parent div for new generate code
		htmlElement.innerHTML = `<h3>${(!isEmpty(htmlElement.getAttribute("data-selftest-test"))) ? htmlElement.getAttribute("data-selftest-test") : getDataFromRootNode} Tests</h3>`
		// Creating headers for the preview and result boxes (which will come soon)
		let headerDiv = document.createElement("div")
		headerDiv.classList.add("header-tests", "margin-5")
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
	 * @param {?String} returnLang What language you expect from the test function to return (defaults to 'json')
	 * @see selfTestFramework.argumentGenerator
	 * @desc Initiates the front end to display results of the given tests
	 */
	static createTestsFromArray(htmlElement, testFunc, testCodes, returnLang = "json") {
		log(`[${testFunc}] Going through all the test codes...`, "info")
		for (let i = 0; i < testCodes.length; i++) {
			const testCode = testCodes[i];
			log(`[${testFunc}] Current working on test code: `, "debug", testCode)
			// Creating new/output container
			let outputContainer = document.createElement("div")
			outputContainer.id = "outputContainer"
			outputContainer.style.display = "flex"
			// (Re-)Creating the preview HTML element
			let previewHTML = document.createElement("script")
			previewHTML.type = "text/plain"
			previewHTML.classList.add("language-html")
			previewHTML.innerHTML = testCode
			// Creating the result box
			let resultBox = document.createElement("script")
			resultBox.type = "text/plain"
			resultBox.classList.add("language-" + returnLang)
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
			passingElem.classList.add("test-pass-message", "margin-5")
			// Set the passing message from earlier
			passingElem.innerText = passing.msg
			// Set the passing color from earlier
			passingElem.style.color = passing.color
			// Add the preview HTML box to the output container
			outputContainer.append(previewHTML)
			// Add the result box to the output container
			outputContainer.append(resultBox)
			// Highlight preview and results
			Prism.highlightElement(previewHTML)
			Prism.highlightElement(resultBox)
			// Add the output container to the parent
			htmlElement.append(outputContainer)
			// Add the passing element to the parent
			htmlElement.append(passingElem)
		}
	}

	/**
	 * @generator
	 * @param {!Array} testCodes An array with all the test code (most likely the inner script html)
	 * @param {!String} parentID The id of the parent HTMLElement where the test codes originate from
	 * @throws {Error} When the `testCodes` argument is empty
	 * @throws {Error} When the `parentID` argument is empty
	 * @summary Converts given `testCodes` into real tests
	 * @see selfTestFramework.initiateSelfTestFrontEnd
	 * @see selfTestFramework.createTestsFromArray
	 * @desc Converts given `testCodes` into real tests
	 * MAKE SURE THAT THE PARENT ELEMENT HAVE THE FOLLOWING ATTRIBUTES AND ARE FILLED:
	 * - 'data-selftest-test="functionYouWantToExecute"' | (Optional) defaults to *getDataFromRootNode*
	 * - 'data-selftest-arguments="firstArgument,secondArgument,thirdArgument,etc"'
	 * *Argument can also be:*
	 * - '(inner-content)' - *Without quotes* This will pass the inner content code (test code) to the function
	 */
	static convertSelfTestObjectChildToTests(testCodes, parentID) {
		// Check is the argument(s) is/are empty
		if (isEmpty(testCodes)) throw Error("'testCodes' argument can't be empty")
		if (isEmpty(parentID)) throw Error("'parentID' argument can't be empty")
		// Get parent html element by given id
		let parentHTMLElement = document.getElementById(parentID)
		// Get the name of the function we got to test
		let testFuncName = selfTests[parentID].function2Test

		// Prepare the front end for preview and results
		selfTestFramework.initiateSelfTestFrontEnd(parentHTMLElement)

		// Start going through all test codes, make output containers, convert special arguments (if needed) and test the function
		selfTestFramework.createTestsFromArray(parentHTMLElement, testFuncName, testCodes)
		
		// Finished! Results are displayed on page.
		log(`[${testFuncName}] Job's done!`, "info")
	}

	/**
	 * @throws {Error} When the global variable `selfTests` can't be found
	 * @see selfTestFramework.convertSelfTestObjectChildToTests
	 * @desc Converts all tests found in the global `selfTests` variable to actual tests
	 */
	static convertAllTestsBySelfTestObject() {
		// Check is the global variable `selfTests` exists
		if (isEmpty(selfTests)) throw Error("Can't find global variable 'selfTests'.")
		// Go through all different self test parents
		for (const parentID in selfTests) {
			if (selfTests.hasOwnProperty(parentID) && parentID != "originalHTML") {
				const parentDataObj = selfTests[parentID];
				let testCodes = []
				// Get all test codes of the current parent
				for (let i = 0; i < parentDataObj.length; i++) {
					const testCode = parentDataObj[i];
					testCodes.push(testCode)
				}
				// Convert current parent with test code(s) to actual test(s)
				selfTestFramework.convertSelfTestObjectChildToTests(testCodes, parentID)
			}
		}
	}
}

/**
 * @desc When an HTMLElement with the ID "runTests" gets clicked we convert all "selftest" classes to tests
 */
document.querySelector(".run-tests").addEventListener("click", function(event) {
	// Hide the element
	document.querySelector(".run-tests").style.display = "none"
	// Start converting all tests on page to actual tests
	selfTestFramework.convertAllTestsBySelfTestObject()
})
