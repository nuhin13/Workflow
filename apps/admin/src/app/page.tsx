import { designTokens } from '@garazo/design-tokens';

export default function AdminShell() {
  return (
    <main
      aria-label="Garazo admin shell"
      tabIndex={0}
      style={{
        boxSizing: 'border-box',
        minHeight: '100vh',
        padding: designTokens.space['6'],
        outlineColor: designTokens.color.focus,
      }}
    >
      <section
        style={{
          maxWidth: designTokens.layout.adminMaxWidth,
          padding: designTokens.space['6'],
          border: `${designTokens.space['0']} solid ${designTokens.color.border}`,
          borderRadius: designTokens.radius.lg,
          background: designTokens.color.surface,
        }}
      >
        <h1 style={{ margin: designTokens.space['0'], fontSize: designTokens.font.size['2xl'] }}>
          Garazo
        </h1>
        <p style={{ color: designTokens.color.textMuted }}>Skeleton not configured.</p>
      </section>
    </main>
  );
}
