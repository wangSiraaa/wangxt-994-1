export type UserRole = 'pharmacist' | 'patient' | 'manager'
export type ChronicDisease = '糖尿病' | '高血压' | '冠心病' | '慢阻肺' | '哮喘'
export type RiskLevel = 'normal' | 'attention' | 'critical'
export type PatientStatus = 'active' | 'paused' | 'stopped' | 'archived'
export type PlanStatus = 'active' | 'completed' | 'expired' | 'suspended'
export type Compliance = 'good' | 'moderate' | 'poor'
export type PrescriptionStatus = 'valid' | 'expired' | 'renewed'
export type SupervisionStatus = 'pending' | 'contacted' | 'appointing' | 'escalated'
export type TrailType = 'plan_created' | 'feedback_changed' | 'overdue_escalated' | 'prescription_expired' | 'medication_stopped' | 'batch_reminder' | 'privacy_changed' | 'allergy_added' | 'restock_alert' | 'revisit_suggested'

export interface Patient {
  id: string; name: string; age: number; gender: '男' | '女'; phone: string
  chronicDisease: ChronicDisease; riskLevel: RiskLevel; status: PatientStatus
  groupId: string; consecutiveMissedFeedback: number; privacyAuthorized: boolean
  stoppedAt?: string; archivedAt?: string; createdAt: string
}
export interface FollowupPlan {
  id: string; patientId: string; groupId: string; cycleDays: number
  nextFollowupDate: string; prescriptionExpiryDate: string; status: PlanStatus
  lastFeedbackDate?: string; createdAt: string; updatedAt: string
}
export interface Feedback {
  id: string; patientId: string; planId: string; efficacyRating: number
  adverseReaction: string; compliance: Compliance; submittedBy: UserRole
  note: string; submittedAt: string
}
export interface AllergyRecord { id: string; patientId: string; drugName: string; severity: 'mild' | 'moderate' | 'severe'; note: string }
export interface Prescription { id: string; patientId: string; drugName: string; dosage: string; frequency: string; prescribedDate: string; expiryDate: string; status: PrescriptionStatus }
export interface PlanGroup { id: string; name: string; diseaseType: ChronicDisease; riskLevel: RiskLevel }
export interface BusinessTrail { id: string; patientId: string; patientName: string; type: TrailType; description: string; operator: string; operatorRole: UserRole; timestamp: string }
export interface OverdueRecord { id: string; patientId: string; planId: string; overdueDays: number; supervisionStatus: SupervisionStatus; supervisor?: string; supervisedAt?: string }
export interface RestockAlert { id: string; drugName: string; currentStock: number; threshold: number; patientCount: number; status: 'pending' | 'ordered' | 'resolved' }
export interface RevisitSuggestion { id: string; patientId: string; prescriptionId: string; reason: string; suggestion: string; status: 'pending' | 'sent' | 'confirmed'; createdAt: string }