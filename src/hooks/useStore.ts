import { create } from 'zustand'
import type {
  Patient, FollowupPlan, Feedback, AllergyRecord, Prescription,
  PlanGroup, BusinessTrail, OverdueRecord, RestockAlert, RevisitSuggestion,
  UserRole, RiskLevel, TrailType, SupervisionStatus, PatientStatus, PlanStatus, PrescriptionStatus,
  TriageReason, MedicationChange, FamilySubmission, DrugSubstitution,
  StopMedicationConfirm, IndicatorRecord, ReminderExemption, TriageReasonType,
  ReminderExemptionType, StopConfirmStatus,
} from '@/types'
import {
  patients as mockPatients, followupPlans as mockPlans, planGroups as mockGroups,
  prescriptions as mockPrescriptions, allergies as mockAllergies, feedbacks as mockFeedbacks,
  overdueRecords as mockOverdueRecords, businessTrails as mockTrails,
  restockAlerts as mockRestockAlerts, revisitSuggestions as mockRevisitSuggestions,
  triageReasons as mockTriageReasons, medicationChanges as mockMedicationChanges,
  familySubmissions as mockFamilySubmissions, drugSubstitutions as mockDrugSubstitutions,
  stopMedicationConfirms as mockStopMedicationConfirms, indicatorRecords as mockIndicatorRecords,
  reminderExemptions as mockReminderExemptions,
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
  triageReasons: TriageReason[]
  medicationChanges: MedicationChange[]
  familySubmissions: FamilySubmission[]
  drugSubstitutions: DrugSubstitution[]
  stopMedicationConfirms: StopMedicationConfirm[]
  indicatorRecords: IndicatorRecord[]
  reminderExemptions: ReminderExemption[]
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
  createPlan: (patientId: string, groupId: string, cycleDays: number, prescriptionExpiryDate: string) => string
  submitFeedback: (patientId: string, planId: string, efficacyRating: number, adverseReaction: string, compliance: Feedback['compliance'], note: string, submittedByName?: string, submittedByRole?: UserRole) => void
  markMissedFeedback: (patientId: string) => void
  stopMedication: (patientId: string, reason: string) => void
  archivePatient: (patientId: string) => void
  restoreArchivedPatient: (patientId: string) => boolean
  addAllergy: (patientId: string, drugName: string, severity: AllergyRecord['severity'], note: string) => void
  togglePrivacy: (patientId: string) => void
  superviseOverdue: (recordId: string, status: SupervisionStatus, supervisor: string) => void
  batchRemind: (groupIds: string[]) => void
  smartBatchRemind: (groupIds: string[]) => { reminded: number; exempted: number; reasons: string[] }
  checkPrescriptionExpiry: () => void
  updateRestockAlert: (id: string, status: RestockAlert['status']) => void
  updateRevisitSuggestion: (id: string, status: RevisitSuggestion['status']) => void
  addRevisitSuggestion: (patientId: string, prescriptionId: string, reason: string, suggestion: string) => void
  reTriagePatient: (patientId: string, newRiskLevel: RiskLevel, reason: TriageReasonType, detail: string) => void
  resolveTriageReason: (triageId: string, resolvedBy: string) => void
  addTriageReason: (patientId: string, type: TriageReasonType, title: string, detail: string, severity: 'high' | 'medium' | 'low') => void
  addMedicationChange: (patientId: string, oldDrug: string, newDrug: string, reason: string, changedBy: string) => void
  approveStopConfirm: (stopId: string, approver: string, note: string) => void
  rejectStopConfirm: (stopId: string, approver: string, note: string) => void
  requestStopMedication: (patientId: string, requestedBy: string, reason: string) => void
  updateDrugSubstitution: (id: string, status: 'accepted' | 'rejected') => void
  addReminderExemption: (patientId: string, type: ReminderExemptionType, reason: string, exemptDays: number, createdBy: string) => void
  isPatientExempted: (patientId: string) => { exempted: boolean; exemption?: ReminderExemption }
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
  family: '家属',
}

const riskLabels: Record<RiskLevel, string> = {
  normal: '普通跟进',
  attention: '重点关注',
  critical: '风险预警',
}

const riskUpgradeMap: Record<RiskLevel, RiskLevel | null> = {
  normal: 'attention',
  attention: 'critical',
  critical: null,
}

const addDays = (date: Date, days: number): string => {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
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
  triageReasons: mockTriageReasons,
  medicationChanges: mockMedicationChanges,
  familySubmissions: mockFamilySubmissions,
  drugSubstitutions: mockDrugSubstitutions,
  stopMedicationConfirms: mockStopMedicationConfirms,
  indicatorRecords: mockIndicatorRecords,
  reminderExemptions: mockReminderExemptions,
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
    if (patient == null) return 'error:no_patient'
    if (patient.status !== 'active') {
      get().addTrail('prescription_expired', patientId, '创建随访计划失败：患者状态非活跃')
      return 'error:patient_inactive'
    }
    if (!patient.privacyAuthorized) {
      get().addTrail('privacy_changed', patientId, '创建随访计划失败：患者未授权隐私协议')
      return 'error:no_privacy'
    }
    const todayStr = today()
    if (prescriptionExpiryDate < todayStr) {
      const patientRxs = state.prescriptions.filter((p) => p.patientId === patientId)
      const validRx = patientRxs.find((p) => p.status === 'valid')
      const targetRx = validRx || patientRxs[0]
      let newSuggestions = state.revisitSuggestions
      if (targetRx) {
        const existingSuggestion = state.revisitSuggestions.find(
          (s) => s.prescriptionId === targetRx.id && s.status === 'pending'
        )
        if (!existingSuggestion) {
          const suggestion: RevisitSuggestion = {
            id: `rs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            patientId,
            prescriptionId: targetRx.id,
            reason: `创建随访计划时拦截：处方到期日「${prescriptionExpiryDate}」已过期，不可创建进行中随访计划`,
            suggestion: '请先联系患者复诊续方，获得新处方后再创建随访计划',
            status: 'pending',
            createdAt: now(),
          }
          newSuggestions = [...state.revisitSuggestions, suggestion]
        }
      } else {
        const existingSuggestion = state.revisitSuggestions.find(
          (s) => s.patientId === patientId && s.status === 'pending'
        )
        if (!existingSuggestion) {
          const suggestion: RevisitSuggestion = {
            id: `rs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            patientId,
            prescriptionId: '',
            reason: `创建随访计划时拦截：处方到期日「${prescriptionExpiryDate}」已过期，不可创建进行中随访计划`,
            suggestion: '请先联系患者复诊续方，获得新处方后再创建随访计划',
            status: 'pending',
            createdAt: now(),
          }
          newSuggestions = [...state.revisitSuggestions, suggestion]
        }
      }
      if (targetRx && targetRx.status === 'valid') {
        const updatedRxs = state.prescriptions.map((p) =>
          p.id === targetRx.id ? { ...p, status: 'expired' as PrescriptionStatus } : p
        )
        set({ prescriptions: updatedRxs, revisitSuggestions: newSuggestions })
      } else {
        set({ revisitSuggestions: newSuggestions })
      }
      get().addTrail(
        'prescription_expired',
        patientId,
        `创建随访计划处方过期拦截：处方到期日「${prescriptionExpiryDate}」已过期，无法创建进行中随访计划，已生成复诊建议并通知店长关注`
      )
      return 'error:prescription_expired'
    }
    const patientAllergies = state.allergies.filter((a) => a.patientId === patientId)
    const patientPrescriptions = state.prescriptions.filter((p) => p.patientId === patientId && p.status === 'valid')
    for (const rx of patientPrescriptions) {
      const hasConflict = patientAllergies.some((a) => rx.drugName.includes(a.drugName) || a.drugName.includes(rx.drugName))
      if (hasConflict) {
        get().addTrail('allergy_added', patientId, `创建随访计划失败：处方药品「${rx.drugName}」与过敏记录「${patientAllergies.find(a => rx.drugName.includes(a.drugName))?.drugName}」冲突`)
        return 'error:allergy_conflict'
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

  submitFeedback: (patientId, planId, efficacyRating, adverseReaction, compliance, note, submittedByName, submittedByRole) => {
    const state = get()
    const actRole = submittedByRole || state.currentRole
    const fb: Feedback = {
      id: `fb-${Date.now()}`,
      patientId,
      planId,
      efficacyRating,
      adverseReaction,
      compliance,
      submittedBy: actRole,
      submittedByName,
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
    let newFamilySubmissions = state.familySubmissions
    let newTriageReasons = state.triageReasons
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
    if (actRole === 'family' && submittedByName) {
      const fs: FamilySubmission = {
        id: `fs-${Date.now()}`,
        patientId,
        feedbackId: fb.id,
        familyName: submittedByName,
        relation: '家属',
        phone: state.patients.find((p) => p.id === patientId)?.familyContact?.phone || '',
        submittedAt: now(),
        note: '家属代填反馈记录',
      }
      newFamilySubmissions = [...state.familySubmissions, fs]
      const triage: TriageReason = {
        id: `tr-${Date.now()}-fs`,
        patientId,
        type: 'family_submission',
        title: '家属代填反馈，信息需核实',
        detail: `最近一次反馈由家属${submittedByName}代填，建议电话沟通确认患者真实情况`,
        severity: 'low',
        triggeredAt: now(),
      }
      newTriageReasons = [...state.triageReasons, triage]
      get().addTrail('family_submitted', patientId, `家属${submittedByName}代填反馈，已触发重新分层评估`)
    }
    if (compliance === 'poor' || adverseReaction && adverseReaction !== '无' && adverseReaction !== '') {
      const existingTriage = state.triageReasons.find(
        (t) => t.patientId === patientId && !t.resolved && (t.type === 'compliance_poor' || t.type === 'adverse_reaction')
      )
      if (!existingTriage) {
        const triage: TriageReason = {
          id: `tr-${Date.now()}-ac`,
          patientId,
          type: compliance === 'poor' ? 'compliance_poor' : 'adverse_reaction',
          title: compliance === 'poor' ? '依从性较差，建议加强随访' : `出现不良反应：${adverseReaction}`,
          detail: compliance === 'poor' ? '近期反馈依从性持续较差，需加强用药指导和提醒频率' : `反馈报告不良反应：${adverseReaction}，建议评估是否调整用药方案`,
          severity: compliance === 'poor' ? 'high' : 'medium',
          triggeredAt: now(),
        }
        newTriageReasons = [...newTriageReasons, triage]
        get().addTrail('triage_changed', patientId, compliance === 'poor' ? '依从性差触发重新分层评估' : '出现不良反应触发重新分层评估')
      }
    }
    set({ feedbacks: newFeedbacks, plans: newPlans, patients: newPatients, overdueRecords: newOverdue, revisitSuggestions: newSuggestions, familySubmissions: newFamilySubmissions, triageReasons: newTriageReasons })
    get().addTrail('feedback_changed', patientId, `${submittedByName ? submittedByName + '（家属）' : roleLabel[actRole]}提交随访反馈，疗效评分${efficacyRating}分，依从性：${compliance === 'good' ? '良好' : compliance === 'moderate' ? '一般' : '较差'}`)
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
    const patient = state.patients.find((p) => p.id === patientId)
    if (!patient) return
    if (patient.status === 'archived') {
      get().addTrail('medication_stopped', patientId, '操作拒绝：已归档患者不可执行停药，请先确认归档状态')
      return
    }
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
    const patient = state.patients.find((p) => p.id === patientId)
    if (!patient) return
    if (patient.status !== 'stopped') {
      get().addTrail('medication_stopped', patientId, '归档拒绝：仅已停药患者可归档，请先执行停药操作')
      return
    }
    const newPatients = state.patients.map((p) =>
      p.id === patientId ? { ...p, status: 'archived' as PatientStatus, archivedAt: today() } : p
    )
    const newPlans = state.plans.map((p) =>
      p.patientId === patientId ? { ...p, status: 'expired' as PlanStatus, updatedAt: today() } : p
    )
    set({ patients: newPatients, plans: newPlans })
    get().addTrail('medication_stopped', patientId, '患者已归档，历史提醒已锁定不可误恢复')
  },

  restoreArchivedPatient: (patientId) => {
    const state = get()
    const patient = state.patients.find((p) => p.id === patientId)
    if (!patient || patient.status !== 'archived') return false
    if (patient.archivedAt) {
      const archivedDays = Math.ceil((Date.now() - new Date(patient.archivedAt).getTime()) / (1000 * 60 * 60 * 24))
      if (archivedDays > 30) {
        get().addTrail('medication_stopped', patientId, `恢复归档拒绝：归档已超过${archivedDays}天，历史提醒已锁定不可恢复，需重新建档`)
        return false
      }
    }
    const confirm = window.confirm(`即将恢复患者「${patient.name}」，归档超过30天不可恢复。\n确定要恢复吗？恢复后需手动重建随访计划。`)
    if (!confirm) return false
    const newPatients = state.patients.map((p) =>
      p.id === patientId ? { ...p, status: 'stopped' as PatientStatus } : p
    )
    set({ patients: newPatients })
    get().addTrail('medication_stopped', patientId, '归档患者恢复为停药状态，需手动评估后创建新随访计划')
    return true
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

  batchRemind: (groupIds) => {
    const result = get().smartBatchRemind(groupIds)
    if (result.exempted > 0) {
      alert(`批量提醒完成：已提醒${result.reminded}位，豁免${result.exempted}位\n豁免原因：${result.reasons.join('；')}`)
    }
  },

  smartBatchRemind: (groupIds) => {
    const state = get()
    const targetGroupIds = new Set(groupIds)
    const targetPlans = state.plans.filter((p) => targetGroupIds.has(p.groupId) && p.status === 'active')
    let reminded = 0
    let exempted = 0
    const reasons: string[] = []
    for (const plan of targetPlans) {
      const patient = state.patients.find((p) => p.id === plan.patientId)
      if (!patient || patient.status !== 'active') continue
      const exemptInfo = state.isPatientExempted(patient.id)
      if (exemptInfo.exempted && exemptInfo.exemption) {
        exempted++
        if (!reasons.includes(exemptInfo.exemption.reason)) {
          reasons.push(exemptInfo.exemption.reason)
        }
        get().addTrail('reminder_exempted', patient.id, `批量提醒豁免：${exemptInfo.exemption.reason}`)
        continue
      }
      if (!patient.privacyAuthorized) {
        exempted++
        const reason = `${patient.name}未授权隐私协议`
        if (!reasons.includes(reason)) reasons.push(reason)
        continue
      }
      get().addTrail('batch_reminder', patient.id, '批量随访提醒已发送')
      reminded++
    }
    const groupNames = state.groups.filter((g) => groupIds.includes(g.id)).map((g) => g.name).join('、')
    get().addTrail('batch_reminder', 'system', `批量提醒（智能豁免模式）已发送到${groupNames}，已提醒${reminded}位，豁免${exempted}位`)
    return { reminded, exempted, reasons }
  },

  reTriagePatient: (patientId, newRiskLevel, reason, detail) => {
    const state = get()
    const patient = state.patients.find((p) => p.id === patientId)
    if (!patient) return
    const oldRisk = patient.riskLevel
    const newPatients = state.patients.map((p) =>
      p.id === patientId ? { ...p, riskLevel: newRiskLevel } : p
    )
    const triage: TriageReason = {
      id: `tr-${Date.now()}`,
      patientId,
      type: reason,
      title: `风险分层调整：${riskLabels[oldRisk]} → ${riskLabels[newRiskLevel]}`,
      detail,
      severity: newRiskLevel === 'critical' ? 'high' : newRiskLevel === 'attention' ? 'medium' : 'low',
      triggeredAt: now(),
    }
    set({ patients: newPatients, triageReasons: [...state.triageReasons, triage] })
    get().addTrail('triage_changed', patientId, `药师手动重新分层：风险等级从${riskLabels[oldRisk]}调整为${riskLabels[newRiskLevel]}，原因：${detail}`)
  },

  resolveTriageReason: (triageId, resolvedBy) => {
    const state = get()
    const newReasons = state.triageReasons.map((t) =>
      t.id === triageId ? { ...t, resolved: true, resolvedAt: now(), resolvedBy } : t
    )
    const triage = state.triageReasons.find((t) => t.id === triageId)
    set({ triageReasons: newReasons })
    if (triage) {
      get().addTrail('triage_changed', triage.patientId, `分层原因「${triage.title}」已标记解决，处理人：${resolvedBy}`)
    }
  },

  addTriageReason: (patientId, type, title, detail, severity) => {
    const state = get()
    const existing = state.triageReasons.find(
      (t) => t.patientId === patientId && t.type === type && !t.resolved
    )
    if (existing) return
    const triage: TriageReason = {
      id: `tr-${Date.now()}`,
      patientId,
      type,
      title,
      detail,
      severity,
      triggeredAt: now(),
    }
    set({ triageReasons: [...state.triageReasons, triage] })
    get().addTrail('triage_changed', patientId, `新增分层触发：${title}`)
  },

  addMedicationChange: (patientId, oldDrug, newDrug, reason, changedBy) => {
    const state = get()
    const mc: MedicationChange = {
      id: `mc-${Date.now()}`,
      patientId,
      oldDrug,
      newDrug,
      reason,
      changedBy,
      changedAt: now(),
    }
    const triage: TriageReason = {
      id: `tr-${Date.now()}-mc`,
      patientId,
      type: 'medication_change',
      title: `近期换药：${oldDrug} → ${newDrug}`,
      detail: `更换原因：${reason}，需密切观察患者用药后反应及指标变化`,
      severity: 'medium',
      triggeredAt: now(),
    }
    set({
      medicationChanges: [...state.medicationChanges, mc],
      triageReasons: [...state.triageReasons, triage],
    })
    get().addTrail('medication_changed', patientId, `药师调整用药：${oldDrug}更换为${newDrug}，原因：${reason}`)
  },

  approveStopConfirm: (stopId, approver, note) => {
    const state = get()
    const stopRecord = state.stopMedicationConfirms.find((s) => s.id === stopId)
    if (!stopRecord) return
    const newConfirms = state.stopMedicationConfirms.map((s) =>
      s.id === stopId ? { ...s, status: 'approved' as StopConfirmStatus, approver, approvedAt: now(), approvedNote: note } : s
    )
    set({ stopMedicationConfirms: newConfirms })
    get().stopMedication(stopRecord.patientId, `${stopRecord.requestReason}；店长批准意见：${note}`)
    get().addTrail('stop_confirmed', stopRecord.patientId, `停药申请已批准，批准人：${approver}，意见：${note}`)
  },

  rejectStopConfirm: (stopId, approver, note) => {
    const state = get()
    const stopRecord = state.stopMedicationConfirms.find((s) => s.id === stopId)
    if (!stopRecord) return
    const newConfirms = state.stopMedicationConfirms.map((s) =>
      s.id === stopId ? { ...s, status: 'rejected' as StopConfirmStatus, approver, approvedAt: now(), approvedNote: note } : s
    )
    set({ stopMedicationConfirms: newConfirms })
    get().addTrail('stop_confirmed', stopRecord.patientId, `停药申请已驳回，驳回人：${approver}，原因：${note}`)
  },

  requestStopMedication: (patientId, requestedBy, reason) => {
    const state = get()
    const sc: StopMedicationConfirm = {
      id: `sc-${Date.now()}`,
      patientId,
      requestedBy,
      requestReason: reason,
      status: 'pending',
      createdAt: now(),
    }
    const exemption: ReminderExemption = {
      id: `re-${Date.now()}-stop`,
      patientId,
      type: 'stop_pending',
      reason: `停药申请待店长确认中（申请人：${requestedBy}），暂停催办`,
      exemptedUntil: addDays(new Date(), 7),
      createdBy: '系统',
      createdAt: now(),
    }
    set({
      stopMedicationConfirms: [...state.stopMedicationConfirms, sc],
      reminderExemptions: [...state.reminderExemptions, exemption],
    })
    get().addTrail('stop_confirmed', patientId, `提交停药申请：${reason}，待店长确认`)
  },

  updateDrugSubstitution: (id, status) => {
    const state = get()
    const ds = state.drugSubstitutions.find((d) => d.id === id)
    if (!ds) return
    const newSubs = state.drugSubstitutions.map((d) =>
      d.id === id ? { ...d, status } : d
    )
    set({ drugSubstitutions: newSubs })
    get().addTrail('drug_substituted', ds.patientId,
      status === 'accepted'
        ? `药品替代已接受：${ds.originalDrug} → ${ds.substituteDrug}`
        : `药品替代已拒绝：保持原方案${ds.originalDrug}`
    )
  },

  addReminderExemption: (patientId, type, reason, exemptDays, createdBy) => {
    const state = get()
    const re: ReminderExemption = {
      id: `re-${Date.now()}`,
      patientId,
      type,
      reason,
      exemptedUntil: addDays(new Date(), exemptDays),
      createdBy,
      createdAt: now(),
    }
    set({ reminderExemptions: [...state.reminderExemptions, re] })
    get().addTrail('reminder_exempted', patientId, `添加催办豁免，类型：${type}，原因：${reason}，豁免${exemptDays}天`)
  },

  isPatientExempted: (patientId) => {
    const state = get()
    const todayStr = today()
    const exemption = state.reminderExemptions.find(
      (r) => r.patientId === patientId && r.exemptedUntil >= todayStr
    )
    if (exemption) {
      return { exempted: true, exemption }
    }
    const revisit = state.revisitSuggestions.find(
      (r) => r.patientId === patientId && r.status !== 'confirmed' && r.revisitAppointedAt && r.revisitAppointedAt >= todayStr
    )
    if (revisit && revisit.revisitAppointedAt) {
      const autoExemption: ReminderExemption = {
        id: `auto-${patientId}-revisit`,
        patientId,
        type: 'revisit_appointed',
        reason: `患者已预约${revisit.revisitAppointedAt}复诊续方，催办自动豁免至复诊后`,
        exemptedUntil: addDays(new Date(revisit.revisitAppointedAt), 2),
        createdBy: '系统自动',
        createdAt: now(),
      }
      return { exempted: true, exemption: autoExemption }
    }
    return { exempted: false }
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
