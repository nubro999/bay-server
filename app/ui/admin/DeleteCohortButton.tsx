'use client'

import { deleteCohort } from '@/app/actions/cohorts'

type DeleteCohortButtonProps = {
  cohortId: string
  cohortName: string
  hackathonCount: number
}

export function DeleteCohortButton({ cohortId, cohortName, hackathonCount }: DeleteCohortButtonProps) {
  const handleClick = async () => {
    const warning =
      hackathonCount > 0
        ? `"${cohortName}" 코호트에 ${hackathonCount}개의 해커톤이 포함되어 있습니다.\n모든 해커톤, 팀, 제출물이 함께 삭제됩니다.\n\n정말 삭제하시겠습니까?`
        : `"${cohortName}" 코호트를 삭제하시겠습니까?`

    if (!confirm(warning)) return

    await deleteCohort(cohortId)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-sm text-red-500 hover:text-red-700"
    >
      Delete
    </button>
  )
}
