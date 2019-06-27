import { Character, HashMap } from "./utils";

export class Args {
    private schema: string;
    private args: string[];
    private valid: boolean;
    private unexpectedArguments = new Set<string>();
    private booleanArgs: HashMap<boolean> = {};
    private numberOfArguments: number = 0;

    constructor (schema: string, args: string[]) {
        this.schema = schema;
        this.args = args;
        this.valid = this.parse();
    }

    isValid() {
        return this.valid;
    }

    private parse(): boolean {
        if (this.schema.length === 0 && this.args.length === 0)
            return true;
        this.parseSchema();
        this.parseArguments();
        return this.unexpectedArguments.size === 0;
    }

    private parseSchema(): boolean {
        for (const element of this.schema.split(",")) {
            this.parseSchemaElement(element);
        }
        return true;
    }

    private parseSchemaElement(element: string) {
        if (element.length === 1) {
            this.parseBooleanSchemaElement(element);
        }
    }

    private parseBooleanSchemaElement(element: string) {
        const c = element.charAt(0);
        if (Character.isLetter(c)) {
            this.booleanArgs[c] = false;
        }
    }

    private parseArguments(): boolean {
        for (const arg of this.args) {
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
        if (this.isBoolean(argChar)) {
            this.numberOfArguments++;
            this.setBooleanArg(argChar, true);
        } else
            this.unexpectedArguments.add(argChar);
    }

    private isBoolean(argChar: string) {
        return this.booleanArgs.hasOwnProperty(argChar);
    }

    private setBooleanArg(argChar: string, value: boolean) {
        this.booleanArgs[argChar] = value;
    }

    cardinality() {
        return this.numberOfArguments;
    }

    usage() {
        if (this.schema.length > 0)
            return "-["+this.schema+"]";
        else
            return "";
    }

    errorMessage() {
        if (this.unexpectedArguments.size > 0) {
            return this.unexpectedArgumentMessage();
        } else
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
        return !! this.booleanArgs[arg];
    }
}
