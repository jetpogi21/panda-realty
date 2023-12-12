import { replacePlaceholders } from "@/lib/replacePlaceholders";

describe("replacePlaceholders", () => {
  it("should replace placeholders with corresponding values in the data object", () => {
    const input = "Hello, {{name}}! You are {{age}} years old.";
    const data = { name: "John", age: 30 };

    const result = replacePlaceholders(input, data);

    expect(result).toBe("Hello, John! You are 30 years old.");
  });

  it("should handle nested placeholders in objects", () => {
    const input = "My address is {{address.city}}, {{address.country}}.";
    const data = { address: { city: "New York", country: "USA" } };

    const result = replacePlaceholders(input, data);

    expect(result).toBe("My address is New York, USA.");
  });

  it("should handle multiple occurrences of the same placeholder", () => {
    const input = "This is {{name}}, and this is also {{name}}.";
    const data = { name: "John" };

    const result = replacePlaceholders(input, data);

    expect(result).toBe("This is John, and this is also John.");
  });

  it("should handle missing placeholders by leaving them unchanged", () => {
    const input = "Hello, {{name}}! You are {{age}} years old.";
    const data = { name: "John" };

    const result = replacePlaceholders(input, data);

    expect(result).toBe("Hello, John! You are {{age}} years old.");
  });

  it("should replace placeholders in the data object with corresponding properties even in complex objects", () => {
    const input = "{{street_address}} ({{id}})";
    const data = {
      is_favorite: true,
      id: 6,
      property_image: null,
      street_address: "1 Sabin Street",
      suburb: "Caboolture",
      state: "QLD",
      postcode: "4510",
    };

    const result = replacePlaceholders(input, data);

    expect(result).toBe("1 Sabin Street (6)");
  });

  // Add other test cases as needed
});
