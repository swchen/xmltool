import XContainer from "./base/XContainer";
import Constant from "../constant/Constant";
import Range from "./base/Range";


export default class XElement extends XContainer {

    nodeType = Constant.XmlNodeType.ELEMENT;

    constructor(name, attributes) {
        super();
        this.name = name;
        this.attributes = attributes;

        this.value = "";

        this.isEmpty = false;
        this.openTagRange = new Range();
        this.closeTagRange = new Range();

    }
}
