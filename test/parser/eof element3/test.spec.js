import chai from "chai";
import fs from "fs/promises";
import path from "path";

import {Parser} from "../../../src";


import xml from "./xml";

const expect = chai.expect;

describe("EOF in element tag3", () => {

    it("parse option namespace: false", async () => {
        expect(() => new Parser(xml).parse()).to.throw(`'x' is an unexpected token. Excepting: '>'. Line 7, column 8.`);
    });


    it("parse option namespace: true", async () => {
        expect(() => new Parser(xml, {namespace: true}).parse()).to.throw(`'x' is an unexpected token. Excepting: '>'. Line 7, column 8.`);
    });



});


