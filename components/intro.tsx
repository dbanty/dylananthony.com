export default function Intro(): JSX.Element {
  return (
    <section className="flex-col md:flex-row flex items-center md:justify-between mt-16 mb-16 md:mb-12">
      <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-tight md:pr-8">
        Dylan&apos;s Dev Digest
      </h1>
      <h2 className="text-center md:text-left text-lg mt-5 md:pl-8">
        Producing quality software with minimal frustration.
      </h2>
    </section>
  );
}
