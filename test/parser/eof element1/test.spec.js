import chai from "chai";
import fs from "fs/promises";
import path from "path";

import {Parser} from "../../../src";


import xml from "./xml";

const expect = chai.expect;

describe("EOF in element tag1", () => {

    it("parse option namespace: false", async () => {
        expect(() => new Parser(xml).parse()).to.throw(`Unexpected end of file has occurred. The element 'form' tag is not complete. Line 7, column 1.`);
    });


    it("parse option namespace: true", async () => {
        expect(() => new Parser(xml, {namespace: true}).parse()).to.throw(`Unexpected end of file has occurred. The element 'form' tag is not complete. Line 7, column 1.`);
    });



});


