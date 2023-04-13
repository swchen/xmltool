import Constant from "../constant/Constant";
import Lexer from "./Lexer";
import XmlException from "../exception/XmlException";


import XDocument from "../node/XDocument";
import XDeclaration from "../node/XDeclaration";
import XProcessingInstruction from "../node/XProcessingInstruction";
import XComment from "../node/XComment";
import XDocumentType from "../node/XDocumentType";
import XElement from "../node/XElement";
import XAttribute from "../node/XAttribute";
import XName from "../node/XName";
import XCData from "../node/XCData";
import XText from "../node/XText";
import assert from "../util/assert";

export default class Parser {

    constructor(text, option) {
        this._lexer = new Lexer(text);
        this._state = Constant.State.BEGIN;

        this._containerStack = [];

        this._entityMap = Constant.XmlEntityMap;

        this._option = {
            namespace: true,
            ...(option || {}),
        };
    }

    failure(message) {
        const pos = this._lexer.getPosition();
        throw new XmlException(message, pos.line, pos.column);
    }

    failure2(message, pos) {
        throw new XmlException(message, pos.line, pos.column);
    }

    //--------------------------------------------------------------------------

    checkStack() {
        if (this._containerStack.length === 0) {
            this.failure("Container Stack is empty.");
        }
    }

    push(containerState) {
        this._containerStack.push(containerState);
    }

    pop() {
        this.checkStack();
        return this._containerStack.pop();
    }

    top() {
        this.checkStack();
        return this._containerStack[this._containerStack.length - 1];
    }


    //--------------------------------------------------------------------------

    reference() {
        if (this._lexer.peekSeq("&#x")) {
            this._lexer.seq("&#x");

            const numStr = this._lexer.hexNumber();
            const num = Number.parseInt(numStr, 16);
            this._lexer.seq(";");

            return String.fromCodePoint(num);


        } else if (this._lexer.peekSeq("&#")) {
            this._lexer.seq("&#");

            const numStr = this._lexer.number();
            const num = Number.parseInt(numStr, 10);
            this._lexer.seq(";");

            return String.fromCodePoint(num);

        } else {
            this._lexer.seq("&");
            const name = this._lexer.name();
            this._lexer.seq(";");

            const str = this._entityMap[name];

            if (str == null) {
                this.failure(`Can't reference to entity ${name}.`);
            }

            return str;
        }
    }

    characterData() {
        const str = this._lexer.manyReUntil(/[^<&]/u, "]]>");
        if (this._lexer.peekSeq("]]>")) {
            this.failure(`']]>' is not allowed in character data.`);
        }
        return str;
    }

    attValue(endCh) {

        let rst = "";
        let ch = this._lexer.peek();
        while (ch !== endCh) {
            if (ch === "&") {
                rst += this.reference();

            } else if (ch === "<") {
                this.failure(`Invalid attribute value character: '${ch}'.`);

            } else {
                rst += ch;
                this._lexer.next();
            }

            ch = this._lexer.peek();
        }

        return rst;
    }

    //--------------------------------------------------------------------------

    _processingInstruction(target, pos) {

        if (target === "xml") {
            this.failure2(
                "Declaration must be first node in XMl, and whitespace are not allowed before it.",
                pos,
            );

        } else if (target.toLowerCase() === "xml") {
            this.failure2(
                `Invalid processing instruction target: ${target}.`,
                pos,
            );
        }


        this._lexer.whiteSpace();
        const data = this._lexer.seqUntil("?>");
        this._lexer.seq("?>");

        const pi = new XProcessingInstruction(target, data);
        pi.range.setBegin(pos);
        pi.range.setEnd(this._lexer.getPosition());

        const {container} = this.top();
        container.children.push(pi);
    }


    declaration() {
        const pos = this._lexer.getPosition();
        this._lexer.seq("<?");
        const target = this._lexer.name();

        if (target === "xml") {
            this._lexer.whiteSpace();
            this._lexer.seq("version");
            this._lexer.whiteSpace();
            this._lexer.seq("=");
            this._lexer.whiteSpace();
            let ch = this._lexer.quote();
            this._lexer.seq("1.");
            const version = `1.${this._lexer.number()}`;
            this._lexer.seq(ch);

            this._lexer.whiteSpace();

            let encoding = null;
            if (this._lexer.peekSeq("encoding")) {
                this._lexer.seq("encoding");

                this._lexer.whiteSpace();
                this._lexer.seq("=");
                this._lexer.whiteSpace();

                ch = this._lexer.quote();
                encoding = this._lexer.encodingName();
                this._lexer.seq(ch);
                this._lexer.whiteSpace();
            }

            let standalone = null;
            if (this._lexer.peekSeq("standalone")) {
                this._lexer.seq("standalone");

                this._lexer.whiteSpace();
                this._lexer.seq("=");
                this._lexer.whiteSpace();

                ch = this._lexer.quote();
                if (this._lexer.peekSeq("yes")) {
                    standalone = this._lexer.seq("yes");
                } else {
                    standalone = this._lexer.seq("no");
                }

                this._lexer.seq(ch);
                this._lexer.whiteSpace();
            }

            this._lexer.seq("?>");


            const declaration = new XDeclaration(
                version,
                encoding,
                standalone,
            );
            declaration.range.setBegin(pos);
            declaration.range.setEnd(this._lexer.getPosition());


            const {container} = this.top();
            container.children.push(declaration);
            container.declaration = declaration;

        } else {
            this._processingInstruction(target, pos);
        }
    }

    documentType() {
        const pos = this._lexer.getPosition();

        this._lexer.seq("<!DOCTYPE");
        this._lexer.whiteSpace();
        const name = this._lexer.name();
        this._lexer.whiteSpace();

        let systemId = null;
        let publicId = null;
        if (this._lexer.peekSeq("SYSTEM")) {
            this._lexer.seq("SYSTEM");
            this._lexer.whiteSpace();

            const ch = this._lexer.quote();
            systemId = this._lexer.seqUntil(ch);
            this._lexer.seq(ch);

        } else if (this._lexer.peekSeq("PUBLIC")) {
            this._lexer.seq("PUBLIC");
            this._lexer.whiteSpace();

            let ch = this._lexer.quote();
            if (ch === `"`) {
                publicId = this._lexer.publicIdInDoubleQuote();
            } else {
                publicId = this._lexer.publicIdInSingleQuote();
            }
            this._lexer.seq(ch);

            this._lexer.whiteSpace();
            ch = this._lexer.quote();
            systemId = this._lexer.seqUntil(ch);
            this._lexer.seq(ch);
        }

        this._lexer.whiteSpace();

        let internalSubset = null;
        if (this._lexer.peekSeq("[")) {
            this._lexer.seq("[");
            // TODO: parse intSubset
            // https://www.w3.org/TR/2008/REC-xml-20081126/#NT-intSubset
            internalSubset = this._lexer.seqUntil("]");
            this._lexer.seq("]");
            this._lexer.whiteSpace();
        }
        this._lexer.seq(">");

        const documentType = new XDocumentType(
            name,
            publicId,
            systemId,
            internalSubset,
        );
        documentType.range.setBegin(pos);
        documentType.range.setEnd(this._lexer.getPosition());

        const {container} = this.top();
        container.children.push(documentType);

        assert(container.nodeType === Constant.XmlNodeType.DOCUMENT);
        if (container.documentType != null) {
            this.failure2(
                "Not allowed multiple document type declaration in XML.",
                pos,
            );

        } else {
            container.documentType = documentType;
        }

    }

    processingInstruction() {
        const pos = this._lexer.getPosition();
        this._lexer.seq("<?");
        const target = this._lexer.name();

        this._processingInstruction(target, pos);
    }

    comment() {
        const pos = this._lexer.getPosition();

        this._lexer.seq("<!--");
        const value = this._lexer.seqUntil("--");
        this._lexer.seq("-->");

        const comment = new XComment(value);
        comment.range.setBegin(pos);
        comment.range.setEnd(this._lexer.getPosition());


        const {container} = this.top();
        container.children.push(comment);
    }

    cData() {
        const pos = this._lexer.getPosition();

        this._lexer.seq("<![CDATA[");
        const value = this._lexer.cData();
        this._lexer.seq("]]>");

        const cData = new XCData(value);
        cData.range.setBegin(pos);
        cData.range.setEnd(this._lexer.getPosition());


        const {container} = this.top();
        container.children.push(cData);
        container.value += value;
    }

    //--------------------------------------------------------------------------

    begin() {
        const ch = this._lexer.peek();
        if (ch === "\uFEFF") {
            this._lexer.next();
        }
        this._state = Constant.State.DOCUMENT_BEGIN;
    }

    documentBegin() {
        const {namespace} = this._option;


        const doc = new XDocument();
        doc.range.setBegin(this._lexer.getPosition());

        if (namespace) {
            this.push({
                container: doc,
                namespaceMap: Constant.ROOT_NAMESPACE_MAP,
            });

        } else {
            this.push({
                container: doc,
            });

        }


        if (this._lexer.peekSeq("<?")) {
            this.declaration();
        }

        this._state = Constant.State.DOCUMENT_BODY;
    }

    documentBody() {

        this._lexer.whiteSpace();

        if (this._lexer.eof()) {
            this._state = Constant.State.DOCUMENT_END;

        } else {

            let container = this.top().container;

            if (this._lexer.peekSeq("<?")) {
                this.processingInstruction();

            } else if (container.documentElement == null
                && this._lexer.peekSeq("<!DOCTYPE")) {

                this.documentType();

            } else if (this._lexer.peekSeq("<!--")) {
                this.comment();

            } else {
                this._state = Constant.State.ELEMENT_BEGIN;

            }
        }
    }

    documentEnd() {
        const {container} = this.pop();
        assert(container.nodeType === Constant.XmlNodeType.DOCUMENT);

        container.range.setEnd(this._lexer.getPosition());
        return container;
    }

    nsElementBegin() {
        const elementPos = this._lexer.getPosition();
        const containerState = this.top();

        this._lexer.seq("<");
        const name = this._lexer.ncName();
        let prefix = null;
        let localName = null;
        if (this._lexer.peekSeq(":")) {
            this._lexer.seq(":");
            prefix = name;
            localName = this._lexer.ncName();
        } else {
            localName = name;
        }

        const {
            container,
            namespaceMap,
        } = containerState;

        const nNamespaceMap = {
            ...namespaceMap,
        };
        const attributes = [];
        const attNameMap = {};
        while (true) {
            const wsStr = this._lexer.whiteSpace();


            if (this._lexer.peekSeq(">")
                || this._lexer.peekSeq("/>")) {


                for (const att of attributes) {
                    const attPrefix = att.name.prefix;

                    const namespace = attPrefix == null
                        ? nNamespaceMap[Constant.DEFAULT_PREFIX]
                        : nNamespaceMap[attPrefix];

                    if (namespace == null) {

                        if (attPrefix != null) {
                            this.failure2(
                                `'${attPrefix}' is an undeclared prefix.`,
                                att.range.getBegin(),
                            );
                        }
                    }

                    att.name.namespace = namespace;
                }


                const namespace = prefix == null
                    ? nNamespaceMap[Constant.DEFAULT_PREFIX]
                    : nNamespaceMap[prefix];

                if (namespace == null) {
                    if (prefix != null) {
                        this.failure2(
                            `'${prefix}' is an undeclared prefix.`,
                            elementPos,
                        );
                    }
                }

                const elem = new XElement(
                    new XName(prefix, localName, namespace),
                    attributes,
                );
                elem.range.setBegin(elementPos);
                elem.openTagRange.setBegin(elementPos);
                container.children.push(elem);

                if (container.nodeType === Constant.XmlNodeType.DOCUMENT) {
                    if (container.documentElement != null) {
                        this.failure2(
                            "Not allowed multiple root elements in XML.",
                            elementPos,
                        );

                    } else {
                        container.documentElement = elem;
                    }
                }


                if (this._lexer.peekSeq(">")) {
                    this._lexer.seq(">");

                    const pos = this._lexer.getPosition();
                    elem.openTagRange.setEnd(pos);

                    this.push({
                        container: elem,
                        namespaceMap: nNamespaceMap,
                    });
                    this._state = Constant.State.ELEMENT_BODY;


                } else {
                    this._lexer.seq("/>");

                    const pos = this._lexer.getPosition();
                    elem.range.setEnd(pos);

                    elem.isEmpty = true;
                    elem.openTagRange.setEnd(pos);
                    elem.closeTagRange.setBegin(elementPos);
                    elem.closeTagRange.setEnd(pos);


                    if (container.nodeType === Constant.XmlNodeType.DOCUMENT) {
                        this._state = Constant.State.DOCUMENT_BODY;

                    } else {
                        container.value += elem.value;
                        this._state = Constant.State.ELEMENT_BODY;
                    }
                }

                break;

            } else {
                const pos = this._lexer.getPosition();
                const name = this._lexer.ncName();

                if (wsStr.length === 0) {
                    this.failure2(`No WhiteSpace before attribute name: '${name}'.`, pos);
                }


                let attPrefix = null;
                let attLocalName = null;
                if (this._lexer.peekSeq(":")) {
                    this._lexer.seq(":");
                    attPrefix = name;
                    attLocalName = this._lexer.ncName();
                } else {

                    if (name === Constant.XMLNS) {
                        attPrefix = name;
                        attLocalName = null;

                    } else {
                        attLocalName = name;
                    }
                }

                this._lexer.whiteSpace();
                this._lexer.seq("=");
                this._lexer.whiteSpace();

                const ch = this._lexer.quote();
                const attValue = this.attValue(ch);
                this._lexer.seq(ch);


                const p = attPrefix == null
                    ? ""
                    : `${attPrefix}:`;
                const n = attLocalName == null
                    ? ""
                    : attLocalName;
                const str = `${p}${n}`;
                if (attNameMap[str]) {
                    this.failure2(`Duplicate attribute name: '${str}'.`, pos);

                } else {
                    attNameMap[str] = true;
                }


                if (attPrefix === Constant.XMLNS) {
                    if (attLocalName === Constant.XMLNS
                        || attLocalName === Constant.XML) {

                        this.failure2(
                            `Prefix '${attLocalName}' is reserved for use by XML.`,
                            pos,
                        );
                    }

                    if (attValue === Constant.XML_NAMESPACE
                        || attValue === Constant.XMLNS_NAMESPACE) {

                        this.failure2(
                            `Prefix '${attLocalName}' can't be mapped to namespace name reserved for 'xml' or 'xmlns'.`,
                            pos,
                        );
                    }

                    if (attLocalName == null) {
                        nNamespaceMap[Constant.DEFAULT_PREFIX] = attValue;

                    } else {
                        nNamespaceMap[attLocalName] = attValue;
                    }
                }


                const attribute = new XAttribute(
                    new XName(
                        attPrefix,
                        attLocalName,
                        null,
                    ),
                    attValue,
                );
                attribute.range.setBegin(pos);
                attribute.range.setEnd(this._lexer.getPosition());
                attributes.push(attribute);
            }
        }
    }

    elementBegin() {
        const elementPos = this._lexer.getPosition();
        const containerState = this.top();

        this._lexer.seq("<");
        const name = this._lexer.name();

        const {
            container,
        } = containerState;


        const attributes = [];
        const attNameMap = {};
        while (true) {


            const wsStr = this._lexer.whiteSpace();

            if (this._lexer.peekSeq(">")
                || this._lexer.peekSeq("/>")) {


                const elem = new XElement(
                    name,
                    attributes,
                );
                elem.range.setBegin(elementPos);
                elem.openTagRange.setBegin(elementPos);
                container.children.push(elem);

                if (container.nodeType === Constant.XmlNodeType.DOCUMENT) {
                    if (container.documentElement != null) {
                        this.failure2(
                            "Not allowed multiple root elements in XML.",
                            elementPos,
                        );

                    } else {
                        container.documentElement = elem;
                    }
                }


                if (this._lexer.peekSeq(">")) {
                    this._lexer.seq(">");

                    const pos = this._lexer.getPosition();
                    elem.openTagRange.setEnd(pos);

                    this.push({
                        container: elem,
                    });
                    this._state = Constant.State.ELEMENT_BODY;


                } else {
                    this._lexer.seq("/>");
                    const pos = this._lexer.getPosition();
                    elem.range.setEnd(pos);

                    elem.isEmpty = true;
                    elem.openTagRange.setEnd(pos);
                    elem.closeTagRange.setBegin(elementPos);
                    elem.closeTagRange.setEnd(pos);


                    if (container.nodeType === Constant.XmlNodeType.DOCUMENT) {
                        this._state = Constant.State.DOCUMENT_BODY;

                    } else {
                        container.value += elem.value;
                        this._state = Constant.State.ELEMENT_BODY;
                    }
                }

                break;

            } else {
                const pos = this._lexer.getPosition();
                const name = this._lexer.name();

                if (wsStr.length === 0) {
                    this.failure2(`No WhiteSpace before attribute name: '${name}'.`, pos);
                }


                this._lexer.whiteSpace();
                this._lexer.seq("=");
                this._lexer.whiteSpace();

                const ch = this._lexer.quote();
                const attValue = this.attValue(ch);
                this._lexer.seq(ch);


                if (attNameMap[name]) {
                    this.failure2(`Duplicate attribute name: '${name}'.`, pos);

                } else {
                    attNameMap[name] = true;
                }


                const attribute = new XAttribute(
                    name,
                    attValue,
                );
                attribute.range.setBegin(pos);
                attribute.range.setEnd(this._lexer.getPosition());
                attributes.push(attribute);
            }
        }
    }

    elementBody() {

        let container = this.top().container;

        while (true) {

            const pos = this._lexer.getPosition();

            if (this._lexer.eof()) {

                const tags = [];
                while (container.nodeType === Constant.XmlNodeType.ELEMENT) {

                    const p = container.name.prefix == null
                        ? ""
                        : `${container.name.prefix}:`;

                    tags.push(`${p}${container.name.localName}`);

                    this.pop();
                    container = this.top().container;
                }

                this.failure(`Unexpected end of file has occurred. The following elements are not closed: ${tags.join(
                    ", ")}. `);


            } else if (this._lexer.peekSeq("<![CDATA[")) {
                this.cData();

            } else if (this._lexer.peekSeq("<!--")) {
                this.comment();

            } else if (this._lexer.peekSeq("<?")) {
                this.processingInstruction();

            } else if (this._lexer.peekSeq("</")) {
                this._state = Constant.State.ELEMENT_END;
                break;

            } else if (this._lexer.peekSeq("<")) {
                this._state = Constant.State.ELEMENT_BEGIN;
                break;

            } else {

                const str = this._lexer.peekSeq("&")
                    ? this.reference()
                    : this.characterData();
                container.value += str;


                const len = container.children.length;
                const lastNode = len > 0
                    ? container.children[len - 1]
                    : null;

                if (lastNode != null
                    && lastNode.nodeType === Constant.XmlNodeType.TEXT) {

                    lastNode.value += str;
                    lastNode.range.setEnd(this._lexer.getPosition());

                } else {
                    const text = new XText(str);
                    text.range.setBegin(pos);
                    text.range.setEnd(this._lexer.getPosition());

                    container.children.push(text);
                }
            }
        }
    }

    nsElementEnd() {
        const pos = this._lexer.getPosition();
        let container = this.top().container;

        this._lexer.seq("</");
        const name = this._lexer.ncName();
        let prefix = null;
        let localName = null;
        if (this._lexer.peekSeq(":")) {
            this._lexer.seq(":");
            prefix = name;
            localName = this._lexer.ncName();
        } else {
            localName = name;
        }
        this._lexer.whiteSpace();
        this._lexer.seq(">");


        if (container.name.prefix !== prefix
            || container.name.localName !== localName) {

            const p1 = container.name.prefix == null
                ? ""
                : `${container.name.prefix}:`;

            const p2 = prefix == null
                ? ""
                : `${prefix}:`;

            const begin = container.range.getBegin();
            this.failure2(
                `Element start tag: '${p1}${container.name.localName}' at Line ${begin.line}, Column ${begin.column} does not match the end tag: '${p2}${localName}'.`,
                pos,
            );

        }

        const posEnd = this._lexer.getPosition();
        container.range.setEnd(posEnd);
        container.closeTagRange.setBegin(pos);
        container.closeTagRange.setEnd(posEnd);


        const value = container.value;
        this.pop();
        container = this.top().container;

        if (container.nodeType === Constant.XmlNodeType.DOCUMENT) {
            this._state = Constant.State.DOCUMENT_BODY;

        } else {
            container.value += value;
            this._state = Constant.State.ELEMENT_BODY;
        }

    }

    elementEnd() {
        const pos = this._lexer.getPosition();
        let container = this.top().container;

        this._lexer.seq("</");
        const name = this._lexer.name();
        this._lexer.whiteSpace();
        this._lexer.seq(">");


        if (container.name !== name) {
            const begin = container.range.getBegin();
            this.failure2(
                `Element start tag: '${container.name}' at Line ${begin.line}, Column ${begin.column} does not match the end tag: '${name}'.`,
                pos,
            );
        }

        const posEnd = this._lexer.getPosition();
        container.range.setEnd(posEnd);
        container.closeTagRange.setBegin(pos);
        container.closeTagRange.setEnd(posEnd);

        const value = container.value;
        this.pop();
        container = this.top().container;

        if (container.nodeType === Constant.XmlNodeType.DOCUMENT) {
            this._state = Constant.State.DOCUMENT_BODY;

        } else {
            container.value += value;
            this._state = Constant.State.ELEMENT_BODY;
        }

    }

    parse() {

        const {namespace} = this._option;

        while (true) {
            switch (this._state) {
                case Constant.State.BEGIN: {
                    this.begin();
                    break;
                }
                case Constant.State.DOCUMENT_BEGIN: {
                    this.documentBegin();
                    break;
                }
                case Constant.State.DOCUMENT_BODY: {
                    this.documentBody();
                    break;
                }
                case Constant.State.ELEMENT_BEGIN: {
                    if (namespace) {
                        this.nsElementBegin();
                    } else {
                        this.elementBegin();
                    }

                    break;
                }
                case Constant.State.ELEMENT_BODY: {
                    this.elementBody();
                    break;
                }
                case Constant.State.ELEMENT_END: {

                    if (namespace) {
                        this.nsElementEnd();
                    } else {
                        this.elementEnd();
                    }

                    break;
                }
                case Constant.State.DOCUMENT_END: {
                    return this.documentEnd();

                    break;
                }
                default: {
                    this.failure(`Not Supported State: ${this._state}.`);
                }
            }
        }
    }
}
