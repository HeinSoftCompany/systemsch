interface SectionPlaceholderProps {
  title: string
  description: string
}

export const SectionPlaceholder = ({ title, description }: SectionPlaceholderProps) => {
  return (
    <section
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '20px',
      }}
    >
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <p style={{ marginBottom: 0, color: '#4b5563' }}>{description}</p>
    </section>
  )
}
