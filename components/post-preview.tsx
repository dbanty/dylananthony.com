import Avatar from "../components/avatar";
import DateFormatter from "../components/date-formatter";
import CoverImage from "./cover-image";
import Link from "next/link";
import Author from "../lib/author";

interface Props {
  title: string;
  coverImage: string;
  coverImageAlt: string;
  date: string;
  excerpt: string;
  author: Author;
  slug: string;
}

export default function PostPreview({
  title,
  coverImage,
  coverImageAlt,
  date,
  excerpt,
  author,
  slug,
}: Props): JSX.Element {
  return (
    <div>
      <div className="mb-5">
        <CoverImage
          slug={slug}
          title={title}
          src={coverImage}
          alt={coverImageAlt}
        />
      </div>
      <h3 className="text-3xl mb-3 leading-snug">
        <Link as={`/posts/${slug}`} href="/posts/[slug]">
          <a className="hover:underline">{title}</a>
        </Link>
      </h3>
      <div className="text-lg mb-4">
        <DateFormatter dateString={date} />
      </div>
      <p className="text-lg leading-relaxed mb-4">{excerpt}</p>
      <Avatar name={author.name} picture={author.picture} />
    </div>
  );
}
