"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var twitter_text_1 = __importDefault(require("twitter-text"));
/**
 * The text area box
 *
 * @param charLimit - The maximum number of characters allowed in the text area
 * @param height - The height of the text area
 * @param minHeight - The minimum height of the text area
 * @param getDetails - A function to get the details of the text area
 * @returns The text area box
 */
var TextAreaBox = function (_a) {
    var _b = _a.charLimit, charLimit = _b === void 0 ? 480 : _b, _c = _a.height, height = _c === void 0 ? 450 : _c, _d = _a.minHeight, minHeight = _d === void 0 ? 250 : _d, getDetails = _a.getDetails;
    var _e = (0, react_1.useState)(''), text = _e[0], setText = _e[1];
    var _f = (0, react_1.useState)(''), text1 = _f[0], setText1 = _f[1];
    var _g = (0, react_1.useState)(charLimit), charsLeft = _g[0], setCharsLeft = _g[1];
    var textareaRef = (0, react_1.useRef)(null);
    var regex = (0, react_1.useMemo)(function () { return /\s*<limit>([\s\S]*?)<\/limit>/; }, []);
    function getFinalText(value, charLimit) {
        var finalText = '';
        if (value.length > charLimit) {
            // If already wrapped with <limit>, preserve as is
            if (value.includes('<limit>') && value.includes('</limit>')) {
                finalText = value;
            }
            else {
                finalText = value.slice(0, charLimit) + "<limit>".concat(value.slice(charLimit), "</limit>");
            }
        }
        else {
            finalText = value;
        }
        return finalText;
    }
    /**
     * Handle text input
     */
    var handleInput = function (e) {
        var value;
        if ('clipboardData' in e) {
            e.preventDefault();
            value = e.clipboardData.getData('text');
        }
        else if ('target' in e && e.target && e.target.value !== undefined) {
            value = e.target.value;
        }
        else {
            value = '';
        }
        var finalText = getFinalText(value, charLimit);
        var re = regex.exec(finalText);
        var theText = finalText.slice(0, charLimit);
        if (finalText.length > charLimit && re) {
            theText += re[1];
        }
        setText(theText);
        setText1(finalText);
    };
    (0, react_1.useEffect)(function () {
        getDetails === null || getDetails === void 0 ? void 0 : getDetails({ charsLeft: charsLeft, text: text1 });
    }, [charsLeft, getDetails, text1]);
    // Auto-expand textarea and update counter
    (0, react_1.useEffect)(function () {
        var textarea = textareaRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = "".concat(Math.min(textarea.scrollHeight, textarea.previousElementSibling.clientHeight), "px");
        setCharsLeft(charLimit - text.length);
    }, [charLimit, height, text]);
    // Helper to determine entity type and generate href
    var getEntityProps = function (entity) {
        if ('hashtag' in entity) {
            return {
                type: 'hashtag',
                href: "https://x.com/hashtag/".concat(encodeURIComponent(entity.hashtag)),
                label: "Search for hashtag ".concat(entity.hashtag),
            };
        }
        if ('screenName' in entity) {
            return {
                type: 'mention',
                href: "https://x.com/".concat(encodeURIComponent(entity.screenName)),
                label: "View profile for ".concat(entity.screenName),
            };
        }
        if ('url' in entity) {
            return {
                type: 'url',
                href: entity.url,
                label: "Open link ".concat(entity.url),
            };
        }
        if ('cashtag' in entity) {
            return {
                type: 'cashtag',
                href: "https://x.com/search?q=".concat(encodeURIComponent(entity.cashtag)),
                label: "Search for cashtag ".concat(entity.cashtag),
            };
        }
        return { type: '' };
    };
    // useEffect(() => {
    //   const re = regex.exec(text1 || '');
    //   console.log('re', re);
    //   if (re) {
    //     console.log(re[1]);
    //   }
    // }, [regex, text, text1])
    // Memoized highlighted text using twitter-text for robust parsing
    var highlightedText = (0, react_1.useMemo)(function () {
        var re = regex.exec(text1);
        var entityHandler = function (text, limit) {
            if (limit === void 0) { limit = true; }
            var theText = text.length > charLimit && limit ? text.slice(0, charLimit) : text;
            // Extract entities with indices (robust handling of Unicode, punctuation, etc.)
            var entities = twitter_text_1.default.extractEntitiesWithIndices(theText);
            // Sort by start index (though usually pre-sorted)
            entities.sort(function (a, b) { return a.indices[0] - b.indices[0]; });
            var parts = [];
            var lastIndex = 0;
            entities.forEach(function (entity) {
                // Plain text before entity
                var before = theText.slice(lastIndex, entity.indices[0]);
                if (before) {
                    parts.push((0, jsx_runtime_1.jsx)("span", { children: before }, parts.length));
                }
                // Highlighted entity
                var entityText = theText.slice(entity.indices[0], entity.indices[1]);
                var _a = getEntityProps(entity), type = _a.type, href = _a.href, label = _a.label;
                parts.push((0, jsx_runtime_1.jsx)("a", __assign({ className: "highlight ".concat(type), href: href, target: "_blank", rel: "noopener noreferrer", "aria-label": label }, { children: entityText }), parts.length));
                lastIndex = entity.indices[1];
            });
            // Remaining plain text
            var after = theText.slice(lastIndex);
            if (after) {
                parts.push((0, jsx_runtime_1.jsx)("span", { children: after }, parts.length));
            }
            return { parts: parts, theText: theText };
        };
        var parts = entityHandler(text).parts;
        if (text.length > charLimit && re) {
            parts.push((0, jsx_runtime_1.jsx)("span", __assign({ className: 'limit-content' }, { children: entityHandler(re[1], false).parts }), parts.length));
        }
        return parts;
    }, [charLimit, regex, text, text1]);
    // useEffect(() => {
    //   const re = regex.exec(text1);
    //   const theText = text.slice(0, charLimit);
    //   if (text.length > charLimit && re) {
    //     setText(theText + re[1]);
    //   }
    // }, [charLimit, regex, text, text1]);
    // Handle Ctrl+Enter for submission
    var handleKeyDown = function (e) {
        if (e.ctrlKey && e.key === 'Enter' && text.length > 0 && charsLeft >= 0) {
            console.log('Tweet:', text); // Replace with API call
            setText('');
            setText1('');
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", __assign({ className: "textarea-wrapper", style: { maxHeight: "".concat(height, "px"), overflow: 'auto' } }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ className: "highlight-layer", style: { minHeight: "".concat(minHeight, "px") } }, { children: highlightedText })), (0, jsx_runtime_1.jsx)("textarea", { id: 'textarea', ref: textareaRef, value: text, onChange: handleInput, onKeyDown: handleKeyDown, placeholder: "What's happening?", rows: 1, 
                // maxLength={charLimit}
                style: { minHeight: "".concat(minHeight, "px") }, onPaste: handleInput })] })));
};
exports.default = TextAreaBox;
