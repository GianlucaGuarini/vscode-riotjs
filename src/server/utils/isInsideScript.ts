import ParserResult from "./riot-parser/ParserResult";
import isOffsetInNode from "./isOffsetInNode";

export default function isInsideScript(
    offset: number,
    parsedDocument: ParserResult
) {
    const { output: { javascript } } = parsedDocument;
    if (javascript == null || javascript.text == null) {
        return false;
    }
    return isOffsetInNode(offset, javascript.text);
}