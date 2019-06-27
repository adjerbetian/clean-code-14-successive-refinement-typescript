import { Character, HashMap } from "./utils";

export class Args {
    private schema: string;
    private args: string[];
    private valid: boolean = true;
    private unexpectedArguments = new Set<string>();
    private booleanArgs: HashMap<boolean> = {};
    private stringArgs: HashMap<string> = {};
    private argsFound = new Set<string>();
    private currentArgument: number;
    private errorArgument: string = "";
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
        this.parseArguments();
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
    }

    private validateSchemaElementId(elementId: string) {
        if (!Character.isLetter(elementId)) {
            throw new ParseException(`Bad character: ${elementId} in Args format: ${this.schema}`);
        }
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

    private parseBooleanSchemaElement(elementId: string) {
        this.booleanArgs[elementId] = false;
    }

    private parseArguments() {
        for (this.currentArgument = 0; this.currentArgument < this.args.length; this.currentArgument++) {
            const arg = this.args[this.currentArgument];
            this.parseArgument(arg);
        }
        return true;
    }

    private parseArgument(arg: string) {
        if (arg.startsWith("-")) {
            this.parseElements(arg);
        }
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
            this.valid = false;
        }
    }

    private setArgument(argChar: string) {
        let set = true;
        if (this.isBoolean(argChar))
            this.setBooleanArg(argChar, true);
        else if (this.isString(argChar))
            this.setStringArg(argChar);
        else
            set = false;
        return set;
    }

    private setStringArg(argChar: string) {
        this.currentArgument++;
        if(this.currentArgument >= this.args.length) {
            this.valid = false;
            this.errorArgument = argChar;
            this.errorCode = ErrorCode.MISSING_STRING;
            return;
        }
        this.stringArgs[argChar] = this.args[this.currentArgument];
    }

    private isString(argChar: string) {
        return this.stringArgs.hasOwnProperty(argChar);
    }

    private setBooleanArg(argChar: string, value: boolean) {
        this.booleanArgs[argChar] = value;
    }

    private isBoolean(argChar: string) {
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
        if (this.unexpectedArguments.size > 0) {
            return this.unexpectedArgumentMessage();
        } else
            switch (this.errorCode) {
                case ErrorCode.MISSING_STRING:
                    return `Could not find string parameter for -${this.errorArgument}.`;
                case ErrorCode.OK:
                    throw new Error("TILT: Should not get here.");
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

    getBoolean(arg: string) {
        return this.falseIfNull(this.booleanArgs[arg]);
    }

    private falseIfNull(b: boolean | undefined) {
        return !! b;
    }

    getString(arg: string) {
        return this.blankIfNull(this.stringArgs[arg]);
    }

    private blankIfNull(s: string | undefined) {
        return s || "";
    }

    has(arg: string) {
        return this.argsFound.has(arg);
    }

    isValid() {
        return this.valid;
    }
}

enum ErrorCode {
    OK, MISSING_STRING
}

export class ParseException extends Error {
}
