import chai from "chai";
import fs from "fs/promises";
import path from "path";

import {Parser} from "../../../src";


import xml from "./xml";

const expect = chai.expect;


describe("No WhiteSpace Before Attribute2", () => {


    it("parse option namespace: false", async () => {
        expect(() => new Parser(xml).parse()).to.throw(`No WhiteSpace before attribute name: 'border'. Line 8, column 23.`);
    });

    it("parse option namespace: true", async () => {

        expect(() => new Parser(xml, {namespace: true}).parse()).to.throw(`No WhiteSpace before attribute name: 'border'. Line 8, column 23.`);

    });


});

