// Oracle Intelligence Engine
// Mock layer — structured to evolve into real platform intelligence

export type SignalType = 'risk' | 'opportunity' | 'degrading' | 'improving' | 'action'
export type SignalPriority = 'critical' | 'high' | 'medium' | 'low'
export type SystemState = 'critical' | 'watch' | 'stable' | 'improving'

export interface OracleSignal {
  id: string
  type: SignalType
  priority: SignalPriority
  title: string
  body: string
  nextPlay: string
  targetType: 'workflow' | 'customer' | 'segment' | 'analytics'
  targetId: string
  targetLabel: string
  confidence: number  // 0–100
  impactValue?: number  // $ if applicable
}

export interface OracleBriefData {
  generatedAt: string
  systemState: SystemState
  systemSummary: string
  signals: OracleSignal[]
}

// ─── Signal data ──────────────────────────────────────────────────────────────
// Future: replace with real computation from live workflow + customer + health data

export const ORACLE_SIGNALS: OracleSignal[] = [
  {
    id: 'sig-vip-paused',
    type: 'risk',
    priority: 'critical',
    title: 'VIP Retention workflow paused',
    body: '17 high-value customers enrolled but receiving no outreach. $8,940 in recoverable revenue stalled with no active sequence running.',
    nextPlay: 'Resume VIP At-Risk Retention immediately.',
    targetType: 'workflow',
    targetId: '4',
    targetLabel: 'VIP At-Risk Retention',
    confidence: 96,
    impactValue: 8940,
  },
  {
    id: 'sig-aisha-critical',
    type: 'risk',
    priority: 'critical',
    title: 'Top VIP approaching churn threshold',
    body: 'Highest-LTV customer in system — 2 months without purchase, health score 30. No active outreach sequence. Churn risk is elevated.',
    nextPlay: 'Initiate personal outreach for top VIP now.',
    targetType: 'customer',
    targetId: 'repeat_at_risk',
    targetLabel: 'VIP At-Risk Segment',
    confidence: 91,
    impactValue: 2840,
  },
  {
    id: 'sig-dormant-degrading',
    type: 'degrading',
    priority: 'high',
    title: 'Dormant Win-Back conversion declining',
    body: '204 customers enrolled, only 13.2% converting. Sequence failing to create urgency — messaging too passive for a lapsed-buyer cohort.',
    nextPlay: 'Inspect Dormant Win-Back messaging. Test stronger subject lines.',
    targetType: 'workflow',
    targetId: '3',
    targetLabel: 'Dormant Customer Win-Back',
    confidence: 84,
    impactValue: 6210,
  },
  {
    id: 'sig-failed-payment-opp',
    type: 'opportunity',
    priority: 'high',
    title: 'Failed Payment Recovery outperforming',
    body: '50% conversion rate on failed payments — highest in system. Enrollment threshold may be too conservative. Room to capture more cases.',
    nextPlay: 'Expand Failed Payment Recovery enrollment criteria.',
    targetType: 'workflow',
    targetId: '2',
    targetLabel: 'Failed Payment Recovery',
    confidence: 88,
    impactValue: 3140,
  },
  {
    id: 'sig-cart-friction',
    type: 'risk',
    priority: 'high',
    title: 'Cart recovery stalling at step 2',
    body: '$370 in active cart value. Customers opening sequence emails but not clicking through — step 2 has a conversion friction point.',
    nextPlay: 'Review Abandoned Cart step 2. Add urgency incentive.',
    targetType: 'workflow',
    targetId: '1',
    targetLabel: 'Abandoned Cart Recovery',
    confidence: 79,
    impactValue: 4820,
  },
  {
    id: 'sig-engaged-draft',
    type: 'action',
    priority: 'medium',
    title: 'Engaged-Unconverted workflow inactive',
    body: 'Workflow configured and ready but never activated. 69+ qualifying customers receive no outreach. Revenue opportunity sitting idle.',
    nextPlay: 'Activate Engaged But Unconverted workflow now.',
    targetType: 'workflow',
    targetId: '6',
    targetLabel: 'Engaged But Unconverted',
    confidence: 95,
  },
  {
    id: 'sig-replenishment-timing',
    type: 'improving',
    priority: 'medium',
    title: 'Replenishment timing accuracy improving',
    body: 'Predicted replenishment windows are aligning with actual purchase behavior — 49.4% conversion rate on 89 enrolled customers.',
    nextPlay: 'Increase replenishment prediction sensitivity to capture edge cases.',
    targetType: 'workflow',
    targetId: '5',
    targetLabel: 'Replenishment Reminder',
    confidence: 76,
    impactValue: 2870,
  },
]

// ─── Signal UI config ─────────────────────────────────────────────────────────

export const SIGNAL_STYLE: Record<SignalType, { color: string; bg: string; border: string; label: string }> = {
  risk:        { color: '#ff4060', bg: 'rgba(255,64,96,0.07)',    border: 'rgba(255,64,96,0.2)',    label: 'Risk'        },
  opportunity: { color: '#00e676', bg: 'rgba(0,230,118,0.07)',   border: 'rgba(0,230,118,0.2)',   label: 'Opportunity' },
  degrading:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.07)',  border: 'rgba(245,158,11,0.2)',  label: 'Degrading'   },
  improving:   { color: '#00d4ff', bg: 'rgba(0,212,255,0.07)',   border: 'rgba(0,212,255,0.2)',   label: 'Improving'   },
  action:      { color: '#a78bfa', bg: 'rgba(167,139,250,0.07)', border: 'rgba(167,139,250,0.2)', label: 'Action'      },
}

export const PRIORITY_ORDER: Record<SignalPriority, number> = {
  critical: 0, high: 1, medium: 2, low: 3,
}

export const SYSTEM_STATE_STYLE: Record<SystemState, { color: string; bg: string; border: string; label: string }> = {
  critical:  { color: '#ff4060', bg: 'rgba(255,64,96,0.06)',   border: 'rgba(255,64,96,0.22)',   label: 'Critical'  },
  watch:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.06)',  border: 'rgba(245,158,11,0.22)',  label: 'Watch'     },
  stable:    { color: '#00d4ff', bg: 'rgba(0,212,255,0.04)',   border: 'rgba(0,212,255,0.14)',   label: 'Stable'    },
  improving: { color: '#00e676', bg: 'rgba(0,230,118,0.04)',   border: 'rgba(0,230,118,0.14)',   label: 'Improving' },
}

// ─── Query helpers ─────────────────────────────────────────────────────────────

export function sortedSignals(): OracleSignal[] {
  return [...ORACLE_SIGNALS].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
}

export function getOracleBrief(): OracleBriefData {
  const sorted = sortedSignals()
  const critical = sorted.filter(s => s.priority === 'critical')
  const systemState: SystemState =
    critical.length >= 2 ? 'critical' : critical.length === 1 ? 'watch' : 'stable'

  return {
    generatedAt: new Date().toISOString(),
    systemState,
    systemSummary:
      systemState === 'critical' ? `${critical.length} critical signals active. Immediate action required.`
      : systemState === 'watch'  ? `1 critical signal requires attention.`
      : 'No critical signals. System operating normally.',
    signals: sorted,
  }
}

export function getSignalsForWorkflow(workflowId: string): OracleSignal[] {
  return ORACLE_SIGNALS.filter(s => s.targetType === 'workflow' && s.targetId === workflowId)
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
}

export function getTopRisk(): OracleSignal | undefined {
  return ORACLE_SIGNALS
    .filter(s => s.type === 'risk')
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])[0]
}

export function getTopOpportunity(): OracleSignal | undefined {
  return ORACLE_SIGNALS
    .filter(s => s.type === 'opportunity')
    .sort((a, b) => (b.impactValue ?? 0) - (a.impactValue ?? 0))[0]
}

export function getRecommendedPlay(): OracleSignal | undefined {
  return [...ORACLE_SIGNALS]
    .sort((a, b) => {
      // Critical first, then action, then by priority
      if (a.priority !== b.priority) return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      if (a.type === 'action' && b.type !== 'action') return -1
      return 0
    })[0]
}

export function getWorkflowSignalMap(): Map<string, OracleSignal> {
  const map = new Map<string, OracleSignal>()
  for (const signal of ORACLE_SIGNALS) {
    if (signal.targetType === 'workflow') {
      const existing = map.get(signal.targetId)
      if (!existing || PRIORITY_ORDER[signal.priority] < PRIORITY_ORDER[existing.priority]) {
        map.set(signal.targetId, signal)
      }
    }
  }
  return map
}

export function getWorkflowSignals(): OracleSignal[] {
  return ORACLE_SIGNALS
    .filter(s => s.targetType === 'workflow')
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
}

export function getAnalyticsSummary(): { insight: string; nextPlay: string } {
  return {
    insight: 'Abandoned Cart Recovery drives 41% of total recovered revenue, but step-2 conversion is underperforming. VIP retention has the highest ROI per customer.',
    nextPlay: 'Prioritize VIP At-Risk workflow — $8,940 stalled from paused sequence.',
  }
}
