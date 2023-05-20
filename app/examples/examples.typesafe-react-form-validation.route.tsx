// http://localhost:3000/examples/typesafe-react-form-validation

import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form } from "@remix-run/react"

export async function loader({ request }: LoaderArgs) {
  return json({})
}

function parseMonetaryValue(value: string) {
  return Number(value.replace(/[^0-9.-]+/g, ""))
}

export default function Example() {
  return (
    <div className="mx-auto max-w-[600px]">
      <h1 className="bold mb-4 text-2xl">Remix HTML Form Validation</h1>

      <p className="mb-4">
        Enter a purchase price and down payment amount as monetary values. The
        following rules are in effect
      </p>

      <ul className="mb-4 ml-4 flex list-disc flex-col gap-y-2">
        <li> The purchase price must be a monetary value. </li>
        <li> The purchase price must be greater than 0. </li>
        <li> The purchase price must be greater than $50,000. </li>
        <li> The down payment must be a monetary value. </li>
        <li> The down payment must be at least 20% of the purchase price. </li>
        <li> The down payment cannot be greater than the purchase price. </li>
      </ul>

      <TypesafeForm>
        <input
          id="purchasePrice"
          name="purchasorPrice"
          type="text"
          required
          onInput={(event) => {
            if (!(event.target instanceof HTMLInputElement)) return

            const purchasePrice = parseMonetaryValue(event.target.value)
            if (isNaN(purchasePrice)) {
              return event.target.setCustomValidity(
                `Purchase price must be a monetary value`,
              )
            }

            if (purchasePrice <= 0) {
              return event.target.setCustomValidity(
                `Purchase price must be greater than 0`,
              )
            }

            if (purchasePrice <= 50000) {
              return event.target.setCustomValidity(
                `You can't get a mortgage for a purchase price less than $50,000`,
              )
            }

            return event.target.setCustomValidity("")
          }}
        />

        <input
          id="downPayment"
          name="downPayment"
          type="text"
          required
          onInput={(event) => {
            const input = event.target as HTMLInputElement
            const form = input.form

            if (!(form instanceof HTMLFormElement)) return

            const purchasePriceInput = form["purchasePrice"]
            if (!(purchasePriceInput instanceof HTMLInputElement)) return

            const purchasePrice = parseMonetaryValue(purchasePriceInput.value)
            const downPayment = parseMonetaryValue(input.value)

            if (isNaN(downPayment)) {
              return input.setCustomValidity(
                `Down payment must be a monetary value`,
              )
            }
            if (downPayment > purchasePrice) {
              return input.setCustomValidity(
                `Down payment cannot be greater than purchase price`,
              )
            }

            if (downPayment < purchasePrice * 0.2) {
              return input.setCustomValidity(
                `Down payment must be at least 20% of purchase price`,
              )
            }

            return input.setCustomValidity("")
          }}
        />
      </TypesafeForm>
    </div>
  )
}

type PurchasePriceInput = React.ReactElement<{
  name: "purchasePrice"
  value: string
}>
type DownPaymentInput = React.ReactElement<{
  name: "downPayment"
  value: string
}>

type TypesafeFormProps = {
  children: React.ReactNode
}

function TypesafeForm({ children }: TypesafeFormProps) {
  return <Form>{children}</Form>
}
