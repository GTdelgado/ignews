import { render, screen } from "@testing-library/react";
import { useSession } from "next-auth/react";
import Home, { getStaticProps } from "../../pages";
import { stripe } from "../../services/stripe";

jest.mock("next-auth/react");
jest.mock("next/router");
jest.mock("../../services/stripe");

describe("Home page", () => {
  it("renders correctly", () => {
    const useSessionMocked = jest.mocked(useSession);

    useSessionMocked.mockReturnValueOnce({
      data: null,
      status: "unauthenticated",
    });

    render(
      <Home
        product={{
          priceId: "fake-priceID",
          amount: "R$10,00",
        }}
      />
    );

    expect(screen.getByText("for R$10,00 month")).toBeInTheDocument();
  });

  it("load initial data", async () => {
    const stripePriceRetrievesMoked = jest.mocked(stripe.prices.retrieve);
    
    stripePriceRetrievesMoked.mockResolvedValueOnce({
      id: "fake-pricesID",
      unit_amount: 1000,
    } as any);

    const response = await getStaticProps({});

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          product: {
            priceId: 'fake-pricesID',
            amount: '$10.00'
          }
        }
      })
    );
  });
});
