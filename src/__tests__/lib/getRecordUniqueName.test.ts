import { getRecordUniqueName } from "@/lib/getRecordUniqueName";
import { TestConfig } from "@/test-variables/TestConfig";

describe("getRecordUniqueName", () => {
  it("should fetch the record's unique name using the value from the provided path", () => {
    const row = {
      street_address: "1 Sabin Street",
      id: 60,
    };

    const modelConfig = TestConfig;

    expect(getRecordUniqueName(row, modelConfig)).toBe("1 Sabin Street (60)");
  });
});
