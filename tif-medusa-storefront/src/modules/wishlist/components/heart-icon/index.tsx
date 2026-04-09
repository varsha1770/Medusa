type HeartIconProps = {
  className?: string
  filled?: boolean
}

const HeartIcon = ({ className, filled = false }: HeartIconProps) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12.001 20.729c-.32 0-.64-.11-.894-.331l-6.506-5.666a5.373 5.373 0 0 1-.61-7.585 5.368 5.368 0 0 1 7.585-.61l.425.369.425-.37a5.368 5.368 0 0 1 7.586.611 5.373 5.373 0 0 1-.61 7.585l-6.506 5.666a1.36 1.36 0 0 1-.895.331Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default HeartIcon
