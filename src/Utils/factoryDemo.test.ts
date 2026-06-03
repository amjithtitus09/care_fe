import { slugifyLabel } from "./factoryDemo";

describe("slugifyLabel", () => {
  it("should convert a simple label to a slug", () => {
    expect(slugifyLabel("Hello World")).toBe("hello-world");
  });

  it("should handle leading and trailing spaces", () => {
    expect(slugifyLabel("  Leading and trailing spaces  ")).toBe("leading-and-trailing-spaces");
  });

  it("should replace non-alphanumeric characters with hyphens", () => {
    expect(slugifyLabel("Special!@#$%^&*()Characters")).toBe("special-characters");
  });

  it("should collapse multiple spaces or special characters into a single hyphen", () => {
    expect(slugifyLabel("Multiple     Spaces---and___underscores")).toBe("multiple-spaces-and-underscores");
  });

  it("should remove leading and trailing hyphens", () => {
    expect(slugifyLabel("---Leading and trailing---")).toBe("leading-and-trailing");
  });

  it("should handle an empty string", () => {
    expect(slugifyLabel("")).toBe("");
  });

  it("should handle strings with only special characters", () => {
    expect(slugifyLabel("!@#$%^&*()")).toBe("");
  });

  it("should handle strings with only spaces", () => {
    expect(slugifyLabel("     ")).toBe("");
  });

  it("should handle strings with mixed case", () => {
