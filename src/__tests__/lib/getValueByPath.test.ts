import { getValueByPath } from "@/lib/getValueByPath";

describe("getValueByPath", () => {
  it("should return the value at the given path", () => {
    const data = {
      user: {
        name: "John",
        age: 30,
        address: {
          city: "New York",
          country: "USA",
        },
      },
    };

    expect(getValueByPath(data, "user.name")).toBe("John");
    expect(getValueByPath(data, "user.age")).toBe(30);
    expect(getValueByPath(data, "user.address.city")).toBe("New York");
  });

  it("should return undefined if the path does not exist", () => {
    const data = {
      user: {
        name: "John",
        age: 30,
      },
    };

    expect(getValueByPath(data, "user.address")).toBeUndefined();
    expect(getValueByPath(data, "user.address.city")).toBeUndefined();
  });
});
