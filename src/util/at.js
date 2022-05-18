function at(text, index) {

    if (text == null) {
        return "";

    } else {
        const cp = text.codePointAt(index);
        if (cp == null) {
            return "";
        } else {
            return String.fromCodePoint(cp);
        }
    }
}


export default at;
