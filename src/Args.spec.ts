import { expect } from "chai";
import { Args } from "./Args";
import { ArgsException, ErrorCode } from "./ArgsException";

describe("Args", () => {
    it("testCreateWithNoSchemaOrArguments", () => {
        const args = new Args("", []);
        expect(args.cardinality()).to.equal(0);
    });

    it("testWithNoSchemaButWithOneArgument", () => {
        try {
            new Args("", ["-x"]);
            fail();
        } catch (e) {
            if (!(e instanceof ArgsException)) throw e;

            expect(e).to.be.an.instanceOf(ArgsException);
            expect(e.getErrorCode()).to.equal(ErrorCode.UNEXPECTED_ARGUMENT);
            expect(e.getErrorArgumentId()).to.equal("x");
        }
    });

    it("testWithNoSchemaButWithMultipleArguments", () => {
        try {
            new Args("", ["-x", "-y"]);
            fail();
        } catch (e) {
            if (!(e instanceof ArgsException)) throw e;

            expect(e).to.be.an.instanceOf(ArgsException);
            expect(e.getErrorCode()).to.equal(ErrorCode.UNEXPECTED_ARGUMENT);
            expect(e.getErrorArgumentId()).to.equal("x");
        }
    });

    it("testNonLetterSchema", () => {
        try {
            new Args("*", []);
            fail("Args constructor should have thrown exception");
        } catch (e) {
            if (!(e instanceof ArgsException)) throw e;

            expect(e.getErrorCode()).to.equal(ErrorCode.INVALID_ARGUMENT_NAME);
            expect(e.getErrorArgumentId()).to.equal("*");
        }
    });

    it("testInvalidArgumentFormat", () => {
        try {
            new Args("f~", []);
            fail("Args constructor should have thrown exception");
        } catch (e) {
            if (!(e instanceof ArgsException)) throw e;

            expect(e.getErrorCode()).to.equal(ErrorCode.INVALID_ARGUMENT_FORMAT);
            expect(e.getErrorArgumentId()).to.equal("f");
        }
    });

    it("testSimpleBooleanPresent", () => {
        const args = new Args("x", ["-x"]);
        expect(args.cardinality()).to.equal(1);
        expect(args.getBoolean("x")).to.be.true;
    });

    it("testSimpleStringPresent", () => {
        const args = new Args("x*", ["-x", "param"]);
        expect(args.cardinality()).to.equal(1);
        expect(args.has("x")).to.be.true;
        expect(args.getString("x")).to.equal("param");
    });

    it("testMissingStringArgument", () => {
        try {
            new Args("x*", ["-x"]);
            fail();
        } catch (e) {
            if (!(e instanceof ArgsException)) throw e;

            expect(e.getErrorCode()).to.equal(ErrorCode.MISSING_STRING);
            expect(e.getErrorArgumentId()).to.equal("x");
        }
    });

    it("testSpacesInFormat", () => {
        const args = new Args("x, y", ["-xy"]);
        expect(args.cardinality()).to.equal(2);
        expect(args.has("x")).to.be.true;
        expect(args.has("y")).to.be.true;
    });

    it("testSimpleIntPresent", () => {
        const args = new Args("x#", ["-x", "42"]);
        expect(args.cardinality()).to.equal(1);
        expect(args.has("x")).to.be.true;
        expect(args.getInt("x")).to.equal(42);
    });

    it("testInvalidInteger", () => {
        try {
            new Args("x#", ["-x", "Forty two"]);
            fail();
        } catch (e) {
            if (!(e instanceof ArgsException)) throw e;

            expect(e.getErrorCode()).to.equal(ErrorCode.INVALID_INTEGER);
            expect(e.getErrorArgumentId()).to.equal("x");
            expect(e.getErrorParameter()).to.equal("Forty two");
        }
    });

    it("testMissingInteger", () => {
        try {
            new Args("x#", ["-x"]);
            fail();
        } catch (e) {
            if (!(e instanceof ArgsException)) throw e;

            expect(e.getErrorCode()).to.equal(ErrorCode.MISSING_INTEGER);
            expect(e.getErrorArgumentId()).to.equal("x");
        }
    });

    // it("testSimpleDoublePresent", () => {
    //     const args = new Args("x##", ["-x", "42.3"]);
    //     expect(args.cardinality()).to.equal(1);
    //     expect(args.has("x")).to.be.true;
    //     expect(args.getDouble("x")).to.equal(42.3);
    // });
    //
    // it("testInvalidDouble", () => {
    //     try {
    //         new Args("x##", ["-x", "Forty two"]);
    //         fail();
    //     } catch (e) {
    //         if (!(e instanceof ArgsException)) throw e;
    //
    //         expect(e.getErrorCode()).to.equal(ErrorCode.INVALID_DOUBLE);
    //         expect(e.getErrorArgumentId()).to.equal("x");
    //         expect(e.getErrorParameter()).to.equal("Forty two");
    //     }
    // });
    //
    // it("testMissingDouble", () => {
    //     try {
    //         new Args("x##", ["-x"]);
    //         fail();
    //     } catch (e) {
    //         if (!(e instanceof ArgsException)) throw e;
    //
    //         expect(e.getErrorCode()).to.equal(ErrorCode.MISSING_DOUBLE);
    //         expect(e.getErrorArgumentId()).to.equal("x");
    //     }
    // });
});

function fail(message: string = "should not reach") {
    throw Error(message);
}
