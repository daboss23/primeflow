// FILE: src/app/workflows/page.tsx
import { WorkflowsView } from '@/components/workflows/WorkflowsView'

export default function WorkflowsPage() {
  return (
    <div className="flex h-screen overflow-hidden p-7">
      <WorkflowsView />
    </div>
  )
}
