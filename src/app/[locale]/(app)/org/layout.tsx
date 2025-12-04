export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Note: Data is already prefetched and awaited in the parent (app) layout.
  // No additional prefetching needed here.
  return (
    <>
      {/* Organization header card removed — breadcrumb provides context now */}
      {children}
    </>
  );
}
