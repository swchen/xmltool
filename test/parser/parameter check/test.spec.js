import chai from "chai";
import fs from "fs/promises";
import path from "path";

import {Parser} from "../../../src";


import xml from "./xml";

const expect = chai.expect;


describe("parameter check", () => {

    it("text: null", async () => {
        expect(() => new Parser(null)).to.throw(`parameter 'text' must be a string. Line 0, column 0.`);
    });


    it("text: '', option: false", async () => {
        expect(() => new Parser("", false)).to.throw(`parameter 'option' must be a string. Line 0, column 0.`);
    });

});

