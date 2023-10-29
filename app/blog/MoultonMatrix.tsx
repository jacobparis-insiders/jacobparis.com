import { useState } from "react"

export function MoultonMatrix() {
  const colors = [
    "#3fb8af",
    "#fff0a5",
    "#ff2d00",
    "#ff974f",
    "#d1dbbd",
    "#004358",
    "#ffe11a",
    "#ff9e9d",
    "#96ca2d",
    "#04756f",
    "#4bb5c1",
    "#edf7f2",
    "#b5e655",
    "#d90000",
  ]

  const [mat, setMat] = useState(() => {
    const matrix = [
      [1, 0, 0, 0, 1, 0],
      [0, 1, 0, 1, 0, 0],
      [0, 0, 1, 0, 0, 0],
      [0, 1, 0, 1, 0, 0],
      [1, 0, 0, 0, 1, 0],
      [0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 1, 0],
      [0, 1, 0, 1, 0, 0],
      [0, 0, 1, 0, 0, 0],
      [0, 1, 1, 1, 0, 0],
      [1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 0, 0],
      [0, 0, 1, 0, 0, 0],
      [0, 1, 0, 1, 0, 0],
      [1, 0, 0, 0, 1, 0],
      [0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 1, 0],
      [0, 1, 0, 1, 0, 0],
      [0, 0, 1, 0, 0, 0],
      [0, 1, 0, 1, 0, 0],
      [1, 0, 0, 0, 1, 0],
      [0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 1, 0],
      [0, 1, 0, 1, 0, 0],
      [0, 0, 1, 0, 0, 0],
      [0, 1, 0, 1, 0, 0],
      [1, 0, 0, 0, 1, 0],
      [0, 0, 0, 0, 0, 1],
    ]

    return matrix.map((row) => row.map(Boolean))
  })

  const toggleLed = (i: number, j: number) => {
    setMat((prevMat) =>
      prevMat.map((row, rowIndex) =>
        rowIndex === i
          ? row.map((led, colIndex) => (colIndex === j ? !led : led))
          : row,
      ),
    )
  }

  return (
    <div>
      <div className="">
        <div className="mx-auto grid grid-flow-col grid-rows-6">
          {mat.map((row, i) =>
            row.map((led, j) => (
              <div
                key={`${i}-${j}`}
                className="group p-2"
                onClick={() => toggleLed(i, j)}
              >
                <div
                  className="motion-safe:animate-pulse"
                  style={{
                    // stagger the animation
                    // use sin/cos to get a more interesting pattern
                    animationDelay: `${Math.floor(
                      Math.abs(
                        Math.sin(i * 12 + j * 3) * Math.cos(i * 3 + j * 12),
                      ) * 1000,
                    )}ms`,
                  }}
                >
                  <div
                    style={{
                      // use sin/cos to get a more interesting pattern
                      backgroundColor:
                        colors[
                          Math.floor(
                            Math.abs(
                              Math.sin(i * 12 + j * 3) *
                                Math.cos(i * 3 + j * 12),
                            ) * colors.length,
                          )
                        ],
                    }}
                    className={`h-4 w-4 cursor-pointer  rounded-full transition-colors  ${
                      led
                        ? "opacity-100 shadow-lg group-hover:opacity-80"
                        : "opacity-10 group-hover:opacity-60"
                    }`}
                  />
                </div>
              </div>
            )),
          )}
        </div>
      </div>
    </div>
  )
}
