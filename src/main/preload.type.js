"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRole = exports.ConversationType = exports.ModelType = void 0;
// Type definitions
var ModelType;
(function (ModelType) {
    ModelType["multimodal"] = "multimodal";
    ModelType["chat"] = "chat";
    ModelType["vision"] = "vision";
    ModelType["reasoning"] = "reasoning";
    ModelType["ocr"] = "ocr";
})(ModelType || (exports.ModelType = ModelType = {}));
var ConversationType;
(function (ConversationType) {
    ConversationType["temporary"] = "temporary";
    ConversationType["normal"] = "normal";
})(ConversationType || (exports.ConversationType = ConversationType = {}));
var MessageRole;
(function (MessageRole) {
    MessageRole["system"] = "system";
    MessageRole["user"] = "user";
    MessageRole["assistant"] = "assistant";
    MessageRole["tool"] = "tool";
})(MessageRole || (exports.MessageRole = MessageRole = {}));
var ThemeType;
(function (ThemeType) {
    ThemeType["dark"] = "dark";
    ThemeType["light"] = "light";
})(ThemeType || (ThemeType = {}));
//# sourceMappingURL=preload.type.js.map