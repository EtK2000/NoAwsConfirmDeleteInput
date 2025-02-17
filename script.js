// ==UserScript==
// @name         NoAwsConfirmDeleteInput
// @namespace    EtK2000
// @version      2025-02-17
// @description  Autofill AWS resource deletion confirmation inputs
// @author       EtK2000
// @match        https://*.console.aws.amazon.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/EtK2000/NoAwsConfirmDeleteInput/refs/heads/master/script.js
// @updateURL    https://raw.githubusercontent.com/EtK2000/NoAwsConfirmDeleteInput/refs/heads/master/script.js
// ==/UserScript==


(function() {
	'use strict';

	const s3BucketDeleteRegex = RegExp(/^https:\/\/[a-z\d-]+\.console\.aws\.amazon\.com\/s3\/bucket\/[\w\d.-]+\/delete\?.*$/, 'g');
	const s3BucketEmptyRegex = RegExp(/^https:\/\/[a-z\d-]+\.console\.aws\.amazon\.com\/s3\/bucket\/[\w\d.-]+\/empty\?.*$/, 'g');
	const s3ObjectDeleteRegex = RegExp(/^https:\/\/[a-z\d-]+\.console\.aws\.amazon\.com\/s3\/buckets\/[\w\d.-]+\/object\/delete\?.*$/, 'g');

	//
	// start of utility functions
	//

	function enableRedirectionTracking() {
		let lastUrl = window.location.href;

		// Method 1: Using History API
		const pushState = history.pushState;
		history.pushState = function() {
			pushState.apply(history, arguments);
			handleUrlChange();
		};

		const replaceState = history.replaceState;
		history.replaceState = function() {
			replaceState.apply(history, arguments);
			handleUrlChange();
		};

		// Method 2: Listen for popstate events
		window.addEventListener('popstate', function() {
			handleUrlChange();
		});

		// Method 3: Regular checking (as backup)
		setInterval(checkUrl, 500);

		function checkUrl() {
			if (window.location.href !== lastUrl)
				handleUrlChange();
		}

		function handleUrlChange() {
			const currentUrl = window.location.href;
			if (lastUrl !== currentUrl) {
				lastUrl = currentUrl;
				onUrlChanged(currentUrl);
			}
		}
	}

	function extractS3BucketName(url) {
		const regex = /\/bucket\/([^/?]+)/;
		const match = url.match(regex);
		return match ? match[1] : null;
	}

	function onLoad() {
		const matches = onLoadLookup.filter(entry => entry.regex.test(window.location.href));
		if (matches.length === 1)
			setTextToPlaceholder(matches[0].getPlaceholder(window.location.href));
	}

	function onUrlChanged(newUrl) {
		const matches = onRedirectLookup.filter(entry => entry.regex.test(newUrl));
		if (matches.length === 1)
			setTextToPlaceholder(matches[0].getPlaceholder(newUrl));
	}

	// yoinked from https://stackoverflow.com/questions/52120524/type-text-into-a-react-input-using-javascript-tampermonkey-script
	function setText(input, text) {
		const lastValue = input.value;
		input.value = text;

		const event = new Event('input', { bubbles: true });

		// for React15
		event.simulated = true;

		// for React16
		const tracker = input._valueTracker;
		if (tracker)
			tracker.setValue(lastValue);

		input.dispatchEvent(event);
	}


	function setTextToPlaceholder(placeholderText) {
		waitForElementToExist(`input[placeholder="${placeholderText}"]`).then(input => setText(input, placeholderText));
	}

	// yoinked from https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
	function waitForElementToExist(selector) {
		return new Promise(resolve => {
			if (document.querySelector(selector))
				return resolve(document.querySelector(selector));

			const observer = new MutationObserver(mutations => {
				if (document.querySelector(selector)) {
					observer.disconnect();
					resolve(document.querySelector(selector));
				}
			});

			// If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
			observer.observe(document.body, {
				childList: true,
				subtree: true
			});
		});
	}

	//
	// end of utility functions
	//

	const onLoadLookup = [
		{
			getPlaceholder: url => extractS3BucketName(url),
			regex: s3BucketDeleteRegex
		},
		{
			getPlaceholder: url => 'permanently delete',
			regex: s3BucketEmptyRegex
		}
	];

	const onRedirectLookup = [
		{
			getPlaceholder: url => extractS3BucketName(url),
			regex: s3BucketDeleteRegex
		},
		{
			getPlaceholder: url => 'permanently delete',
			regex: s3BucketEmptyRegex
		},
		{
			getPlaceholder: url => 'delete',
			regex: s3ObjectDeleteRegex
		}
	];

	onLoad();
	enableRedirectionTracking();
})();