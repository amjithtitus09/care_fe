// Fixed syntax error
const factoryDemo = () => {
  return {
    value: "valid-slug"
  };
};

test('factory demo test', () => {
  const result = factoryDemo();
  expect(result.value).toBe("valid-slug");
});