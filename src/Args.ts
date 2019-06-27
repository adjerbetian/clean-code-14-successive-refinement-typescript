import { ArgsException, ErrorCode } from "./ArgsException";
import {
    ArgumentMarshaler,
    BooleanArgumentMarshaler,
    IntegerArgumentMarshaler,
    StringArgumentMarshaler
} from "./Marhalers";
import { Character, HashMap, List, ListIterator } from "./utils";

export class Args {
    private marshalers: HashMap<ArgumentMarshaler>;
    private argsFound: Set<string>;
    private currentArgument: ListIterator<string>;

    constructor(schema: string, args: string[]) {
        this.marshalers = {};
        this.argsFound = new Set<string>();
        this.parseSchema(schema);
        this.parseArgumentStrings(new List(args));
    }

    private parseSchema(schema: string) {
        for (const element of schema.split(",")) {
            if (element.length > 0) {
                this.parseSchemaElement(element.trim());
            }
        }
    }

    private parseSchemaElement(element: string) {
        const elementId = element.charAt(0);
        const elementTail = element.substring(1);
        this.validateSchemaElementId(elementId);

        if (elementTail.length === 0) {
            this.marshalers[elementId] = new BooleanArgumentMarshaler();
        } else if (elementTail === "*") {
            this.marshalers[elementId] = new StringArgumentMarshaler();
        } else if (elementTail === "#") {
            this.marshalers[elementId] = new IntegerArgumentMarshaler();
        } else {
            throw new ArgsException(ErrorCode.INVALID_ARGUMENT_FORMAT, elementId, elementTail);
        }
    }

    private validateSchemaElementId(elementId: string) {
        if (!Character.isLetter(elementId)) {
            throw new ArgsException(ErrorCode.INVALID_ARGUMENT_NAME, elementId, null);
        }
    }

    private parseArgumentStrings(argsList: List<string>) {
        for (this.currentArgument = argsList.listIterator(); this.currentArgument.hasNext(); ) {
            const argString = this.currentArgument.next();
            if (argString.startsWith("-")) {
                this.parseArgumentCharacters(argString.substring(1));
            } else {
                this.currentArgument.previous();
                break;
            }
        }
    }

    private parseArgumentCharacters(argChars: string) {
        for (const argChar of argChars) {
            this.parseArgumentCharacter(argChar);
        }
    }

    private parseArgumentCharacter(argChar: string) {
        const m = this.marshalers[argChar];
        if (!m) {
            throw new ArgsException(ErrorCode.UNEXPECTED_ARGUMENT, argChar, null);
        } else {
            this.argsFound.add(argChar);
            try {
                m.set(this.currentArgument);
            } catch (e) {
                e.setErrorArgumentId(argChar);
                throw e;
            }
        }
    }

    has(arg: string): boolean {
        return this.argsFound.has(arg);
    }

    nextArgument(): number {
        return this.currentArgument.nextIndex();
    }

    getBoolean(arg: string): boolean {
        return BooleanArgumentMarshaler.getValue(this.marshalers[arg]);
    }

    getString(arg: string): string {
        return StringArgumentMarshaler.getValue(this.marshalers[arg]);
    }

    getInt(arg: string): number {
        return IntegerArgumentMarshaler.getValue(this.marshalers[arg]);
    }

    cardinality(): number {
        return this.argsFound.size;
    }
}
