import Alert from "../components/alert";
import Footer from "../components/footer";
import Meta from "../components/meta";

interface Props {
  children: (JSX.Element | undefined)[] | JSX.Element;
}

export default function Layout({ children }: Props): JSX.Element {
  return (
    <>
      <Meta />
      <div className="min-h-screen">
        <Alert />
        <main>{children}</main>
      </div>
      <Footer />
    </>
  );
}
