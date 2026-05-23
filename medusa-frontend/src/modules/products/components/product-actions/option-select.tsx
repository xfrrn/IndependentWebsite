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
    <div className="flex flex-col gap-y-3">
      <span className="text-sm font-semibold text-[color:var(--text-body)]">Select {title}</span>
      <div
        className="flex flex-wrap justify-between gap-2"
        data-testid={dataTestId}
      >
        {filteredOptions.map((v) => {
          return (
            <button
              onClick={() => updateOption(option.id, v)}
              key={v}
              className={clx(
                "text-small-regular flex-1 rounded-full border px-4 py-2 transition duration-300 ease-out",
                {
                  "border-[color:var(--accent)] bg-[var(--accent-soft)] text-[color:var(--accent-strong)] shadow-[0_12px_22px_-18px_rgba(92,72,45,0.2)]":
                    v === current,
                  "border-[color:var(--border-soft)] bg-[rgba(255,250,242,0.82)] text-[color:var(--text-body)] hover:-translate-y-0.5 hover:border-[color:var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[color:var(--accent-strong)]":
                    v !== current,
                }
              )}
              disabled={disabled}
              data-testid="option-button"
            >
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
