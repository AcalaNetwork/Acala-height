"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.queryLastestBlock = exports.queryBlock = void 0;
var graphql_request_1 = require("graphql-request");
var koa_1 = require("koa");
var app = new koa_1["default"]();
var karuraSubql = 'https://api.subquery.network/sq/AcalaNetwork/karura';
var acalaSubql = 'https://api.subquery.network/sq/AcalaNetwork/acala';
var queryBlock = function (network, height) {
    var url = network == 'KARURA' ? karuraSubql : acalaSubql;
    return (0, graphql_request_1.request)(url, (0, graphql_request_1.gql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n    query {\n      blocks(filter: {number: {equalTo: \"", "\"}}) {\n        nodes {\n          id\n          timestamp\n          number\n        }\n      }\n    }\n  "], ["\n    query {\n      blocks(filter: {number: {equalTo: \"", "\"}}) {\n        nodes {\n          id\n          timestamp\n          number\n        }\n      }\n    }\n  "])), height));
};
exports.queryBlock = queryBlock;
var queryLastestBlock = function (network) {
    var url = network == 'KARURA' ? karuraSubql : acalaSubql;
    return (0, graphql_request_1.request)(url, (0, graphql_request_1.gql)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n    query {\n      blocks(orderBy: NUMBER_DESC, first:1)  {\n        nodes {\n          id\n          timestamp\n          number\n        }\n      }\n    }\n  "], ["\n    query {\n      blocks(orderBy: NUMBER_DESC, first:1)  {\n        nodes {\n          id\n          timestamp\n          number\n        }\n      }\n    }\n  "]))));
};
exports.queryLastestBlock = queryLastestBlock;
app.use(function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, network, recent, from, to, highHeight, lowHeight, highTime, lowTime, gap, data, high, low, _recent, high, low;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = ctx.request.query, _b = _a.network, network = _b === void 0 ? 'Karura' : _b, recent = _a.recent, from = _a.from, to = _a.to;
                highHeight = 0;
                lowHeight = 0;
                highTime = 0;
                lowTime = 0;
                gap = 0;
                data = {};
                if (!(from && from != '0' && to && to != '0')) return [3 /*break*/, 3];
                highHeight = Number(from) > Number(to) ? Number(from) : Number(to);
                lowHeight = Number(from) < Number(to) ? Number(from) : Number(to);
                return [4 /*yield*/, (0, exports.queryBlock)(network.toUpperCase(), highHeight)];
            case 1:
                high = _c.sent();
                highTime = new Date(high.blocks.nodes[0].timestamp).getTime();
                return [4 /*yield*/, (0, exports.queryBlock)(network.toUpperCase(), lowHeight)];
            case 2:
                low = _c.sent();
                lowTime = new Date(low.blocks.nodes[0].timestamp).getTime();
                gap = highHeight - lowHeight;
                data.from = from;
                data.to = to;
                data.gap = gap;
                return [3 /*break*/, 6];
            case 3:
                _recent = recent ? Number(recent) : 500;
                return [4 /*yield*/, (0, exports.queryLastestBlock)(network.toUpperCase())];
            case 4:
                high = _c.sent();
                highHeight = Number(high.blocks.nodes[0].number);
                highTime = new Date(high.blocks.nodes[0].timestamp).getTime();
                return [4 /*yield*/, (0, exports.queryBlock)(network.toUpperCase(), highHeight - _recent)];
            case 5:
                low = _c.sent();
                lowHeight = Number(low.blocks.nodes[0].number);
                lowTime = new Date(low.blocks.nodes[0].timestamp).getTime();
                gap = _recent;
                data.recent = Number(recent);
                data.gap = gap;
                _c.label = 6;
            case 6: return [2 /*return*/, ctx.body = {
                    avg: ((highTime - lowTime) / gap) / 1000,
                    data: data
                }];
        }
    });
}); });
app.listen(1020, function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.log('Server [karura-height] start at: ', 1020);
        return [2 /*return*/];
    });
}); });
var templateObject_1, templateObject_2;
