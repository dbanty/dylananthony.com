import Container from "../components/container";
import MoreStories from "../components/more-stories";
import HeroPost from "../components/hero-post";
import Intro from "../components/intro";
import Layout from "../components/layout";
import { getAllPosts } from "../lib/api";
import Head from "next/head";
import Post from "../lib/post";

interface Props {
  allPosts: Post[];
}

export default function Index(props: Props): JSX.Element {
  const heroPost = props.allPosts[0];
  const morePosts = props.allPosts.slice(1);
  return (
    <>
      <Layout>
        <Head>
          <title>Dylan Anthony</title>
        </Head>
        <Container>
          <Intro />
          {heroPost && (
            <HeroPost
              title={heroPost.title}
              coverImage={heroPost.coverImage}
              coverImageAlt={heroPost.coverImageAlt}
              date={heroPost.date}
              author={heroPost.author}
              slug={heroPost.slug}
              excerpt={heroPost.excerpt}
            />
          )}
          {morePosts.length > 0 ? <MoreStories posts={morePosts} /> : undefined}
        </Container>
      </Layout>
    </>
  );
}

export async function getStaticProps() {
  const allPosts = getAllPosts();

  return {
    props: { allPosts },
  };
}
