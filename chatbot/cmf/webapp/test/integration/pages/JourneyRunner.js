sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"cmf/test/integration/pages/CMFList",
	"cmf/test/integration/pages/CMFObjectPage"
], function (JourneyRunner, CMFList, CMFObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('cmf') + '/test/flp.html#app-preview',
        pages: {
			onTheCMFList: CMFList,
			onTheCMFObjectPage: CMFObjectPage
        },
        async: true
    });

    return runner;
});

