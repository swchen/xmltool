export default class XmlException extends Error {
    constructor(message, line, column) {
        super(`${message} Line ${line}, column ${column}.`);
        
        this.line = line;
        this.column = column;
    }

}
