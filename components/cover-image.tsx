import Link from "next/link";
import Image from "next/image";

interface Props {
  title: string;
  src: string;
  slug?: string;
  alt: string;
}

export default function CoverImage({ title, src, slug, alt }: Props) {
  const image = (
    <div className="shadow-small hover:shadow-medium transition-shadow duration-200">
      <Image
        src={src}
        alt={alt}
        width={2000}
        height={1000}
        layout="intrinsic"
      />
    </div>
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
