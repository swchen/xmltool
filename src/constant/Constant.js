const XmlEntityMap = {
    lt: `<`, // 60
    gt: `>`, // 62
    amp: `&`, // 38
    apos: `'`, // 39
    quot: `"`, // 34
};

// \xFF, \uFFFF, \u{10FFFF}

const NameReMap = {
    WHITE_SPACE: /[\u0020\u0009\u000D\u000A]/,
    QUOTE: /['"]/,
    DIGIT: /[0-9]/,
    HEX_DIGIT: /[0-9a-fA-F]/,

    CHAR: /[\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/u,

    NAME_START_CHAR: /[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u{10000}-\u{EFFFF}]/u,
    NAME_CHAR: /[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u{10000}-\u{EFFFF}-.0-9\u00B7\u0300-\u036F\u203F-\u2040]/u,

    NCNAME_START_CHAR: /[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u{10000}-\u{EFFFF}]/u,
    NCNAME_CHAR: /[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u{10000}-\u{EFFFF}-.0-9\u00B7\u0300-\u036F\u203F-\u2040]/u,

};


const State = {
    BEGIN: "BEGIN",
    DOCUMENT_BEGIN: "DOCUMENT_BEGIN",
    DOCUMENT_BODY: "DOCUMENT_BODY",
    DOCUMENT_BODY_ELEMENT_AFTER: "DOCUMENT_BODY_ELEMENT_AFTER",
    DOCUMENT_END: "DOCUMENT_END",

    ELEMENT_BEGIN: "ELEMENT_BEGIN",
    ELEMENT_BODY: "ELEMENT_BODY",
    ELEMENT_END: "ELEMENT_END",
};


const XmlNodeType = {
    ATTRIBUTE: "ATTRIBUTE",
    CDATA: "CDATA",
    COMMENT: "COMMENT",
    DOCUMENT: "DOCUMENT",
    DOCUMENT_FRAGMENT: "DOCUMENT_FRAGMENT",
    DOCUMENT_TYPE: "DOCUMENT_TYPE",
    ELEMENT: "ELEMENT",
    ENTITY: "ENTITY",
    ENTITY_REFERENCE: "ENTITY_REFERENCE",
    NOTATION: "NOTATION",
    PROCESSING_INSTRUCTION: "PROCESSING_INSTRUCTION",
    TEXT: "TEXT",
    XML_DECLARATION: "XML_DECLARATION",
};


// `:` is reserved
const DEFAULT_PREFIX = ":DEFAULT:";
const XMLNS = "xmlns";
const XML = "xml";

const XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace";
const XMLNS_NAMESPACE = "http://www.w3.org/2000/xmlns/";
const ROOT_NAMESPACE_MAP = {
    xml: XML_NAMESPACE,
    xmlns: XMLNS_NAMESPACE,
};


export default {
    State,
    XmlNodeType,
    XmlEntityMap,

    NameReMap,
    DEFAULT_PREFIX,
    XMLNS,
    XML,
    XML_NAMESPACE,
    XMLNS_NAMESPACE,
    ROOT_NAMESPACE_MAP,
};