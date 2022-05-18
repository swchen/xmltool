import chai from "chai";
import fs from "fs/promises";
import path from "path";

import {Parser} from "../../src";


import xml from "./form.xml";

const expect = chai.expect;


describe("", () => {

    describe("form", () => {

        it("parse option namespace: true", async () => {
            const text = await fs.readFile(
                path.join(process.cwd(), "test/parser/form.namespace.json"),
                {
                    encoding: "utf8",
                    flag: "r",
                },
            );
            const json = JSON.parse(text);


            const doc = new Parser(xml).parse();

            expect(doc).to.deep.equal(json);
        });


        it("parse option namespace: false", async () => {

            const text = await fs.readFile(
                path.join(process.cwd(), "test/parser/form.json"),
                {
                    encoding: "utf8",
                    flag: "r",
                },
            );
            const json = JSON.parse(text);

            const doc = new Parser(xml, {namespace: false}).parse();
            expect(doc).to.deep.equal(json);
        });
    });

});

