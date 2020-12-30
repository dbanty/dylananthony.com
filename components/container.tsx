interface Props {
  children: (JSX.Element | undefined)[] | JSX.Element;
}

export default function Container({ children }: Props): JSX.Element {
  return <div className="container mx-auto px-5">{children}</div>;
}
