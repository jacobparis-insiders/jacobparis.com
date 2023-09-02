import React, { useContext } from 'react'

export function createStateContext<T>() {
	const StateContext = React.createContext<
		undefined | Readonly<[T, React.Dispatch<React.SetStateAction<T>>]>
	>(undefined)

	function useStateContext() {
		const tuple = useContext(StateContext)

		if (tuple === undefined) {
			throw new Error(
				`use${StateContext.displayName} must be used within a ${StateContext.displayName}Provider`,
			)
		}

		return tuple
	}

	return [StateContext, useStateContext] as const
}
