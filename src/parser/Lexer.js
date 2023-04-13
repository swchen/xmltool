import at from "../util/at";
import Constant from "../constant/Constant";
import XmlException from "../exception/XmlException";

export default class Lexer {

    constructor(text) {
        this._text = text;

        this._offset = 0;
        this._column = 1;
        this._line = 1;
    }

    getPosition() {
        return {
            offset: this._offset,
            line: this._line,
            column: this._column,
        };
    }

    //--------------------------------------------------------------------------


    failure(message) {
        throw new XmlException(message, this._line, this._column);
    }

    peekN(num) {
        return at(this._text, this._offset + num);
    }

    peek() {
        return this.peekN(0);
    }

    eof() {
        return this.peek() === "";
    }


    next() {
        const ch = this.peek();

        if (ch == null) {
            return null;

        } else {
            this._offset += 1;
            if (ch === `\n`) {
                this._column = 1;
                this._line += 1;
            } else {
                this._column += 1;
            }

            return ch;
        }
    }

    //--------------------------------------------------------------------------


    peekSeq(s) {
        if (s == null || s === "") {
            return true;

        } else {

            const len = s.length;
            for (let i = 0; i < len; i += 1) {
                if (this.peekN(i) !== s[i]) {
                    return false;
                }
            }

            return true;
        }

    }

    //--------------------------------------------------------------------------

    satisfy(f, name) {
        const ch = this.peek();
        if (f(ch)) {
            return this.next();
        } else {
            this.failure(`'${ch}' is an unexpected token. Excepting: '${name}'.`);
        }
    }

    one(ch) {
        return this.satisfy(c => c === ch, ch);
    }

    seq(s) {
        for (const ch of s) {
            this.one(ch);
        }

        return s;
    }


    seqUntil(s) {

        let rst = "";
        while (true) {

            if (this.peekSeq(s)) {
                break;

            } else {
                const ch = this.peek();
                if (ch != null) {
                    rst += this.next();

                } else {
                    break;
                }
            }
        }

        return rst;


    }


    oneRe(re, name) {
        return this.satisfy(
            ch => re.test(ch),
            name != null
                ? name
                : re.toString(),
        );
    }

    // Zero or more
    manyRe(re, name) {
        let s = "";
        while (true) {
            const ch = this.peek();
            if (re.test(ch)) {
                s += this.next();

            } else {
                break;
            }
        }

        return s;
    }


    manyReUntil(re, s) {
        let rst = "";
        while (true) {

            if (this.peekSeq(s)) {
                break;

            } else {
                const ch = this.peek();

                if (re.test(ch)) {
                    rst += this.next();

                } else {
                    break;
                }
            }
        }

        return rst;
    }


    // One or more
    someRe(re, name) {
        const s = this.manyRe(re, name);
        if (s.length > 0) {
            return s;
        } else {
            this.failure(`No Match RegExp Plus. Excepting: '${name != null
                ? name
                : re}+'.`);
        }
    }

    //--------------------------------------------------------------------------

    whiteSpace() {
        return this.manyRe(Constant.NameReMap.WHITE_SPACE, "WhiteSpace");
    }

    name() {
        return this.oneRe(
                Constant.NameReMap.NAME_START_CHAR,
                "NameStartChar",
            )
            + this.manyRe(
                Constant.NameReMap.NAME_CHAR,
                "NameChar",
            );
    }

    ncName() {
        return this.oneRe(
                Constant.NameReMap.NCNAME_START_CHAR,
                "NCNameStartChar",
            )
            + this.manyRe(
                Constant.NameReMap.NCNAME_CHAR,
                "NCNameChar",
            );
    }


    number() {
        return this.someRe(Constant.NameReMap.DIGIT, "Digit");
    }

    hexNumber() {
        return this.someRe(Constant.NameReMap.HEX_DIGIT, "HexDigit");
    }


    encodingName() {
        return this.oneRe(/[A-Za-z]/, "EncodingNameStartChar")
            + this.manyRe(
                /[A-Za-z0-9._-]/,
                "EncodingNameChar",
            );

    }


    publicIdInDoubleQuote() {
        return this.manyRe(
            /[\u0020\u000D\u000Aa-zA-Z0-9-'()+,./:=?;!*#@$_%]/,
            "PublicIdLiteral",
        );

    }

    publicIdInSingleQuote() {
        return this.manyRe(
            /[\u0020\u000D\u000Aa-zA-Z0-9-()+,./:=?;!*#@$_%]/,
            "PublicIdLiteral",
        );

    }

    quote() {
        return this.oneRe(Constant.NameReMap.QUOTE, "QUOTE");
    }

    cData() {
        return this.manyReUntil(Constant.NameReMap.CHAR, "]]>");
    }

}
