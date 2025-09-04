

export default function ComingSoonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>
  <section> {children}</section>
  
  </>; // no header, no footer
}