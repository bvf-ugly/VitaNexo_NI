interface BadgeProps {
  variant: 'success' | 'warning' | 'danger' | 'info' | 'default'
  children: React.ReactNode
}

const styles = {
  success: 'bg-success-light text-success-dark dark:bg-[#065F46]/30 dark:text-emerald-400',
  warning: 'bg-warning-light text-warning-dark dark:bg-[#92400E]/30 dark:text-amber-400',
  danger:  'bg-danger-light text-danger-dark dark:bg-[#991B1B]/30 dark:text-red-400',
  info:    'bg-info-light text-info-dark dark:bg-[#1E40AF]/30 dark:text-blue-400',
  default: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
}

export default function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={`badge ${styles[variant]}`}>
      {children}
    </span>
  )
}
