import { EllipseMiniSolid } from "@medusajs/icons"
import { Label, RadioGroup, Text, clx } from "@medusajs/ui"

type FilterRadioGroupProps = {
  title: string
  items: {
    value: string
    label: string
  }[]
  value: any
  handleChange: (...args: any[]) => void
  "data-testid"?: string
  compact?: boolean
}

const FilterRadioGroup = ({
  title,
  items,
  value,
  handleChange,
  "data-testid": dataTestId,
  compact,
}: FilterRadioGroupProps) => {
  return (
    <div className="flex flex-col gap-4">
      {!compact && title ? (
        <Text className="text-[11px] font-medium uppercase tracking-[0.24em] text-ui-fg-muted">
          {title}
        </Text>
      ) : null}
      <RadioGroup
        className="grid gap-3"
        data-testid={dataTestId}
        onValueChange={handleChange}
      >
        {items?.map((item) => (
          <div key={item.value} className="relative">
            <RadioGroup.Item
              checked={item.value === value}
              className="hidden peer"
              id={item.value}
              value={item.value}
            />
            <Label
              htmlFor={item.value}
              className={clx(
                "flex items-center justify-between gap-3 rounded-[20px] border px-4 py-3 text-sm font-medium !transform-none transition-all hover:cursor-pointer",
                {
                  "border-blue bg-blue text-white shadow-md":
                    item.value === value,
                  "border-blue/10 bg-white text-ui-fg-subtle hover:border-blue/30 hover:bg-blue-50 hover:text-blue":
                    item.value !== value,
                }
              )}
              data-testid="radio-label"
              data-active={item.value === value}
            >
              <span className="flex items-center gap-2">
                {item.value === value && <EllipseMiniSolid />}
                <span>{item.label}</span>
              </span>
              <span
                className={clx(
                  "text-[10px] font-medium uppercase tracking-[0.22em]",
                  {
                    "text-white/70": item.value === value,
                    "text-ui-fg-muted": item.value !== value,
                  }
                )}
              >
                {item.value === value ? "Active" : "Select"}
              </span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

export default FilterRadioGroup
