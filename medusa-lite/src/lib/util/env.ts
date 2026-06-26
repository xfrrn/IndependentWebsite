export const getBaseURL = () => {
  return process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:7890"
}

export const getInternalBaseURL = () => {
  return (
    process.env.INTERNAL_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:7890"
  )
}
