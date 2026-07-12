// single floating chip/feedback label: rises and fades over 1s
export default function FloatingText({ text, x, y, color }) {
  return (
    <span
      className={`floating-text floating-text--${color}`}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {text}
    </span>
  )
}
