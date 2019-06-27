import { Character, HashMap } from "./utils";

export class Args {
    private schema: string;
    private args:string[];
    private valid: boolean = true;
    private unexpectedArguments = new Set<string>();
    private booleanArgs: HashMap<boolean> = {};
    private stringArgs: HashMap<string> = {};
    private intArgs: HashMap<number> = {};
    private argsFound = new Set<string>();
    private currentArgument: number;
    private errorArgumentId: string = "";
    private errorParameter: string = "TILT";
    private errorCode: ErrorCode = ErrorCode.OK;

    constructor(schema: string, args: string[]) {
        this.schema = schema;
        this.args = args;
        this.valid = this.parse();
    }

    private parse(): boolean {
        if (this.schema.length === 0 && this.args.length === 0)
            return true;
        this.parseSchema();
        try {
            this.parseArguments();
        } catch (e) {
            if(! (e instanceof ArgsException)) {
                throw e;
            }
        }
        return this.valid;
    }

    private parseSchema(): boolean {
        for (const element of this.schema.split(",")) {
            if (element.length > 0) {
                const trimmedElement = element.trim();
                this.parseSchemaElement(trimmedElement);
            }
        }
        return true;
    }

    private parseSchemaElement(element: string) {
        const elementId = element.charAt(0);
        const elementTail = element.substring(1);
        this.validateSchemaElementId(elementId);
        if (this.isBooleanSchemaElement(elementTail))
            this.parseBooleanSchemaElement(elementId);
        else if (this.isStringSchemaElement(elementTail))
            this.parseStringSchemaElement(elementId);
        else if (this.isIntegerSchemaElement(elementTail)) {
            this.parseIntegerSchemaElement(elementId);
        } else {
            throw new ParseException(`Argument: ${elementId} has invalid format: ${elementTail}.`);
        }
    }

    private validateSchemaElementId(elementId: string) {
        if (!Character.isLetter(elementId)) {
            throw new ParseException(`Bad character: ${elementId} in Args format: ${this.schema}`);
        }
    }

    private parseBooleanSchemaElement(elementId: string) {
        this.booleanArgs[elementId] = false;
    }

    private parseIntegerSchemaElement(elementId: string) {
        this.intArgs[elementId] = 0;
    }

    private parseStringSchemaElement(elementId: string) {
        this.stringArgs[elementId] = "";
    }

    private isStringSchemaElement(elementTail: string) {
        return elementTail === "*";
    }

    private isBooleanSchemaElement(elementTail: string) {
        return elementTail.length === 0;
    }

    private isIntegerSchemaElement(elementTail: string) {
        return elementTail === "#";
    }

    private parseArguments(): boolean {
        for (this.currentArgument = 0; this.currentArgument < this.args.length; this.currentArgument++) {
            const arg = this.args[this.currentArgument];
            this.parseArgument(arg);
        }
        return true;
    }

    private parseArgument(arg: string) {
        if (arg.startsWith("-"))
            this.parseElements(arg);
    }

    private parseElements(arg: string) {
        for (let i = 1; i < arg.length; i++) {
            this.parseElement(arg.charAt(i));
        }
    }

    private parseElement(argChar: string) {
        if (this.setArgument(argChar))
            this.argsFound.add(argChar);
        else {
            this.unexpectedArguments.add(argChar);
            this.errorCode = ErrorCode.UNEXPECTED_ARGUMENT;
            this.valid = false;
        }
    }

    private setArgument(argChar: string) {
        if (this.isBooleanArg(argChar))
            this.setBooleanArg(argChar, true);
        else if (this.isStringArg(argChar))
            this.setStringArg(argChar);
        else if (this.isIntArg(argChar))
            this.setIntArg(argChar);
        else
            return false;
        return true;
    }

    private isIntArg(argChar: string) {
        return this.intArgs.hasOwnProperty(argChar);
    }

    private setIntArg(argChar: string) {
        this.currentArgument++;
        let parameter: string;

        if(this.currentArgument >= this.args.length) {
            this.valid = false;
            this.errorArgumentId = argChar;
            this.errorCode = ErrorCode.MISSING_INTEGER;
            throw new ArgsException();
        }

        parameter = this.args[this.currentArgument];

        if(! Number.isInteger(parseInt(parameter, 10))) {
            this.valid = false;
            this.errorArgumentId = argChar;
            this.errorParameter = parameter;
            this.errorCode = ErrorCode.INVALID_INTEGER;
            throw new ArgsException();
        }

        this.intArgs[argChar] = parseInt(parameter, 10);
    }

    private setStringArg(argChar: string) {
        this.currentArgument++;
        if(this.currentArgument >= this.args.length) {
            this.valid = false;
            this.errorArgumentId = argChar;
            this.errorCode = ErrorCode.MISSING_STRING;
            throw new ArgsException();
        }
        this.stringArgs[argChar] = this.args[this.currentArgument];
    }

    private isStringArg(argChar: string) {
        return this.stringArgs.hasOwnProperty(argChar);
    }

    private setBooleanArg(argChar: string, value: boolean) {
        this.booleanArgs[argChar] = value;
    }

    private isBooleanArg(argChar: string) {
        return this.booleanArgs.hasOwnProperty(argChar);
    }

    cardinality() {
        return this.argsFound.size;
    }

    usage() {
        if (this.schema.length > 0)
            return "-[" + this.schema + "]";
        else
            return "";
    }

    errorMessage() {
        switch (this.errorCode) {
            case ErrorCode.OK:
                throw new Error("TILT: Should not get here.");
            case ErrorCode.UNEXPECTED_ARGUMENT:
                return this.unexpectedArgumentMessage();
            case ErrorCode.MISSING_STRING:
                return `Could not find string parameter for -${this.errorArgumentId}.`;
            case ErrorCode.INVALID_INTEGER:
                return `Argument -${this.errorArgumentId} expects an integer but was '${this.errorParameter}'.`;
            case ErrorCode.MISSING_INTEGER:
                return `Could not find integer parameter for -${this.errorArgumentId}.`;
        }
        return "";
    }

    private unexpectedArgumentMessage() {
        let message = "Argument(s) -";
        for (const c of this.unexpectedArguments) {
            message += c;
        }
        message += " unexpected.";
        return message;
    }

    private falseIfNull(b: boolean | undefined) {
        return !! b;
    }

    private zeroIfNull(i: number | undefined) {
        return i || 0;
    }

    private blankIfNull(s: string | undefined) {
        return s || "";
    }

    getString(arg: string): string {
        return this.blankIfNull(this.stringArgs[arg]);
    }

    getInt(arg: string): number {
        return this.zeroIfNull(this.intArgs[arg]);
    }

    getBoolean(arg: string): boolean {
        return this.falseIfNull(this.booleanArgs[arg]);
    }

    has(arg: string): boolean  {
        return this.argsFound.has(arg);
    }

    isValid(): boolean  {
        return this.valid;
    }
}

enum ErrorCode {
    OK, MISSING_STRING, MISSING_INTEGER, INVALID_INTEGER, UNEXPECTED_ARGUMENT
}

class ArgsException extends Error {
}

export class ParseException extends Error {
}
