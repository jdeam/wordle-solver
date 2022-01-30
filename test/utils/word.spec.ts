import assert from "assert";
import { describe, it } from "mocha";
import * as wordUtils from "../../src/utils/word";

describe("word utils", () => {
  it("does not raise an error", () => {
    assert.ok(wordUtils.getNextGuess);
  });
});
