import XContainer from "./base/XContainer";
import Constant from "../constant/Constant";

export default class XDocument extends XContainer {

    nodeType = Constant.XmlNodeType.DOCUMENT;

    constructor() {
        super();

        this.documentElement = null;
        this.documentType = null;
    }
}
