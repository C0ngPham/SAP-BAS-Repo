sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
  "use strict";

  return Controller.extend("cmf.ext.FeedbackChart", {
    onInit: function () {
      // Lấy model OData chính của app
      var oODataModel = this.getOwnerComponent().getModel();
      var oJSONModel = new JSONModel();
      var oView = this.getView();

      // Đọc toàn bộ tập dữ liệu CMF và đếm số lần xuất hiện của feedback_score
      oODataModel.read("/CMF", {
        success: function (oData) {
          var counts = { "-1": 0, "1": 0, "empty": 0 };
          oData.value.forEach(function (item) {
            var score = item.feedback_score;
            if (score === "-1") {
              counts["-1"]++;
            } else if (score === "1") {
              counts["1"]++;
            } else {
              counts["empty"]++;
            }
          });
          oJSONModel.setData({
            feedbackCounts: [
              { score: "-1", count: counts["-1"] },
              { score: "1", count: counts["1"] },
              { score: "empty", count: counts["empty"] }
            ]
          });
          // gán model JSON cho view biểu đồ
          oView.setModel(oJSONModel);
        },
        error: function (oErr) {
          // xử lý lỗi tùy ý
        }
      });
    }
  });
});
