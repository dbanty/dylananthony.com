import { useRouter } from "next/router";
import ErrorPage from "next/error";
import Container from "../../components/container";
import PostBody from "../../components/post-body";
import Header from "../../components/header";
import PostHeader from "../../components/post-header";
import Layout from "../../components/layout";
import { getPostBySlug, getAllPosts } from "../../lib/api";
import PostTitle from "../../components/post-title";
import Head from "next/head";
import markdownToHtml from "../../lib/markdownToHtml";
import PostData from "../../lib/post";
import { GetStaticPaths, GetStaticProps } from "next";
import { useEffect } from "react";

interface Props {
  post: PostData;
}

export default function Post({ post }: Props): JSX.Element {
  const router = useRouter();
  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />;
  }
  useEffect(() => {
    if (
      !sessionStorage.getItem("_swa") &&
      document.referrer.indexOf(location.protocol + "//" + location.host) !== 0
    ) {
      fetch(
        "https://counter.dev/track?" +
          new URLSearchParams({
            referrer: document.referrer,
            screen: screen.width + "x" + screen.height,
            user: "dbanty",
            utcoffset: "-7",
          })
      ).then(() => {
        sessionStorage.setItem("_swa", "1");
      });
    }
  }, []);
  return (
    <Layout>
      <Container>
        <Header />
        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <>
            <article className="mb-32">
              <Head>
                <title>{post.title} | Dylan Anthony</title>

                {/* Twitter */}
                <meta name="twitter:card" content="summary" key="twcard" />
                <meta
                  name="twitter:creator"
                  content="@tbdylan"
                  key="twhandle"
                />

                {/* Open Graph */}
                <meta
                  property="og:image"
                  content={`https://dylananthony.com${post.coverImage}`}
                  key="ogimage"
                />
                <meta property="og:url" content={router.asPath} />
                <meta
                  key="og:image:width"
                  property="og:image:width"
                  content="2000"
                />
                <meta
                  key="og:image:height"
                  property="og:image:height"
                  content="1000"
                />
                <meta
                  property="og:site_name"
                  content="dylananthony.com"
                  key="ogsitename"
                />
                <meta property="og:title" content={post.title} key="ogtitle" />
                <meta
                  property="og:description"
                  content={post.excerpt}
                  key="ogdesc"
                />
              </Head>
              <PostHeader
                title={post.title}
                coverImage={post.coverImage}
                coverImageAlt={post.coverImageAlt}
                date={post.date}
                author={post.author}
              />
              <PostBody content={post.content} />
            </article>
          </>
        )}
      </Container>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const slug = context.params?.slug;
  if (typeof slug !== "string") {
    return { props: {} };
  }
  const post = getPostBySlug(slug);
  const content = await markdownToHtml(post.content || "");

  return {
    props: {
      post: {
        ...post,
        content,
      },
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = getAllPosts();

  return {
    paths: posts.map((post) => {
      return {
        params: {
          slug: post.slug,
        },
      };
    }),
    fallback: false,
  };
};
