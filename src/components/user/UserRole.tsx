function StaffRole() {
  return (
    <span class="text-xs py-1 px-2 bg-red-400 rounded-full border border-red-700 font-semibold text-red-900 w-fit">
      Staff
    </span>
  )
}

function JudgeRole() {
  return (
    <span class="text-xs py-1 px-2 bg-purple-400 rounded-full border border-purple-700 font-semibold text-purple-900 w-fit">
      Judge
    </span>
  )
}

export const UserRole = {
  Staff: StaffRole,
  Judge: JudgeRole,
}