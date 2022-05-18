export default class XmlException extends Error {
    constructor(message, line, column) {
        super(`${message} Line ${line}, column ${column}.`);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, XmlException);
        }

        this.line = line;
        this.column = column;
    }

}
