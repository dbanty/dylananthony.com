import Container from "./container";

export default function Footer(): JSX.Element {
  return (
    <footer className="bg-accent-1 border-t border-accent-2">
      <Container>
        <div className="py-16 md:pt-16 md:pb-0 flex flex-col items-center">
          <iframe
            src="https://github.com/sponsors/dbanty/card"
            title="Sponsor dbanty"
            height="225"
            width="100%"
            style={{ border: 0, maxWidth: 600 }}
          />
        </div>
      </Container>
    </footer>
  );
}
