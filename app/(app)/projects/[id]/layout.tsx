export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Project info and tabs are now rendered in the parent layout (app/(app)/layout.tsx)
  // This layout just renders the children content
  return <>{children}</>
}
