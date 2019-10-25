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

/**
 * @param {*} variable Anything you want to know if it's empty or not
 * @returns {!Boolean} Returns true on empty and false on not empty
 * @summary This checks if a given variable is empty or not
 * @desc My famous (not really) isEmpty function. It checks if a given variable is empty or not
 */
function isEmpty(variable) {
	if (!variable) return true
	if (typeof variable == "object") {
		if (Array.isArray(variable)) {
			if (variable.length == 0) return true
		} else {
			if (Object.keys(variable).length == 0) return true
		}
	}
	return false
}

function randomString(length) {
	let result = ''
	let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length))
	}
	return result
}