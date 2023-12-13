import chai from "chai";
import fs from "fs/promises";
import path from "path";

import {Parser} from "../../../src";


import xml from "./xml";

const expect = chai.expect;


describe("EOF at attribute value", () => {

    it("parse option namespace: false", async () => {
        expect(() => new Parser(xml).parse()).to.throw(`Unexpected end of file has occurred. The attribute value is not complete. Line 6, column 49.`);
    });


    it("parse option namespace: true", async () => {
        expect(() => new Parser(xml, {namespace: true}).parse()).to.throw(`Unexpected end of file has occurred. The attribute value is not complete. Line 6, column 49.`);
    });



});


