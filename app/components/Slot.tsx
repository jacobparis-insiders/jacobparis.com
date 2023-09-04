import * as React from "react"

export type AsChildProps<DefaultElementProps, T = undefined> =
  | ({ asChild?: false } & DefaultElementProps)
  | (T extends undefined
      ? { asChild: true; children: React.ReactNode }
      : { asChild: true; children(item: T): React.ReactElement })

function Slot({
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode
}) {
  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ...children.props,
      style: {
        ...props.style,
        ...children.props.style,
      },
      className: [props.className, children.props.className].join(" "),
    })
  }

  if (React.Children.count(children) > 1) {
    React.Children.only(null)
  }

  return null
}

export { Slot }
