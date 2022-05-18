
import XNode from "./base/XNode";
import Constant from "../constant/Constant";

export default class XDocumentType extends XNode {

    nodeType = Constant.XmlNodeType.DOCUMENT_TYPE;

    constructor(name, publicId, systemId, internalSubset) {
        super();

        this.name = name;
        this.publicId = publicId;
        this.systemId = systemId;
        this.internalSubset = internalSubset;
    }
}


