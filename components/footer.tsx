import Container from "./container";

export default function Footer(): JSX.Element {
  return (
    <footer className="bg-accent-1 border-t border-accent-2">
      <Container>
        <div className="py-16 md:pt-16 md:pb-0 grid grid-cols-1 md:grid-cols-3">
          <iframe
            className="md:col-span-2"
            src="https://github.com/sponsors/dbanty/card"
            title="Sponsor dbanty"
            height="225"
            width="100%"
            style={{ border: 0, maxWidth: 600 }}
          />
          <div className="flex flex-col text-left items-center">
            <h3 className="text-xl font-bold">Follow Me</h3>
            <ul className="underline">
              <li>
                <a href="https://twitter.com/TBDylan">Twitter</a>
              </li>
              <li>
                <a href="https://github.com/dbanty">GitHub</a>
              </li>
              <li>
                <a href="https://dbanty.medium.com">Medium</a>
              </li>
              <li>
                <a href="https://dev.to/dbanty">Dev.to</a>
              </li>
              <li>
                <a href="https://dylananthony.substack.com">Substack </a>
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </footer>
  );
}
