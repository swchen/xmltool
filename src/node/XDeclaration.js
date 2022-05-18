
import XObject from "./base/XObject";
import Constant from "../constant/Constant";

export default class XDeclaration extends XObject {

    nodeType = Constant.XmlNodeType.XML_DECLARATION;

    constructor(version, encoding, standalone) {
        super();

        this.version = version;
        this.encoding = encoding;
        this.standalone = standalone;
    }
}
