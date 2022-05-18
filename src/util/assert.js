function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assert error.");
    }
}

export default assert;
