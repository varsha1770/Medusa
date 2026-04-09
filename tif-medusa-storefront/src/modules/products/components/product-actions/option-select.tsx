import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  const filteredOptions = (option.values ?? []).map((v) => v.value)

  return (
    <div className="flex flex-col gap-y-3 mt-4">
      <div className="flex items-center gap-x-2">
        <span className="text-sm font-bold text-dark uppercase tracking-wide">{title}</span>
      </div>
      <div
        className="flex flex-wrap gap-3"
        data-testid={dataTestId}
      >
        {filteredOptions.map((v) => {
          return (
            <button
              onClick={() => updateOption(option.id, v)}
              key={v}
              className={clx(
                "flex items-center justify-center w-12 h-12 rounded-full border bg-white text-sm font-semibold transition-all duration-150 focus:outline-none",
                {
                  "border-blue-600 text-blue-600 shadow-[0_0_0_1px_#2563eb]": v === current,
                  "border-gray-300 text-dark hover:border-blue-600":
                    v !== current,
                }
              )}
              disabled={disabled}
              data-testid="option-button"
            >
              <span>{v}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
