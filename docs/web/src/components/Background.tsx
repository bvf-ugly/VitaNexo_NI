import { useTheme } from '../context'

export default function Background() {
  const { dark } = useTheme()

  if (dark) {
    return (
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[#1A0A0A]" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-asuka-red/[0.06] rounded-full blur-[120px] animate-float" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-asuka-orange/[0.05] rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] bg-asuka-red/[0.04] rounded-full blur-[80px] animate-float" style={{ animationDelay: '4s' }} />
        </div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(211,47,47,0.08) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 bg-[#e3f1ff]" />
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] bg-primary-200/40 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-accent/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[30%] left-[40%] w-[500px] h-[500px] bg-primary-100/35 rounded-full blur-[80px] animate-float" style={{ animationDelay: '4s' }} />
        <div className="absolute top-[60%] right-[20%] w-[300px] h-[300px] bg-primary-300/25 rounded-full blur-[60px] animate-float" style={{ animationDelay: '1s' }} />
      </div>
      <div className="absolute inset-0 opacity-15" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(90,130,166,0.06) 1px, transparent 0)',
        backgroundSize: '32px 32px'
      }} />
    </div>
  )
}
