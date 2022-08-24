import { render, screen } from "@testing-library/react";
import ActiveLink from ".";

jest.mock("next/router", () => {
  return {
    useRouter() {
      return {
        asPath: "/",
      };
    },
  };
});

describe("ActiveLink component", () => {
  it("renders correctly", () => {
  render(
      <ActiveLink activeClassName={"active"} href={"/"}>
        <a>Home</a>
      </ActiveLink>
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("adds active class if the link is currently active", () => {
   render(
      <ActiveLink activeClassName={"active"} href={"/"}>
        <a>Home</a>
      </ActiveLink>
    );

    expect(screen.getByText("Home")).toHaveClass("active");
  });
});
