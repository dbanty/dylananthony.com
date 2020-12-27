import Author from "./author";

export default interface Post {
  title: string;
  date: string;
  slug: string;
  author: Author;
  coverImage: string;
  coverImageAlt: string;
  excerpt: string;
  content: string;
}
