import type { Patient, FollowupPlan, Feedback, AllergyRecord, Prescription, PlanGroup, BusinessTrail, OverdueRecord, RestockAlert, RevisitSuggestion } from '@/types'

const today = new Date()
const addDays = (date: Date, days: number) => {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
const addDaysWithTime = (date: Date, days: number, hours = 9, minutes = 0) => {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  d.setHours(hours, minutes, 0, 0)
  return d.toISOString()
}
const formatDate = (date: Date) => date.toISOString().slice(0, 10)
const formatDateTime = (date: Date) => date.toISOString()

export const planGroups: PlanGroup[] = [
  { id: 'grp-1', name: '糖尿病-普通组', diseaseType: '糖尿病', riskLevel: 'normal' },
  { id: 'grp-2', name: '糖尿病-重点组', diseaseType: '糖尿病', riskLevel: 'attention' },
  { id: 'grp-3', name: '高血压-普通组', diseaseType: '高血压', riskLevel: 'normal' },
  { id: 'grp-4', name: '冠心病-重点组', diseaseType: '冠心病', riskLevel: 'attention' },
  { id: 'grp-5', name: '慢阻肺-普通组', diseaseType: '慢阻肺', riskLevel: 'normal' },
]

export const patients: Patient[] = [
  { id: 'p-01', name: '张建国', age: 68, gender: '男', phone: '13800001001', chronicDisease: '高血压', riskLevel: 'attention', status: 'active', groupId: 'grp-3', consecutiveMissedFeedback: 0, privacyAuthorized: true, createdAt: addDays(today, -150) },
  { id: 'p-02', name: '李秀英', age: 62, gender: '女', phone: '13800001002', chronicDisease: '糖尿病', riskLevel: 'critical', status: 'active', groupId: 'grp-2', consecutiveMissedFeedback: 2, privacyAuthorized: true, createdAt: addDays(today, -210) },
  { id: 'p-03', name: '王德明', age: 75, gender: '男', phone: '13800001003', chronicDisease: '慢阻肺', riskLevel: 'normal', status: 'stopped', groupId: 'grp-5', consecutiveMissedFeedback: 0, privacyAuthorized: true, stoppedAt: addDays(today, -65), createdAt: addDays(today, -280) },
  { id: 'p-04', name: '陈美华', age: 70, gender: '女', phone: '13800001004', chronicDisease: '冠心病', riskLevel: 'attention', status: 'active', groupId: 'grp-4', consecutiveMissedFeedback: 0, privacyAuthorized: true, createdAt: addDays(today, -190) },
  { id: 'p-05', name: '赵志强', age: 55, gender: '男', phone: '13800001005', chronicDisease: '哮喘', riskLevel: 'normal', status: 'active', groupId: 'grp-5', consecutiveMissedFeedback: 0, privacyAuthorized: false, createdAt: addDays(today, -85) },
  { id: 'p-06', name: '刘桂兰', age: 71, gender: '女', phone: '13800001006', chronicDisease: '糖尿病', riskLevel: 'attention', status: 'active', groupId: 'grp-2', consecutiveMissedFeedback: 1, privacyAuthorized: true, createdAt: addDays(today, -250) },
  { id: 'p-07', name: '孙丽萍', age: 58, gender: '女', phone: '13800001007', chronicDisease: '高血压', riskLevel: 'normal', status: 'active', groupId: 'grp-3', consecutiveMissedFeedback: 0, privacyAuthorized: true, createdAt: addDays(today, -105) },
  { id: 'p-08', name: '周伟', age: 64, gender: '男', phone: '13800001008', chronicDisease: '糖尿病', riskLevel: 'attention', status: 'active', groupId: 'grp-2', consecutiveMissedFeedback: 0, privacyAuthorized: true, createdAt: addDays(today, -160) },
  { id: 'p-09', name: '吴秀珍', age: 73, gender: '女', phone: '13800001009', chronicDisease: '冠心病', riskLevel: 'critical', status: 'active', groupId: 'grp-4', consecutiveMissedFeedback: 1, privacyAuthorized: true, createdAt: addDays(today, -300) },
]

export const followupPlans: FollowupPlan[] = [
  { id: 'fp-01', patientId: 'p-01', groupId: 'grp-3', cycleDays: 14, nextFollowupDate: addDays(today, -4), prescriptionExpiryDate: addDays(today, -5), status: 'active', lastFeedbackDate: addDays(today, -17), createdAt: addDays(today, -150), updatedAt: addDays(today, -5) },
  { id: 'fp-02', patientId: 'p-02', groupId: 'grp-2', cycleDays: 7, nextFollowupDate: addDays(today, -13), prescriptionExpiryDate: addDays(today, 31), status: 'active', createdAt: addDays(today, -210), updatedAt: addDays(today, -5) },
  { id: 'fp-03', patientId: 'p-03', groupId: 'grp-5', cycleDays: 14, nextFollowupDate: addDays(today, -51), prescriptionExpiryDate: addDays(today, -90), status: 'suspended', lastFeedbackDate: addDays(today, -85), createdAt: addDays(today, -280), updatedAt: addDays(today, -65) },
  { id: 'fp-04', patientId: 'p-04', groupId: 'grp-4', cycleDays: 14, nextFollowupDate: addDays(today, 8), prescriptionExpiryDate: addDays(today, 48), status: 'active', lastFeedbackDate: addDays(today, -6), createdAt: addDays(today, -190), updatedAt: addDays(today, -6) },
  { id: 'fp-05', patientId: 'p-05', groupId: 'grp-5', cycleDays: 14, nextFollowupDate: addDays(today, 6), prescriptionExpiryDate: addDays(today, 26), status: 'active', createdAt: addDays(today, -85), updatedAt: addDays(today, -8) },
  { id: 'fp-06', patientId: 'p-06', groupId: 'grp-2', cycleDays: 7, nextFollowupDate: addDays(today, -8), prescriptionExpiryDate: addDays(today, 36), status: 'active', lastFeedbackDate: addDays(today, -20), createdAt: addDays(today, -250), updatedAt: addDays(today, -8) },
  { id: 'fp-07', patientId: 'p-07', groupId: 'grp-3', cycleDays: 14, nextFollowupDate: addDays(today, 11), prescriptionExpiryDate: addDays(today, 57), status: 'active', lastFeedbackDate: addDays(today, -3), createdAt: addDays(today, -105), updatedAt: addDays(today, -3) },
  { id: 'fp-08', patientId: 'p-08', groupId: 'grp-2', cycleDays: 7, nextFollowupDate: addDays(today, 4), prescriptionExpiryDate: addDays(today, 3), status: 'active', lastFeedbackDate: addDays(today, -3), createdAt: addDays(today, -160), updatedAt: addDays(today, -3) },
  { id: 'fp-09', patientId: 'p-09', groupId: 'grp-4', cycleDays: 7, nextFollowupDate: addDays(today, -4), prescriptionExpiryDate: addDays(today, 21), status: 'active', lastFeedbackDate: addDays(today, -11), createdAt: addDays(today, -300), updatedAt: addDays(today, -5) },
]

export const prescriptions: Prescription[] = [
  { id: 'rx-01', patientId: 'p-01', drugName: '缬皇地平缓释片', dosage: '5mg', frequency: '每日一次', prescribedDate: addDays(today, -185), expiryDate: addDays(today, -5), status: 'expired' },
  { id: 'rx-02', patientId: 'p-02', drugName: '二甲双胍', dosage: '500mg', frequency: '每日两次', prescribedDate: addDays(today, -150), expiryDate: addDays(today, 31), status: 'valid' },
  { id: 'rx-03', patientId: 'p-03', drugName: '沙美特罗', dosage: '50/500μg', frequency: '每日一次', prescribedDate: addDays(today, -270), expiryDate: addDays(today, -90), status: 'expired' },
  { id: 'rx-04', patientId: 'p-04', drugName: '氯吡格雷', dosage: '75mg', frequency: '每日一次', prescribedDate: addDays(today, -130), expiryDate: addDays(today, 48), status: 'valid' },
  { id: 'rx-05', patientId: 'p-05', drugName: '布地奈德', dosage: '200/6μg', frequency: '每日两次', prescribedDate: addDays(today, -85), expiryDate: addDays(today, 26), status: 'valid' },
  { id: 'rx-06', patientId: 'p-06', drugName: '格列美胍', dosage: '2mg', frequency: '每日一次', prescribedDate: addDays(today, -145), expiryDate: addDays(today, 36), status: 'valid' },
  { id: 'rx-07', patientId: 'p-07', drugName: '缬皇地平缓释片', dosage: '2.5mg', frequency: '每日一次', prescribedDate: addDays(today, -120), expiryDate: addDays(today, 57), status: 'valid' },
  { id: 'rx-08', patientId: 'p-08', drugName: '阿卡波糖', dosage: '50mg', frequency: '每日三次', prescribedDate: addDays(today, -180), expiryDate: addDays(today, 3), status: 'valid' },
  { id: 'rx-09', patientId: 'p-09', drugName: '阿托伐他汀', dosage: '20mg', frequency: '每日一次', prescribedDate: addDays(today, -160), expiryDate: addDays(today, 21), status: 'valid' },
]

export const allergies: AllergyRecord[] = [
  { id: 'al-01', patientId: 'p-04', drugName: '阿司匹林', severity: 'severe', note: '服用后出现严重荨麻疹和呼吸困难，禁用所有含阿司匹林药物' },
  { id: 'al-02', patientId: 'p-09', drugName: '青霉素', severity: 'moderate', note: '皮疹反应，避免使用青霉素类药物' },
  { id: 'al-03', patientId: 'p-06', drugName: '磺胺类药物', severity: 'mild', note: '轻微胃肠不适，注意观察' },
]

export const feedbacks: Feedback[] = [
  { id: 'fb-01', patientId: 'p-07', planId: 'fp-07', efficacyRating: 4, adverseReaction: '无', compliance: 'good', submittedBy: 'patient', note: '血压控制稳定，无不适', submittedAt: addDaysWithTime(today, -3, 9, 30) },
  { id: 'fb-02', patientId: 'p-04', planId: 'fp-04', efficacyRating: 3, adverseReaction: '轻微胃胀', compliance: 'moderate', submittedBy: 'pharmacist', note: '患者反映服药后胃部不适，建议饭后服用', submittedAt: addDaysWithTime(today, -6, 14, 20) },
  { id: 'fb-03', patientId: 'p-01', planId: 'fp-01', efficacyRating: 3, adverseReaction: '无', compliance: 'moderate', submittedBy: 'patient', note: '偶尔忘记服药', submittedAt: addDaysWithTime(today, -17, 10, 0) },
  { id: 'fb-04', patientId: 'p-09', planId: 'fp-09', efficacyRating: 2, adverseReaction: '头晕', compliance: 'poor', submittedBy: 'pharmacist', note: '患者多次未按时服药，身体不适明显', submittedAt: addDaysWithTime(today, -11, 16, 45) },
  { id: 'fb-05', patientId: 'p-06', planId: 'fp-06', efficacyRating: 3, adverseReaction: '轻微胃肠不适', compliance: 'moderate', submittedBy: 'patient', note: '血糖控制一般，需加强饮食管理', submittedAt: addDaysWithTime(today, -20, 8, 15) },
  { id: 'fb-06', patientId: 'p-08', planId: 'fp-08', efficacyRating: 4, adverseReaction: '无', compliance: 'good', submittedBy: 'patient', note: '血糖控制良好', submittedAt: addDaysWithTime(today, -3, 11, 0) },
]

export const overdueRecords: OverdueRecord[] = [
  { id: 'od-01', patientId: 'p-06', planId: 'fp-06', overdueDays: 8, supervisionStatus: 'pending' },
  { id: 'od-02', patientId: 'p-02', planId: 'fp-02', overdueDays: 13, supervisionStatus: 'escalated', supervisor: '赵药师', supervisedAt: addDaysWithTime(today, -6, 10, 0) },
  { id: 'od-03', patientId: 'p-09', planId: 'fp-09', overdueDays: 4, supervisionStatus: 'contacted', supervisor: '刘药师', supervisedAt: addDaysWithTime(today, -2, 9, 30) },
]

export const businessTrails: BusinessTrail[] = [
  { id: 'bt-01', patientId: 'p-01', patientName: '张建国', type: 'prescription_expired', description: '缬皇地平缓释片处方已过期5天，需尽快复诊续方', operator: '系统', operatorRole: 'manager', timestamp: addDaysWithTime(today, 0, 8, 0) },
  { id: 'bt-02', patientId: 'p-02', patientName: '李秀英', type: 'overdue_escalated', description: '连续2次未反馈，自动升级为重点关注患者', operator: '系统', operatorRole: 'manager', timestamp: addDaysWithTime(today, -5, 0, 0) },
  { id: 'bt-03', patientId: 'p-03', patientName: '王德明', type: 'medication_stopped', description: '患者停药，随访计划已暂停', operator: '赵药师', operatorRole: 'pharmacist', timestamp: addDaysWithTime(today, -65, 10, 30) },
  { id: 'bt-04', patientId: 'p-04', patientName: '陈美华', type: 'allergy_added', description: '新增阿司匹林严重过敏记录，已禁用含阿司匹林药物', operator: '刘药师', operatorRole: 'pharmacist', timestamp: addDaysWithTime(today, -190, 15, 0) },
  { id: 'bt-05', patientId: 'p-05', patientName: '赵志强', type: 'privacy_changed', description: '患者未授权隐私协议，无法发送随访提醒', operator: '赵志强', operatorRole: 'patient', timestamp: addDaysWithTime(today, -85, 9, 0) },
  { id: 'bt-06', patientId: 'p-06', patientName: '刘桂兰', type: 'overdue_escalated', description: '随访过期8天，已转单督导', operator: '系统', operatorRole: 'manager', timestamp: addDaysWithTime(today, 0, 8, 0) },
  { id: 'bt-07', patientId: 'p-07', patientName: '孙丽萍', type: 'feedback_changed', description: '患者提交随访反馈，血压控制稳定', operator: '孙丽萍', operatorRole: 'patient', timestamp: addDaysWithTime(today, -3, 9, 30) },
  { id: 'bt-08', patientId: 'p-08', patientName: '周伟', type: 'prescription_expired', description: '阿卡波糖处方将于3天后到期，需提前安排复诊', operator: '系统', operatorRole: 'manager', timestamp: addDaysWithTime(today, 0, 8, 0) },
  { id: 'bt-09', patientId: 'p-02', patientName: '李秀英', type: 'batch_reminder', description: '批量发送随访提醒，覆盖糖尿病重点组全体患者', operator: '系统', operatorRole: 'manager', timestamp: addDaysWithTime(today, -13, 8, 0) },
  { id: 'bt-10', patientId: 'p-09', patientName: '吴秀珍', type: 'revisit_suggested', description: '用药依从性差，建议尽快复诊调整用药方案', operator: '赵药师', operatorRole: 'pharmacist', timestamp: addDaysWithTime(today, -5, 11, 0) },
  { id: 'bt-11', patientId: 'p-01', patientName: '张建国', type: 'revisit_suggested', description: '处方过期，建议尽快复诊续方', operator: '系统', operatorRole: 'manager', timestamp: addDaysWithTime(today, 0, 8, 0) },
  { id: 'bt-12', patientId: 'p-08', patientName: '周伟', type: 'plan_created', description: '创建糖尿病随访计划，周期7天', operator: '赵药师', operatorRole: 'pharmacist', timestamp: addDaysWithTime(today, -160, 14, 0) },
]

export const restockAlerts: RestockAlert[] = [
  { id: 'ra-01', drugName: '缬皇地平缓释片', currentStock: 15, threshold: 50, patientCount: 12, status: 'pending' },
  { id: 'ra-02', drugName: '二甲双胍', currentStock: 8, threshold: 30, patientCount: 18, status: 'ordered' },
  { id: 'ra-03', drugName: '阿托伐他汀', currentStock: 5, threshold: 20, patientCount: 9, status: 'pending' },
]

export const revisitSuggestions: RevisitSuggestion[] = [
  { id: 'rs-01', patientId: 'p-01', prescriptionId: 'rx-01', reason: '处方已过期5天，患者需尽快复诊续方', suggestion: '建议安排心内科复诊，评估血压控制方案并续方', status: 'pending', createdAt: addDaysWithTime(today, 0, 8, 0) },
  { id: 'rs-02', patientId: 'p-09', prescriptionId: 'rx-09', reason: '用药依从性差，身体不适明显，需调整用药方案', suggestion: '建议心内科复诊，评估是否调整氯吡格雷剂量或更换药物', status: 'sent', createdAt: addDaysWithTime(today, -5, 11, 0) },
]
