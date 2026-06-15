import { create } from 'zustand'
import type {
  Patient, FollowupPlan, Feedback, AllergyRecord, Prescription,
  PlanGroup, BusinessTrail, OverdueRecord, RestockAlert, RevisitSuggestion,
  UserRole, RiskLevel, TrailType, SupervisionStatus, PatientStatus, PlanStatus, PrescriptionStatus,
} from '@/types'
import {
  patients as mockPatients, followupPlans as mockPlans, planGroups as mockGroups,
  prescriptions as mockPrescriptions, allergies as mockAllergies, feedbacks as mockFeedbacks,
  overdueRecords as mockOverdueRecords, businessTrails as mockTrails,
  restockAlerts as mockRestockAlerts, revisitSuggestions as mockRevisitSuggestions,
} from '@/lib/mockData'

interface StoreState {
  patients: Patient[]
  plans: FollowupPlan[]
  groups: PlanGroup[]
  prescriptions: Prescription[]
  allergies: AllergyRecord[]
  feedbacks: Feedback[]
  overdueRecords: OverdueRecord[]
  trails: BusinessTrail[]
  restockAlerts: RestockAlert[]
  revisitSuggestions: RevisitSuggestion[]
  currentRole: UserRole
  selectedPatientId: string | null
  sidebarCollapsed: boolean
  showCreatePlanModal: boolean
  showFeedbackModal: boolean
  showAllergyModal: boolean
  showRevisitModal: boolean
  showStopMedicationModal: boolean
}

interface StoreActions {
  setCurrentRole: (role: UserRole) => void
  addTrail: (type: TrailType, patientId: string, description: string) => void
  createPlan: (patientId: string, groupId: string, cycleDays: number, prescriptionExpiryDate: string) => string | null
  submitFeedback: (patientId: string, planId: string, efficacyRating: number, adverseReaction: string, compliance: Feedback['compliance'], note: string) => void
  markMissedFeedback: (patientId: string) => void
  stopMedication: (patientId: string, reason: string) => void
  archivePatient: (patientId: string) => void
  addAllergy: (patientId: string, drugName: string, severity: AllergyRecord['severity'], note: string) => void
  togglePrivacy: (patientId: string) => void
  superviseOverdue: (recordId: string, status: SupervisionStatus, supervisor: string) => void
  batchRemind: (groupIds: string[]) => void
  checkPrescriptionExpiry: () => void
  updateRestockAlert: (id: string, status: RestockAlert['status']) => void
  updateRevisitSuggestion: (id: string, status: RevisitSuggestion['status']) => void
  addRevisitSuggestion: (patientId: string, prescriptionId: string, reason: string, suggestion: string) => void
  selectPatient: (id: string) => void
  deselectPatient: () => void
  toggleSidebar: () => void
  setShowCreatePlanModal: (show: boolean) => void
  setShowFeedbackModal: (show: boolean) => void
  setShowAllergyModal: (show: boolean) => void
  setShowRevisitModal: (show: boolean) => void
  setShowStopMedicationModal: (show: boolean) => void
}

const today = () => new Date().toISOString().slice(0, 10)
const now = () => new Date().toISOString()

const roleLabel: Record<UserRole, string> = {
  pharmacist: '药师',
  patient: '患者',
  manager: '管理员',
}

const riskUpgradeMap: Record<RiskLevel, RiskLevel | null> = {
  normal: 'attention',
  attention: 'critical',
  critical: null,
}

export const useStore = create<StoreState & StoreActions>()((set, get) => ({
  patients: mockPatients,
  plans: mockPlans,
  groups: mockGroups,
  prescriptions: mockPrescriptions,
  allergies: mockAllergies,
  feedbacks: mockFeedbacks,
  overdueRecords: mockOverdueRecords,
  trails: mockTrails,
  restockAlerts: mockRestockAlerts,
  revisitSuggestions: mockRevisitSuggestions,
  currentRole: 'pharmacist',
  selectedPatientId: null,
  sidebarCollapsed: false,
  showCreatePlanModal: false,
  showFeedbackModal: false,
  showAllergyModal: false,
  showRevisitModal: false,
  showStopMedicationModal: false,

  setCurrentRole: (role) => set({ currentRole: role }),

  addTrail: (type, patientId, description) => {
    const state = get()
    const patient = state.patients.find((p) => p.id === patientId)
    if (patient == null) return
    const trail: BusinessTrail = {
      id: `bt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      patientId,
      patientName: patient.name,
      type,
      description,
      operator: roleLabel[state.currentRole],
      operatorRole: state.currentRole,
      timestamp: now(),
    }
    set({ trails: [...state.trails, trail] })
  },

  createPlan: (patientId, groupId, cycleDays, prescriptionExpiryDate) => {
    const state = get()
    const patient = state.patients.find((p) => p.id === patientId)
    if (patient == null) return null
    if (patient.status !== 'active') {
      get().addTrail('prescription_expired', patientId, '创建随访计划失败：患者状态非活跃')
      return null
    }
    if (!patient.privacyAuthorized) {
      get().addTrail('privacy_changed', patientId, '创建随访计划失败：患者未授权隐私协议')
      return null
    }
    const patientAllergies = state.allergies.filter((a) => a.patientId === patientId)
    const patientPrescriptions = state.prescriptions.filter((p) => p.patientId === patientId && p.status === 'valid')
    for (const rx of patientPrescriptions) {
      const hasConflict = patientAllergies.some((a) => rx.drugName.includes(a.drugName) || a.drugName.includes(rx.drugName))
      if (hasConflict) {
        get().addTrail('allergy_added', patientId, `创建随访计划失败：处方药品「${rx.drugName}」与过敏记录「${patientAllergies.find(a => rx.drugName.includes(a.drugName))?.drugName}」冲突`)
        return null
      }
    }
    const planId = `fp-${Date.now()}`
    const nextDate = new Date()
    nextDate.setDate(nextDate.getDate() + cycleDays)
    const plan: FollowupPlan = {
      id: planId,
      patientId,
      groupId,
      cycleDays,
      nextFollowupDate: nextDate.toISOString().slice(0, 10),
      prescriptionExpiryDate,
      status: 'active',
      createdAt: today(),
      updatedAt: today(),
    }
    set({ plans: [...state.plans, plan] })
    get().addTrail('plan_created', patientId, `创建随访计划，周期${cycleDays}天，分组：${state.groups.find(g => g.id === groupId)?.name}`)
    return planId
  },

  submitFeedback: (patientId, planId, efficacyRating, adverseReaction, compliance, note) => {
    const state = get()
    const fb: Feedback = {
      id: `fb-${Date.now()}`,
      patientId,
      planId,
      efficacyRating,
      adverseReaction,
      compliance,
      submittedBy: state.currentRole,
      note,
      submittedAt: now(),
    }
    const newFeedbacks = [...state.feedbacks, fb]
    const newPlans = state.plans.map((p) =>
      p.id === planId ? {
        ...p,
        lastFeedbackDate: today(),
        updatedAt: today(),
      } : p
    )
    const newPatients = state.patients.map((p) =>
      p.id === patientId ? { ...p, consecutiveMissedFeedback: 0 } : p
    )
    const newOverdue = state.overdueRecords.filter((r) => r.patientId !== patientId || r.planId !== planId)
    const prescription = state.prescriptions.find((pr) => pr.patientId === patientId && pr.status === 'valid')
    let newSuggestions = state.revisitSuggestions
    if (!prescription) {
      const patientRx = state.prescriptions.find((pr) => pr.patientId === patientId)
      if (patientRx) {
        const suggestion: RevisitSuggestion = {
          id: `rs-${Date.now()}`,
          patientId,
          prescriptionId: patientRx.id,
          reason: '处方已过期，患者提交反馈时自动提醒复诊',
          suggestion: '建议尽快复诊续方，评估当前用药方案',
          status: 'pending',
          createdAt: now(),
        }
        newSuggestions = [...state.revisitSuggestions, suggestion]
        get().addTrail('revisit_suggested', patientId, '处方过期，自动生成复诊建议')
      }
    }
    set({ feedbacks: newFeedbacks, plans: newPlans, patients: newPatients, overdueRecords: newOverdue, revisitSuggestions: newSuggestions })
    get().addTrail('feedback_changed', patientId, `提交随访反馈，疗效评分${efficacyRating}分，依从性：${compliance === 'good' ? '良好' : compliance === 'moderate' ? '一般' : '较差'}`)
  },

  markMissedFeedback: (patientId) => {
    const state = get()
    const patient = state.patients.find((p) => p.id === patientId)
    if (!patient) return
    const newCount = patient.consecutiveMissedFeedback + 1
    const newPatients = state.patients.map((p) =>
      p.id === patientId ? { ...p, consecutiveMissedFeedback: newCount } : p
    )
    if (newCount >= 2) {
      const upgraded = riskUpgradeMap[patient.riskLevel]
      if (upgraded) {
        const upgradedPatients = newPatients.map((p) =>
          p.id === patientId ? { ...p, riskLevel: upgraded } : p
        )
        set({ patients: upgradedPatients })
        get().addTrail('overdue_escalated', patientId, `连续${newCount}次未反馈，风险等级从${patient.riskLevel}升级为${upgraded}`)
      } else {
        set({ patients: newPatients })
        get().addTrail('overdue_escalated', patientId, `连续${newCount}次未反馈，已进入重点关注名单`)
      }
    } else {
      set({ patients: newPatients })
      get().addTrail('overdue_escalated', patientId, `第${newCount}次未反馈`)
    }
  },

  stopMedication: (patientId, reason) => {
    const state = get()
    const newPatients = state.patients.map((p) =>
      p.id === patientId ? { ...p, status: 'stopped' as PatientStatus, stoppedAt: today() } : p
    )
    const newPlans = state.plans.map((p) =>
      p.patientId === patientId && p.status === 'active' ? { ...p, status: 'suspended' as PlanStatus, updatedAt: today() } : p
    )
    set({ patients: newPatients, plans: newPlans })
    get().addTrail('medication_stopped', patientId, `停药处理，原因：${reason}，已暂停所有活跃计划`)
  },

  archivePatient: (patientId) => {
    const state = get()
    const newPatients = state.patients.map((p) =>
      p.id === patientId ? { ...p, status: 'archived' as PatientStatus, archivedAt: today() } : p
    )
    set({ patients: newPatients })
    get().addTrail('medication_stopped', patientId, '患者已归档')
  },

  addAllergy: (patientId, drugName, severity, note) => {
    const state = get()
    const allergy: AllergyRecord = {
      id: `al-${Date.now()}`,
      patientId,
      drugName,
      severity,
      note,
    }
    set({ allergies: [...state.allergies, allergy] })
    get().addTrail('allergy_added', patientId, `新增${severity === 'severe' ? '严重' : severity === 'moderate' ? '中度' : '轻度'}过敏记录：${drugName}`)
  },

  togglePrivacy: (patientId) => {
    const state = get()
    const patient = state.patients.find((p) => p.id === patientId)
    if (!patient) return
    const newAuthorized = !patient.privacyAuthorized
    const newPatients = state.patients.map((p) =>
      p.id === patientId ? { ...p, privacyAuthorized: newAuthorized } : p
    )
    set({ patients: newPatients })
    get().addTrail('privacy_changed', patientId, `隐私授权状态变更为${newAuthorized ? '已授权' : '未授权'}`)
    if (!newAuthorized) {
      const newPlans = state.plans.map((p) =>
        p.patientId === patientId && p.status === 'active' ? { ...p, status: 'suspended' as PlanStatus, updatedAt: today() } : p
      )
      set({ plans: newPlans })
      get().addTrail('privacy_changed', patientId, '隐私授权撤回，已自动暂停随访计划')
    }
  },

  superviseOverdue: (recordId, status, supervisor) => {
    const state = get()
    const newRecords = state.overdueRecords.map((r) =>
      r.id === recordId ? { ...r, supervisionStatus: status, supervisor, supervisedAt: now() } : r
    )
    set({ overdueRecords: newRecords })
    const record = state.overdueRecords.find((r) => r.id === recordId)
    if (record) {
      const statusText: Record<SupervisionStatus, string> = {
        pending: '待处理',
        contacted: '已联系',
        appointing: '已预约',
        escalated: '已升级',
      }
      get().addTrail('overdue_escalated', record.patientId, `督办状态更新为：${statusText[status]}，督办人：${supervisor}`)
    }
  },

  batchRemind: (groupIds) => {
    const state = get()
    const targetGroupIds = new Set(groupIds)
    const targetPlans = state.plans.filter((p) => targetGroupIds.has(p.groupId) && p.status === 'active')
    let count = 0
    for (const plan of targetPlans) {
      const patient = state.patients.find((p) => p.id === plan.patientId)
      if (patient && patient.privacyAuthorized && patient.status === 'active') {
        get().addTrail('batch_reminder', patient.id, '批量随访提醒已发送')
        count++
      }
    }
    const groupNames = state.groups.filter((g) => groupIds.includes(g.id)).map((g) => g.name).join('、')
    get().addTrail('batch_reminder', 'system', `批量提醒已发送到${groupNames}，共${count}位患者`)
  },

  checkPrescriptionExpiry: () => {
    const state = get()
    const todayStr = today()
    let newPrescriptions = state.prescriptions
    let newSuggestions = state.revisitSuggestions
    for (const rx of state.prescriptions) {
      if (rx.status === 'valid' && rx.expiryDate < todayStr) {
        newPrescriptions = newPrescriptions.map((p) =>
          p.id === rx.id ? { ...p, status: 'expired' as PrescriptionStatus } : p
        )
        const existingSuggestion = state.revisitSuggestions.find((s) => s.prescriptionId === rx.id && s.status === 'pending')
        if (!existingSuggestion) {
          const suggestion: RevisitSuggestion = {
            id: `rs-${Date.now()}-${rx.id}`,
            patientId: rx.patientId,
            prescriptionId: rx.id,
            reason: `处方「${rx.drugName}」已过期`,
            suggestion: '建议尽快复诊，由医生评估是否续方或调整用药方案',
            status: 'pending',
            createdAt: now(),
          }
          newSuggestions = [...newSuggestions, suggestion]
          get().addTrail('prescription_expired', rx.patientId, `处方「${rx.drugName}」已过期，自动生成复诊建议`)
        }
      }
    }
    set({ prescriptions: newPrescriptions, revisitSuggestions: newSuggestions })
  },

  updateRestockAlert: (id, status) => {
    const state = get()
    const newAlerts = state.restockAlerts.map((a) =>
      a.id === id ? { ...a, status } : a
    )
    set({ restockAlerts: newAlerts })
  },

  updateRevisitSuggestion: (id, status) => {
    const state = get()
    const newSuggestions = state.revisitSuggestions.map((s) =>
      s.id === id ? { ...s, status } : s
    )
    set({ revisitSuggestions: newSuggestions })
    const suggestion = state.revisitSuggestions.find((s) => s.id === id)
    if (suggestion) {
      get().addTrail('revisit_suggested', suggestion.patientId, `复诊建议状态更新为：${status === 'sent' ? '已通知' : '已确认'}`)
    }
  },

  addRevisitSuggestion: (patientId, prescriptionId, reason, suggestion) => {
    const state = get()
    const rs: RevisitSuggestion = {
      id: `rs-${Date.now()}`,
      patientId,
      prescriptionId,
      reason,
      suggestion,
      status: 'pending',
      createdAt: now(),
    }
    set({ revisitSuggestions: [...state.revisitSuggestions, rs] })
    get().addTrail('revisit_suggested', patientId, `人工发起复诊建议：${reason}`)
  },

  selectPatient: (id) => set({ selectedPatientId: id }),
  deselectPatient: () => set({ selectedPatientId: null }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  setShowCreatePlanModal: (show) => set({ showCreatePlanModal: show }),
  setShowFeedbackModal: (show) => set({ showFeedbackModal: show }),
  setShowAllergyModal: (show) => set({ showAllergyModal: show }),
  setShowRevisitModal: (show) => set({ showRevisitModal: show }),
  setShowStopMedicationModal: (show) => set({ showStopMedicationModal: show }),
}))
