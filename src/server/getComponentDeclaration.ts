import TypeScriptLanguageService from "../TypeScriptLanguageService";

import componentDeclarations from "./componentDeclarations";
import convertInternalDeclarationToExternal from "./convertInternalDeclarationToExternal";
import getInternalDeclarationOfSourceFile from "./getInternalDeclarationOfSourceFile";
import parsedRiotDocuments from "./parsedRiotDocuments";
import touchRiotDocument from "./touchRiotDocument";

import { getState } from "./state";

const basicRiotComponentDeclaration = [
    `declare const _default: import("riot").RiotComponent<`,
    `    Record<PropertyKey, any>, Record<PropertyKey, any>`,
    `>;`,
    `export default _default;`
].join("\n");

function getInternalDeclaration(
    filePath: string,
    tsLanguageService: TypeScriptLanguageService
) {
    const parsedRiotDocument = parsedRiotDocuments.get(filePath);
    if (parsedRiotDocument == null) {
        return null;
    }

    if (parsedRiotDocument.result.output.javascript == null) {
        return basicRiotComponentDeclaration;
    }

    tsLanguageService.restrictProgramToScripts(
        [ filePath, `${filePath}.d.ts` ]
    );
    const sourceFile = tsLanguageService.getSourceFile(filePath);
    if (sourceFile == null) {
        tsLanguageService.clearProgramRestriction();
        return basicRiotComponentDeclaration
    }

    const internalDeclaration = getInternalDeclarationOfSourceFile(
        sourceFile, tsLanguageService.getProgram()
    ) || basicRiotComponentDeclaration;
    tsLanguageService.clearProgramRestriction();
    return internalDeclaration;
}

export default function getComponentDeclaration(
    filePath: string,
    getText: () => string,
    type: "INTERNAL" | "EXTERNAL"
): string | null {
    const {
        tsLanguageService
    } = getState();

    touchRiotDocument(filePath, getText);

    let internalDeclaration: string | null = null;
    if (componentDeclarations.has(filePath)) {
        const {
            internal,
            external
        } = componentDeclarations.get(filePath)!;
        if (type === "INTERNAL") {
            return internal;
        }
        if (type === "EXTERNAL" && external != null) {
            return external;
        }
        internalDeclaration = internal;
    }

    if (internalDeclaration == null) {
        internalDeclaration = getInternalDeclaration(
            filePath, tsLanguageService
        );
    }

    if (internalDeclaration == null) {
        return null;
    }

    const componentDeclaration = componentDeclarations.get(filePath) || {
        internal: internalDeclaration,
        external: null
    };
    componentDeclaration.internal = internalDeclaration;

    if (type == "INTERNAL") {
        componentDeclarations.set(filePath, componentDeclaration);
        return internalDeclaration;
    }

    const externalDeclaration = convertInternalDeclarationToExternal(
        internalDeclaration
    );

    componentDeclaration.external = externalDeclaration;
    componentDeclarations.set(filePath, componentDeclaration);

    return externalDeclaration;
}