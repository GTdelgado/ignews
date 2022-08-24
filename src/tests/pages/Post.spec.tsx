import { render, screen } from "@testing-library/react";
import { getSession } from "next-auth/react";
import Post, { getServerSideProps } from "../../pages/posts/[slug]";
import { getPrismicClient } from "../../services/prismic";

const post = {
  slug: "my-post",
  title: "My post",
  content: "<p>Post excerpt<p>",
  updatedAt: "10 de abril",
};
jest.mock("../../services/prismic");
jest.mock("next-auth/react");

describe("Post page", () => {
  it("renders correctly", () => {
    render(<Post post={post} />);

    expect(screen.getByText("My post")).toBeInTheDocument();
    expect(screen.getByText("Post excerpt")).toBeInTheDocument();
  });

  it("redirects user if no subscription is found", async () => {
    const getSessionMocked = jest.mocked(getSession);

    getSessionMocked.mockResolvedValueOnce({
      activeUserSubscription: null,
    } as any);

    const response = await getServerSideProps({
      params: { slug: "my-post" },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({
          destination: "/posts/preview/my-post",
        }),
      })
    );
  });

  it('load initial data', async () => {
    const getSessionMocked = jest.mocked(getSession);
    const getPrismicClientMocked = jest.mocked(getPrismicClient)

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [
            { type: 'heading', text: 'My post'}
          ],
          content: [
            { type: 'paragraph', text: 'Post content'}
          ],
        },
        last_publication_date: '04-01-2021'
      })
    } as any)

    getSessionMocked.mockResolvedValueOnce({
      activeUserSubscription: 'fake-active-subscription',
    } as any)

    const response = await getServerSideProps({
      params: { slug: 'my-post'}
    } as any)

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: 'my-post',
            title: 'My post',
            content: '<p>Post content</p>',
            updatedAt: '01 de abril de 2021'
          }
        }
      })
    )
  })
});
