import { useUID } from "react-uid"

export function SideNote({ children }) {
  const id = useUID()

  return (
    // <aside> cannot be a child of <p>
    <span role="complementary">
      <label
        htmlFor={id}
        className={
          "relative -top-1 -mx-4 inline cursor-pointer px-4 align-baseline text-xs text-blue-700  after:content-['['_counter(footnote-counter)_']'] md:cursor-default md:text-gray-600"
        }
        style={{ counterIncrement: "footnote-counter" }}
      ></label>
      <input
        type="checkbox"
        id={id}
        tabIndex={0}
        className="peer hidden"
        defaultChecked={true}
      />
      <span className="relative hidden w-full transform overflow-visible border-l  pl-4  align-baseline text-sm opacity-90 before:relative before:-top-1 before:text-xs  before:content-['['_counter(footnote-counter)_']'] peer-checked:left-0 peer-checked:float-left peer-checked:clear-both peer-checked:my-4 peer-checked:block peer-checked:h-auto md:!float-right md:!clear-right md:!my-0 md:mr-[-33%] md:block md:w-[33%] md:translate-x-4">
        {children}
      </span>
    </span>
  )
}
