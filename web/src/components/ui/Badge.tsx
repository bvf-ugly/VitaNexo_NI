interface BadgeProps {
  variant: 'success' | 'warning' | 'danger' | 'info' | 'default'
  children: React.ReactNode
}

const styles = {
  success: 'bg-success-light text-success-dark',
  warning: 'bg-warning-light text-warning-dark',
  danger:  'bg-danger-light text-danger-dark',
  info:    'bg-info-light text-info-dark',
  default: 'bg-slate-100 text-slate-600',
}

export default function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={`badge ${styles[variant]}`}>
      {children}
    </span>
  )
}
