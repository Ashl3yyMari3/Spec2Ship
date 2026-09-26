import React from 'react';

interface Props {
  title: string;
  reasons: string[];
  emptyMessage?: string;
  variant?: 'blocking' | 'review' | 'ready';
}

function variantStyle(variant: Props['variant']): React.CSSProperties {
  switch (variant) {
    case 'blocking':
      return {
        background: 'var(--color-critical-bg)',
        borderColor: 'var(--color-critical-border)',
        color: 'var(--color-critical-text)',
      };
    case 'review':
      return {
        background: 'var(--color-medium-bg)',
        borderColor: 'var(--color-medium-border)',
        color: 'var(--color-medium-text)',
      };
    case 'ready':
      return {
        background: 'var(--color-low-bg)',
        borderColor: 'var(--color-low-border)',
        color: 'var(--color-low-text)',
      };
    default:
      return {
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text)',
      };
  }
}

export default function ReasonList({
  title,
  reasons,
  emptyMessage,
  variant,
}: Props): React.ReactElement {
  const style = variantStyle(variant);

  return (
    <section
      aria-label={title}
      style={{
        border: '1px solid',
        borderRadius: 'var(--radius)',
        padding: '18px 22px',
        marginBottom: 20,
        ...style,
      }}
    >
      <h2
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: 'inherit',
          marginBottom: reasons.length > 0 ? 12 : 0,
        }}
      >
        {title}
      </h2>

      {reasons.length === 0 ? (
        emptyMessage ? (
          <p style={{ fontSize: 13, color: 'inherit', opacity: 0.8 }}>{emptyMessage}</p>
        ) : null
      ) : (
        <ul
          style={{
            margin: 0,
            paddingLeft: 20,
            listStyle: 'disc',
          }}
          aria-label={`${title} list`}
        >
          {reasons.map((reason, i) => (
            <li
              key={i}
              style={{
                fontSize: 13.5,
                color: 'inherit',
                padding: '3px 0',
                lineHeight: 1.55,
              }}
            >
              {reason}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
