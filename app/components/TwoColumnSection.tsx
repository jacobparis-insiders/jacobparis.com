export function TwoColumnSection({ title, children }) {
  return (
    <section className="py-12">
      <div className="flex-grow">
        <h3 className="mb-4 text-4xl font-medium sm:mb-8">{title} </h3>

        <div className="flex flex-wrap gap-8">{children}</div>
      </div>
    </section>
  )
}
