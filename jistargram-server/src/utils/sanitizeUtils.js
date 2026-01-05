const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const sanitizeHtml = (dirty) => {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
    });
};

module.exports = { sanitizeHtml }