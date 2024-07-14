export function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="text-neutral-7000 rounded-sm bg-white p-1 text-sm">
      {children}
    </code>
  )
}
