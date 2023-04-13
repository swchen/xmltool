import chai from "chai";
import fs from "fs/promises";
import path from "path";

import {Parser} from "../../../src";


import xml from "./xml";

const expect = chai.expect;


describe("No WhiteSpace Before Attribute1", () => {

    it("parse option namespace: true", async () => {

        expect(() => new Parser(xml).parse()).to.throw(`No WhiteSpace before attribute name: 'padding'. Line 7, column 23.`);

    });


    it("parse option namespace: false", async () => {
        expect(() => new Parser(xml, {namespace: false}).parse()).to.throw(`No WhiteSpace before attribute name: 'padding'. Line 7, column 23.`);
    });
});

