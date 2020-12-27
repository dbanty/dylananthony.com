import fs from "fs";
import { join } from "path";
import matter from "gray-matter";
import Post from "./post";

const postsDirectory = join(process.cwd(), "_posts");

export function getPostSlugs(): string[] {
  return fs.readdirSync(postsDirectory);
}

export function getPostBySlug(slug: string): Post {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    author: data.author,
    coverImage: data.coverImage,
    coverImageAlt: data.coverImageAlt,
    date: data.date,
    excerpt: data.excerpt,
    slug: realSlug,
    title: data.title,
    content,
  };
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs();
  return slugs
    .map((slug) => getPostBySlug(slug))
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
}
