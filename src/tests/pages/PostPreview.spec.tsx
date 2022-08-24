import { render, screen } from "@testing-library/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Post, { getStaticProps } from "../../pages/posts/preview/[slug]";
import { getPrismicClient } from "../../services/prismic";

const post = {
  slug: "my-post",
  title: "My post",
  content: "<p>Post excerpt<p>",
  updatedAt: "10 de abril",
};

jest.mock("../../services/prismic");
jest.mock("next/router");
jest.mock("next-auth/react");

describe("Post preview page", () => {
  it("renders correctly", () => {
    const useSessionMocked = jest.mocked(useSession);

    useSessionMocked.mockReturnValueOnce([null, false] as any);

    render(<Post post={post} />);

    expect(screen.getByText("My post")).toBeInTheDocument();
    expect(screen.getByText("Post excerpt")).toBeInTheDocument();
    expect(screen.getByText("Wanna continue reading?")).toBeInTheDocument();
  });

  it("redirects user to full post when user is subscribed", async () => {
    const useSessionMocked = jest.mocked(useSession);
    const useRouterMocked = jest.mocked(useRouter);
    const pushMock = jest.fn();

    useSessionMocked.mockReturnValueOnce({
      data: {
        activeUserSubscription: 'fake-user-subscription'
      },
      status: 'authenticated'
    } as any)

    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any);

    render(<Post post={post} />)

    expect(pushMock).toHaveBeenCalledWith('/posts/my-post')
  });

  it('load initial data', async () => {
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

    const response = await getStaticProps({params: {slug: 'my-post'}})

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
