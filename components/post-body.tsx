export default function PostBody({ content }: { content: string }) {
  return (
    <div className="max-w-2xl mx-auto">
      <article
        className="prose prose-purple lg:prose-xl"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
