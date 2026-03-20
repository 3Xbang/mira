import { render } from "@testing-library/react";

test("@testing-library/react and jest-dom are configured", () => {
  const { getByText } = render(<div>Hello Mira</div>);
  expect(getByText("Hello Mira")).toBeInTheDocument();
});
