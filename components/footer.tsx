import Container from "./container";

export default function Footer(): JSX.Element {
  return (
    <footer className="bg-accent-1 border-t border-accent-2">
      <Container>
        <div className="py-28 flex flex-col lg:flex-row items-center">
          <iframe
            src="https://github.com/sponsors/dbanty/card"
            title="Sponsor dbanty"
            height="225"
            width="600"
            style={{ border: 0 }}
          />
        </div>
      </Container>
    </footer>
  );
}
