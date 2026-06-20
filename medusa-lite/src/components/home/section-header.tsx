type SectionHeaderProps = {
  eyebrow: string
  title: string
  subtitle?: string
}

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: SectionHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="ui-eyebrow">{eyebrow}</p>
        <h2 className="ui-title">{title}</h2>
        {subtitle ? (
          <p className="ui-subtitle">{subtitle}</p>
        ) : null}
      </div>
    </div>
  )
}
