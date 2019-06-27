import { expect } from "chai";
import { Args } from "./Args";

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

    it("testSimpleBooleanPresent", () => {
        const args = new Args("x", ["-x"]);
        expect(args.cardinality()).to.equal(1);
        expect(args.getBoolean("x")).to.be.true;
    });

    it("testTwoBooleanPresent", () => {
        const args = new Args("x,y", ["-xy"]);
        expect(args.cardinality()).to.equal(2);
        expect(args.getBoolean("x")).to.be.true;
        expect(args.getBoolean("y")).to.be.true;
    });
});
