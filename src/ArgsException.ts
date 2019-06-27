export class ArgsException extends Error {
    private errorArgumentId: string | null = null;
    private errorParameter: string | null = null;
    private errorCode: ErrorCode = ErrorCode.OK;

    constructor(errorCode: ErrorCode, errorArgumentId: string | null, errorParameter: string | null) {
        super();
        this.errorCode = errorCode;
        this.errorParameter = errorParameter;
        this.errorArgumentId = errorArgumentId;
    }

    getErrorArgumentId() {
        return this.errorArgumentId;
    }

    setErrorArgumentId(errorArgumentId: string): void {
        this.errorArgumentId = errorArgumentId;
    }

    getErrorParameter() {
        return this.errorParameter;
    }

    setErrorParameter(errorParameter: string) {
        this.errorParameter = errorParameter;
    }

    getErrorCode() {
        return this.errorCode;
    }

    setErrorCode(errorCode: ErrorCode) {
        this.errorCode = errorCode;
    }

    errorMessage(): string {
        switch (this.errorCode) {
            case ErrorCode.OK:
                return "TILT: Should not get here.";
            case ErrorCode.UNEXPECTED_ARGUMENT:
                return `Argument -${this.errorArgumentId} unexpected.`;
            case ErrorCode.MISSING_STRING:
                return `Could not find string parameter for -${this.errorArgumentId}.`;
            case ErrorCode.INVALID_INTEGER:
                return `Argument ${this.errorArgumentId} expects an integer but was '${this.errorParameter}'.`;
            case ErrorCode.MISSING_INTEGER:
                return `Could not find integer parameter for -${this.errorArgumentId}.`;
            case ErrorCode.INVALID_ARGUMENT_NAME:
                return `'${this.errorArgumentId}' is not a valid argument name.`;
            case ErrorCode.INVALID_ARGUMENT_FORMAT:
                return `'${this.errorParameter}' is not a valid argument format.`;
        }
        return "";
    }
}

export enum ErrorCode {
    OK,
    INVALID_ARGUMENT_FORMAT,
    UNEXPECTED_ARGUMENT,
    INVALID_ARGUMENT_NAME,
    MISSING_STRING,
    MISSING_INTEGER,
    INVALID_INTEGER
}
