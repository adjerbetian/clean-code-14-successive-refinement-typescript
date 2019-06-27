import { ArgsException, ErrorCode } from "./ArgsException";
import { ListIterator } from "./utils";

export interface ArgumentMarshaler {
    set(currentArgument: ListIterator<string>): void;
}

export class BooleanArgumentMarshaler implements ArgumentMarshaler {
    private booleanValue: boolean = false;

    set(currentArgument: ListIterator<string>) {
        this.booleanValue = true;
    }

    static getValue(am: ArgumentMarshaler | undefined): boolean {
        if (am && am instanceof BooleanArgumentMarshaler) {
            return am.booleanValue;
        } else {
            return false;
        }
    }
}

export class StringArgumentMarshaler implements ArgumentMarshaler {
    private stringValue: string = "";

    set(currentArgument: ListIterator<string>) {
        try {
            this.stringValue = currentArgument.next();
        } catch (e) {
            throw new ArgsException(ErrorCode.MISSING_STRING, "", null);
        }
    }

    static getValue(am: ArgumentMarshaler | undefined): string {
        if (am && am instanceof StringArgumentMarshaler) {
            return am.stringValue;
        } else {
            return "";
        }
    }
}

export class IntegerArgumentMarshaler implements ArgumentMarshaler {
    private intValue: number = 0;

    set(currentArgument: ListIterator<string>) {
        let parameter: string;

        try {
            parameter = currentArgument.next();
        } catch(e) {
            throw new ArgsException(ErrorCode.MISSING_INTEGER, "", null);
        }
        if (!Number.isInteger(parseInt(parameter, 10))) {
            throw new ArgsException(ErrorCode.INVALID_INTEGER, "", parameter);
        }
        this.intValue = parseInt(parameter, 10);
    }

    static getValue(am: ArgumentMarshaler | undefined): number {
        if (am && am instanceof IntegerArgumentMarshaler) {
            return am.intValue;
        } else {
            return 0;
        }
    }
}
