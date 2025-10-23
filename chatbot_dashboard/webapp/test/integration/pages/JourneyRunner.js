sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"chatbotdashboard/test/integration/pages/CMFList",
	"chatbotdashboard/test/integration/pages/CMFObjectPage"
], function (JourneyRunner, CMFList, CMFObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('chatbotdashboard') + '/test/flp.html#app-preview',
        pages: {
			onTheCMFList: CMFList,
			onTheCMFObjectPage: CMFObjectPage
        },
        async: true
    });

    return runner;
});

