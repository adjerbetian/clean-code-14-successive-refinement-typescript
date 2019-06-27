import { expect } from "chai";
import { Args, ParseException } from "./Args";

describe("Args", () => {
    it("testCreateWithNoSchemaOrArguments", () => {
        const args = new Args("", []);
        expect(args.cardinality()).to.equal(0);
    });

    it("testWithNoSchemaButWithOneArgument", () => {
        const args = new Args("", ["-x"]);

        expect(args.errorMessage()).to.equal("Argument(s) -x unexpected.");
    });

    it("testWithNoSchemaButWithMultipleArguments", () => {
        const args = new Args("", ["-x", "-y"]);

        expect(args.errorMessage()).to.equal("Argument(s) -xy unexpected.");
    });

    it("testNonLetterSchema", () => {
        try {
            new Args("*", []);
            fail();
        } catch(e) {
            expect(e).to.be.an.instanceOf(ParseException);
            expect(e.message).to.equal("Bad character: * in Args format: *");
        }
    });

    it("testInvalidArgumentFormat", () => {
        try {
            new Args("f~", []);
            fail();
        } catch (e) {
            expect(e).to.be.an.instanceOf(ParseException);
            expect(e.message).to.equal("Argument: f has invalid format: ~.");
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
        const args = new Args("x*", ["-x"]);

        expect(args.errorMessage()).to.equal("Could not find string parameter for -x.");
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
        const args = new Args("x#", ["-x", "Forty two"]);

        expect(args.errorMessage()).to.equal("Argument -x expects an integer but was 'Forty two'.");
    });

    it("testMissingInteger", () => {
        const args = new Args("x#", ["-x"]);

        expect(args.errorMessage()).to.equal("Could not find integer parameter for -x.");
    });
});

function fail(message: string = "should not reach") {
    throw Error(message);
}
