import Link from "next/link";

interface Props {
  title: string;
  src: string;
  slug?: string;
  alt: string;
}

export default function CoverImage({ title, src, slug, alt }: Props) {
  const image = (
    <img
      src={src}
      alt={alt}
      className="shadow-small hover:shadow-medium transition-shadow duration-200"
    />
  );
  return (
    <div className="sm:mx-0">
      {slug ? (
        <Link as={`/posts/${slug}`} href="/posts/[slug]">
          <a aria-label={title}>{image}</a>
        </Link>
      ) : (
        image
      )}
    </div>
  );
}
