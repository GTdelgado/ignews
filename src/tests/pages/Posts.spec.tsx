import { render, screen } from "@testing-library/react";
import Posts, { getStaticProps } from "../../pages/posts";
import { getPrismicClient } from "../../services/prismic";

const posts = [
  {slug: 'my-post', title: 'My post', excerpt: 'Post excerpt', updatedAt: '10 de abril'},
];

jest.mock('../../services/prismic')

describe("Posts page", () => {
  it("renders correctly", () => {
    render(
      <Posts posts={posts}/>
    );

    expect(screen.getByText("My post")).toBeInTheDocument();
  });

  it("load initial data", async () => {
    const getPrismicClienteMocked = jest.mocked(getPrismicClient)

    getPrismicClienteMocked.mockReturnValueOnce({
      query: jest.fn().mockResolvedValueOnce({
        results: [
          {
            uid: 'my-post',
            data: {
              title: [
                { type: 'heading', text: 'My post'}
              ],
              content: [
                { type: 'paragraph', text: 'Post excerpt'}
              ]
            },
            last_publication_date: '04-01-2021'
          }
        ]
      }),
    } as any);

    const response = await getStaticProps({});

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          posts: [{
            slug: 'my-post',
            title: 'My post',
            excerpt: 'Post excerpt',
            updatedAt: '01 de abril de 2021'
          }]
        }
      })
    );
  });
});
