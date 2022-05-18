import XNode from "./base/XNode";
import Constant from "../constant/Constant";


export default class XProcessingInstruction extends XNode {

    nodeType = Constant.XmlNodeType.PROCESSING_INSTRUCTION;

    constructor(target, data) {
        super();
        this.target = target;
        this.data = data;
    }
}



