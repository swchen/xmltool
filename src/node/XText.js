import XNode from "./base/XNode";
import Constant from "../constant/Constant";

export default class XText extends XNode {

    nodeType = Constant.XmlNodeType.TEXT;

    constructor(value) {
        super();
        this.value = value == null
            ? ""
            : value;
    }
}
