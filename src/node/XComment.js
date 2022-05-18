
import XNode from "./base/XNode";
import Constant from "../constant/Constant";

export default class XComment extends XNode {

    nodeType = Constant.XmlNodeType.COMMENT;

    constructor(value) {
        super();
        this.value = value == null
            ? ""
            : value;
    }

}

