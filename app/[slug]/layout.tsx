type Props = {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  return <div className="max-w-screen-md mx-auto">{children}</div>;
}
