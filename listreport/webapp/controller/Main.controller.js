sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/core/BusyIndicator",
    "sap/ui/core/format/DateFormat"
],
function (Controller, Filter, FilterOperator, MessageToast, BusyIndicator, DateFormat) {
    "use strict";

    return Controller.extend("listreport.controller.Main", {
        onInit: function () {
            // this._bindTable();
        },
        // onSearch: function (oEvent) {
        // var sQuery = oEvent.getParameter("newValue") || oEvent.getSource().getValue();
        // var oTable = this.byId("OTCRequestTable");
        // var oBinding = oTable.getBinding("items");

        // if (sQuery && sQuery.length > 0) {
        //     var aFilters = [
        //     new Filter("REQUEST_ID", FilterOperator.Contains, sQuery),
        //     new Filter("REQUESTOR_NAME", FilterOperator.Contains, sQuery),
        //     new Filter("CUSTOMER_NAME", FilterOperator.Contains, sQuery)
        //     ];

        //     // OR filter trên các field
        //     var oFilter = new Filter({
        //     filters: aFilters,
        //     and: false
        //     });
        //     oBinding.filter(oFilter);
        // } else {
        //     oBinding.filter([]);
        // }
        // }
         // === Formatter: chuyển Edm.DateTime (/Date(ms)/) -> dd/MM/yyyy HH:mm ===
            fmtDate: function (v) {
            if (!v) return "";
            // v có thể là object Date (UI5) hoặc string /Date(…)/ tùy model
            let d;
            if (v instanceof Date) {
                d = v;
            } else if (typeof v === "string") {
                const m = /Date\((\d+)\)/.exec(v);
                d = m ? new Date(parseInt(m[1], 10)) : new Date(v);
            } else {
                d = new Date(v);
            }
            if (isNaN(d)) return "";
            const f = DateFormat.getDateTimeInstance({ pattern: "dd/MM/yyyy HH:mm" });
            return f.format(d);
            },

            _bindTable: function (aFilters) {
            const oTable = this.byId("tbl");
            // dùng item template hiện tại
            const oTemplate = oTable.getItems()[0];

            const oBindingInfo = {
                path: "/OTC_REQUESTS",
                parameters: {
                // Chọn subset fields để nhẹ payload
                select: [
                    "ID","REQUEST_ID","CUSTOMER_NAME","CURRENCY",
                    "TOT_BILLING_AMT","REQUEST_STATUS_DESC","SUBMITTED_DATE"
                ].join(","),
                countMode: "Inline"
                },
                filters: aFilters || []
            };

            // oTable.bindItems(oBindingInfo, oTemplate.clone());
            },

            _buildFilters: function () {
                const sId = this.byId("inpId").getValue().trim();
                const sCustName = this.byId("inpCustName").getValue().trim();

                const a = [];
                if (sId) {
                    // Nếu muốn tìm gần đúng thì đổi EQ -> Contains
                    a.push(new Filter("ID", FilterOperator.EQ, sId));
                }
                if (sCustName) {
                    a.push(new Filter("CUSTOMER_NAME", FilterOperator.Contains, sCustName));
                }
                return a;    
            },

            onSearch: function () {
                BusyIndicator.show(0);
                try {
                    const oBinding = this.byId("tbl").getBinding("items");
                    if (!oBinding) { return; }
                    const aFilters = this._buildFilters();
                    oBinding.filter(aFilters, "Application");  // áp filter vào binding hiện có
                } finally {
                    BusyIndicator.hide();
                }
            },

            onClear: function () {
            this.byId("inpId").setValue("");
            this.byId("inpCustName").setValue("");
            this.onSearch();
            MessageToast.show("Đã xóa filter.");
            },

            onRefresh: function () {
            const oTable = this.byId("tbl");
            const oBinding = oTable.getBinding("items");
            if (oBinding) {
                oBinding.refresh(true);
                MessageToast.show("Đã refresh.");
            } else {
                this.onSearch();
            }
            },

            onExport: function () {
            sap.ui.require(["sap/ui/export/Spreadsheet"], function (Spreadsheet) {
                const oTable = this.byId("tbl");
                const oBinding = oTable.getBinding("items");
                if (!oBinding) {
                MessageToast.show("Không có dữ liệu để xuất.");
                return;
                }

                const aCols = [
                { label: "Request ID", property: "REQUEST_ID" },
                { label: "Customer Name", property: "CUSTOMER_NAME" },
                { label: "Currency", property: "CURRENCY" },
                { label: "Total Billing", property: "TOT_BILLING_AMT" },
                { label: "Status", property: "REQUEST_STATUS_DESC" },
                { label: "Submitted Date", property: "SUBMITTED_DATE" }
                ];

                // Lấy dữ liệu hiện có trong binding (grow/paging lớn thì nên đọc qua read)
                const iLen = oBinding.getLength();
                const aContexts = oBinding.getContexts(0, iLen);
                const aData = aContexts.map(c => c.getObject());

                const oSheet = new Spreadsheet({
                workbook: { columns: aCols },
                dataSource: aData,
                fileName: "OTC_Requests.xlsx"
                });
                oSheet.build().finally(function () { oSheet.destroy(); });
            }.bind(this));
            }

    });
});
