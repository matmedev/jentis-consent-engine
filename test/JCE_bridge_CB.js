/**
 * The JENTIS consent GTM Bridge
 *
 * The JENTIS consent engine is the central API component
 * on page to communicate with all other consent components.
 *
 */
window.jentis = window.jentis || {};
window.jentis.consent = window.jentis.consent || {};

window.jentis.consent.cb_bridge = new function () {

	this.cookiebotPurposeMap = {
		"mark": "marketing",
		"stat": "statistics",
		"pref": "preferences",
	}

	this.init = function () {
		if(typeof window.jentis.consent.engine !== "undefined")
		{
			//If the engine is allready loaded, we maybe missed the events, so we want to register at the engine instead of the document.
			var oEventBaseObject = window.jentis.consent.engine;
		}
		else
		{
			//No engine allready exists, so it is safe to register at the document.
			var oEventBaseObject = document;
		}

		(function(oMe,oEventBaseObject){
			oEventBaseObject.addEventListener('jentis.consent.engine.init',function(e)
			{
				oMe.setupTracking();
			});

			oEventBaseObject.addEventListener('jentis.consent.engine.vendor-add',function(e)
			{
				oMe.setupTracking();
			});
		})(this,oEventBaseObject);
	}

	this.setupTracking = function () {
		window.addEventListener('CookiebotOnAccept', () => {
			const vendorFullData = window.jentis.consent.engine.getVendorFullData();
			const consents = Object.keys(vendorFullData).reduce((acc, key) => {
				const purposeId = vendorFullData[key].purpose.id;
				const cookiebotPurpose = this.cookiebotPurposeMap[purposeId];
				return {
					...acc,
					[key]: Cookiebot.consent[cookiebotPurpose] || !vendorFullData[key].deniable,
				};
			}, {});

			window.jentis.consent.engine.setNewVendorConsents(consents);
		});

		window.addEventListener('CookiebotOnDecline', function (e) {
			window.jentis.consent.engine.DenyAll();
		});

	}

	this.init();
}

