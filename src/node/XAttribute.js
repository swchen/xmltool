
import XObject from "./base/XObject";
import Constant from "../constant/Constant";

export default class XAttribute extends XObject {

    nodeType = Constant.XmlNodeType.ATTRIBUTE;

    constructor(name, value) {
        super();
        this.name = name;
        this.value = value;
    }
}

