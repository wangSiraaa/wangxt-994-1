import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import Badge from '@/components/shared/Badge';
import Modal from '@/components/shared/Modal';
import {
  Users, AlertTriangle, Clock, Pill, TrendingUp, CheckCircle, XCircle, Eye,
  Phone, Calendar, ArrowRight, ShieldAlert, Stethoscope, FileCheck, UserCheck,
  HeartPulse, RefreshCw, ShieldCheck, ChevronDown, ChevronUp, HandHeart, Send
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Patient, StopConfirmStatus } from '@/types';

const riskColors = {
  normal: 'bg-green-100 text-green-700 border-green-200',
  attention: 'bg-amber-100 text-amber-700 border-amber-200',
  critical: 'bg-red-100 text-red-700 border-red-200',
};

const riskLabels = {
  normal: '普通',
  attention: '关注',
  critical: '重点',
};

const statusColors = {
  active: 'bg-green-100 text-green-700',
  stopped: 'bg-slate-100 text-slate-600',
  paused: 'bg-amber-100 text-amber-700',
  archived: 'bg-slate-200 text-slate-600',
};

const statusLabels = {
  active: '活跃',
  stopped: '停药',
  paused: '暂停',
  archived: '归档',
};

const supervisionStatusLabels: Record<string, string> = {
  pending: '待处理',
  contacted: '已联系',
  appointing: '已预约',
  escalated: '已升级',
};

const supervisionStatusColors: Record<string, string> = {
  pending: 'bg-red-100 text-red-700',
  contacted: 'bg-amber-100 text-amber-700',
  appointing: 'bg-blue-100 text-blue-700',
  escalated: 'bg-purple-100 text-purple-700',
};

const stopConfirmStatusLabels: Record<StopConfirmStatus, string> = {
  pending: '待店长确认',
  approved: '已批准停药',
  rejected: '已驳回',
  cancelled: '已撤销',
};

const stopConfirmStatusColors: Record<StopConfirmStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  approved: 'bg-slate-100 text-slate-600 border-slate-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  cancelled: 'bg-slate-50 text-slate-500 border-slate-100',
};

type CategoryKey = 'highRisk' | 'revisit' | 'stopConfirm' | 'normal';

interface CategoryConfig {
  key: CategoryKey;
  label: string;
  icon: any;
  gradient: string;
  badgeColor: string;
  description: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    key: 'highRisk',
    label: '高风险未反馈',
    icon: ShieldAlert,
    gradient: 'from-rose-500 to-red-600',
    badgeColor: 'bg-red-100 text-red-700',
    description: '风险预警/重点关注层级，且逾期未反馈需紧急跟进',
  },
  {
    key: 'revisit',
    label: '待复诊',
    icon: Stethoscope,
    gradient: 'from-amber-500 to-orange-500',
    badgeColor: 'bg-amber-100 text-amber-700',
    description: '有未确认复诊建议，需要督促患者尽快预约复诊续方',
  },
  {
    key: 'stopConfirm',
    label: '待停药确认',
    icon: FileCheck,
    gradient: 'from-violet-500 to-purple-600',
    badgeColor: 'bg-violet-100 text-violet-700',
    description: '药师提交停药申请，待店长审批确认，期间自动豁免催办',
  },
  {
    key: 'normal',
    label: '普通跟进',
    icon: UserCheck,
    gradient: 'from-emerald-500 to-teal-600',
    badgeColor: 'bg-green-100 text-green-700',
    description: '普通层级活跃患者，按常规周期随访即可',
  },
];

export default function ManagerDashboard() {
  const {
    patients, plans, overdueRecords, prescriptions, trails, restockAlerts,
    revisitSuggestions, checkPrescriptionExpiry, stopMedicationConfirms, triageReasons,
    approveStopConfirm, rejectStopConfirm, isPatientExempted,
  } = useStore();

  const [activeCategory, setActiveCategory] = useState<CategoryKey>('highRisk');
  const [expandedPatients, setExpandedPatients] = useState<Record<string, boolean>>({});
  const [showApproveModal, setShowApproveModal] = useState<string | null>(null);
  const [approveForm, setApproveForm] = useState({ note: '', action: 'approve' as 'approve' | 'reject' });

  const today = new Date().toISOString().slice(0, 10);

  const activePatients = patients.filter((p) => p.status === 'active');
  const expiringPrescriptions = prescriptions.filter(
    (p) => p.status === 'valid' && new Date(p.expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const expiredPrescriptions = prescriptions.filter((p) => p.status === 'expired');
  const pendingRestock = restockAlerts.filter((r) => r.status === 'pending');
  const pendingRevisit = revisitSuggestions.filter((s) => s.status !== 'confirmed');
  const pendingStops = stopMedicationConfirms.filter((s) => s.status === 'pending');

  const highRiskPatientIds = new Set<string>();
  for (const p of patients) {
    if (p.status !== 'active') continue;
    if ((p.riskLevel === 'critical' || p.riskLevel === 'attention') &&
        (p.consecutiveMissedFeedback >= 2 || overdueRecords.some((o) => o.patientId === p.id))) {
      highRiskPatientIds.add(p.id);
    }
  }

  const revisitPatientIds = new Set<string>();
  for (const rs of pendingRevisit) {
    const patient = patients.find((p) => p.id === rs.patientId);
    if (patient && patient.status === 'active' && !highRiskPatientIds.has(patient.id)) {
      revisitPatientIds.add(rs.patientId);
    }
  }

  const stopConfirmPatientIds = new Set<string>();
  for (const sc of pendingStops) {
    if (!highRiskPatientIds.has(sc.patientId) && !revisitPatientIds.has(sc.patientId)) {
      stopConfirmPatientIds.add(sc.patientId);
    }
  }

  const normalPatientIds = new Set<string>();
  for (const p of activePatients) {
    if (!highRiskPatientIds.has(p.id) && !revisitPatientIds.has(p.id) && !stopConfirmPatientIds.has(p.id)) {
      normalPatientIds.add(p.id);
    }
  }

  const categoryPatientMap: Record<CategoryKey, Patient[]> = {
    highRisk: patients.filter((p) => highRiskPatientIds.has(p.id)),
    revisit: patients.filter((p) => revisitPatientIds.has(p.id)),
    stopConfirm: patients.filter((p) => stopConfirmPatientIds.has(p.id)),
    normal: patients.filter((p) => normalPatientIds.has(p.id)),
  };

  const unresolvedTriageByPatient: Record<string, any[]> = {};
  for (const t of triageReasons.filter((t) => !t.resolved)) {
    if (!unresolvedTriageByPatient[t.patientId]) unresolvedTriageByPatient[t.patientId] = [];
    unresolvedTriageByPatient[t.patientId].push(t);
  }

  const recentTrails = [...trails]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  const getOverdueForPatient = (patientId: string) =>
    overdueRecords.filter((r) => r.patientId === patientId);

  const getRevisitForPatient = (patientId: string) =>
    pendingRevisit.find((r) => r.patientId === patientId);

  const getStopConfirmForPatient = (patientId: string) =>
    pendingStops.find((s) => s.patientId === patientId);

  const togglePatientExpand = (pid: string) => {
    setExpandedPatients((prev) => ({ ...prev, [pid]: !prev[pid] }));
  };

  const handleStopConfirmAction = (stopId: string) => {
    if (!approveForm.note.trim()) {
      alert('请填写审批意见');
      return;
    }
    if (approveForm.action === 'approve') {
      approveStopConfirm(stopId, '店长', approveForm.note.trim());
    } else {
      rejectStopConfirm(stopId, '店长', approveForm.note.trim());
    }
    setShowApproveModal(null);
    setApproveForm({ note: '', action: 'approve' });
  };

  const currentCategory = CATEGORIES.find((c) => c.key === activeCategory)!;
  const currentPatients = categoryPatientMap[activeCategory];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">店长督办工作台</h2>
          <p className="text-slate-500 mt-1">四类人群分类管理 · 重点事项优先督办 · 停药审批</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={checkPrescriptionExpiry}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            扫描处方过期
          </button>
          <Link
            to="/manager/overdue"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
          >
            <Eye className="w-4 h-4" />
            督办中心
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {CATEGORIES.map((cat) => {
          const list = categoryPatientMap[cat.key];
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`relative overflow-hidden rounded-xl p-5 text-left transition-all ${
                isActive
                  ? `bg-gradient-to-br ${cat.gradient} text-white shadow-lg scale-[1.02]`
                  : 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-sm font-medium ${isActive ? 'text-white/85' : 'text-slate-500'}`}>
                    {cat.label}
                  </p>
                  <p className={`text-3xl font-bold mt-2 ${isActive ? 'text-white' : 'text-slate-800'}`}>
                    {list.length}
                  </p>
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  isActive ? 'bg-white/20' : `bg-gradient-to-br ${cat.gradient} bg-opacity-10`
                }`}>
                  <cat.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white'}`} />
                </div>
              </div>
              <p className={`text-xs mt-3 line-clamp-1 ${isActive ? 'text-white/75' : 'text-slate-400'}`}>
                {cat.description}
              </p>
              {isActive && (
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
              )}
            </button>
          );
        })}
      </div>

      {(pendingRestock.length > 0 || pendingStops.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {pendingRestock.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-800">药品补货提醒</h3>
                  <p className="text-sm text-orange-700 mt-1">
                    有 {pendingRestock.length} 种药品库存不足，请及时补货
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {pendingRestock.slice(0, 3).map((alert) => (
                      <Badge key={alert.id} className="bg-white text-orange-700 border border-orange-200">
                        {alert.drugName}（剩{alert.currentStock}盒）
                      </Badge>
                    ))}
                    {pendingRestock.length > 3 && (
                      <span className="text-xs text-orange-600 py-1">等{pendingRestock.length}种</span>
                    )}
                  </div>
                  <Link to="/pharmacist/restock" className="text-sm text-orange-600 hover:text-orange-700 mt-2 inline-flex items-center gap-1">
                    查看详情 <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {pendingStops.length > 0 && (
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <FileCheck className="w-5 h-5 text-violet-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-violet-800">停药申请待审批</h3>
                  <p className="text-sm text-violet-700 mt-1">
                    有 {pendingStops.length} 位患者停药申请待您确认，期间已自动豁免催办
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {pendingStops.map((sc) => {
                      const patient = patients.find((p) => p.id === sc.patientId);
                      return (
                        <button
                          key={sc.id}
                          onClick={() => { setShowApproveModal(sc.id); setActiveCategory('stopConfirm'); }}
                          className="bg-white border border-violet-200 rounded-lg px-3 py-1.5 text-xs hover:bg-violet-50 transition-colors"
                        >
                          <span className="font-medium text-violet-800">{patient?.name}</span>
                          <span className="text-violet-600 ml-1">· {sc.requestedBy}</span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setActiveCategory('stopConfirm')}
                    className="text-sm text-violet-600 hover:text-violet-700 mt-2 inline-flex items-center gap-1"
                  >
                    立即处理 <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className={`px-5 py-4 bg-gradient-to-r ${currentCategory.gradient} text-white flex flex-wrap items-center justify-between gap-4`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <currentCategory.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {currentCategory.label}名单
                <span className="ml-2 text-sm font-normal text-white/85">（共 {currentPatients.length} 人）</span>
              </h3>
              <p className="text-sm text-white/80 mt-0.5">{currentCategory.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentCategory.key === 'highRisk' && (
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors">
                <Send className="w-3.5 h-3.5" />
                一键全部催办
              </button>
            )}
            <Link
              to={
                currentCategory.key === 'stopConfirm' ? '/manager/overdue' :
                currentCategory.key === 'revisit' ? '/pharmacist/revisit' : '/pharmacist/patients'
              }
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/15 hover:bg-white/25 text-white rounded-lg transition-colors border border-white/30"
            >
              进入详情 <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {currentPatients.length === 0 ? (
            <div className="py-16 text-center">
              <CheckCircle className="w-14 h-14 mx-auto text-green-400 mb-3" />
              <p className="text-lg font-medium text-slate-700">当前分类暂无患者</p>
              <p className="text-sm text-slate-500 mt-1">{currentCategory.description}</p>
            </div>
          ) : (
            currentPatients.slice(0, 8).map((patient) => {
              const patientOverdue = getOverdueForPatient(patient.id);
              const patientPlan = plans.find((p) => p.patientId === patient.id && p.status === 'active');
              const patientRx = prescriptions.find((r) => r.patientId === patient.id && r.status === 'valid');
              const revisit = getRevisitForPatient(patient.id);
              const stopConfirm = getStopConfirmForPatient(patient.id);
              const triages = unresolvedTriageByPatient[patient.id] || [];
              const isExpanded = expandedPatients[patient.id];
              const exemptInfo = isPatientExempted(patient.id);
              const daysLeft = patientRx ? Math.ceil((new Date(patientRx.expiryDate).getTime() - Date.now()) / 86400000) : 0;

              return (
                <div key={patient.id} className="hover:bg-slate-50/60 transition-colors">
                  <div className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-medium shadow-sm shrink-0 ${
                          patient.riskLevel === 'critical'
                            ? 'bg-gradient-to-br from-rose-500 to-red-600'
                            : patient.riskLevel === 'attention'
                            ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                            : 'bg-gradient-to-br from-emerald-400 to-teal-500'
                        }`}>
                          {patient.name.slice(0, 1)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-slate-800 text-base">{patient.name}</span>
                            <Badge className={riskColors[patient.riskLevel]}>
                              {riskLabels[patient.riskLevel]}
                            </Badge>
                            <Badge className={statusColors[patient.status]}>
                              {statusLabels[patient.status]}
                            </Badge>
                            {currentCategory.key === 'highRisk' && patientOverdue.length > 0 && (
                              <Badge className="bg-red-100 text-red-700 border-red-200">
                                <Clock className="w-3 h-3 inline mr-1" />
                                逾期{Math.max(...patientOverdue.map((o) => o.overdueDays))}天
                              </Badge>
                            )}
                            {currentCategory.key === 'revisit' && revisit?.revisitAppointedAt && (
                              <Badge className="bg-green-100 text-green-700 border-green-200">
                                <Calendar className="w-3 h-3 inline mr-1" />
                                已预约 {revisit.revisitAppointedAt}
                              </Badge>
                            )}
                            {currentCategory.key === 'stopConfirm' && stopConfirm && (
                              <Badge className={stopConfirmStatusColors[stopConfirm.status]}>
                                <FileCheck className="w-3 h-3 inline mr-1" />
                                {stopConfirmStatusLabels[stopConfirm.status]}
                              </Badge>
                            )}
                            {exemptInfo.exempted && (
                              <Badge className="bg-sky-100 text-sky-700 border-sky-200">
                                <ShieldCheck className="w-3 h-3 inline mr-1" />
                                催办豁免
                              </Badge>
                            )}
                            {triages.length > 0 && (
                              <Badge className="bg-violet-100 text-violet-700 border-violet-200">
                                <RefreshCw className="w-3 h-3 inline mr-1" />
                                分层原因{triages.length}条
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <HeartPulse className="w-3.5 h-3.5" />
                              {patient.chronicDisease} · {patient.age}岁
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" />
                              {patient.phone}
                            </span>
                            {patient.consecutiveMissedFeedback > 0 && (
                              <span className="flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" />
                                连续{patient.consecutiveMissedFeedback}次未反馈
                              </span>
                            )}
                            {patientPlan && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                下次随访 {patientPlan.nextFollowupDate}
                              </span>
                            )}
                          </div>

                          {currentCategory.key === 'highRisk' && patientOverdue.length > 0 && (
                            <div className="mt-2 p-2.5 bg-red-50 border border-red-100 rounded-lg">
                              {patientOverdue.map((o) => (
                                <div key={o.id} className="flex items-center justify-between text-xs">
                                  <span className="text-red-700">
                                    {o.planName}：逾期 {o.overdueDays} 天
                                  </span>
                                  <Badge className={supervisionStatusColors[o.supervisionStatus]}>
                                    {supervisionStatusLabels[o.supervisionStatus]}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          )}

                          {currentCategory.key === 'revisit' && revisit && (
                            <div className="mt-2 p-2.5 bg-amber-50 border border-amber-100 rounded-lg">
                              <p className="text-xs text-amber-800">
                                <span className="font-medium">原因：</span>{revisit.reason}
                              </p>
                              <p className="text-xs text-amber-700 mt-0.5">
                                <span className="font-medium">建议：</span>{revisit.suggestion}
                              </p>
                            </div>
                          )}

                          {currentCategory.key === 'stopConfirm' && stopConfirm && (
                            <div className="mt-2 p-2.5 bg-violet-50 border border-violet-100 rounded-lg">
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-violet-800">
                                  <span className="font-medium">申请人：</span>{stopConfirm.requestedBy}
                                  <span className="mx-2">·</span>
                                  <span className="font-medium">原因：</span>{stopConfirm.requestReason}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <button
                          onClick={() => togglePatientExpand(patient.id)}
                          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          <span className="text-xs">详情</span>
                        </button>
                        <div className="flex flex-wrap justify-end gap-2">
                          {currentCategory.key === 'stopConfirm' && stopConfirm && (
                            <>
                              <button
                                onClick={() => { setShowApproveModal(stopConfirm.id); setApproveForm({ ...approveForm, action: 'approve' }); }}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700"
                              >
                                <CheckCircle className="w-3 h-3" />
                                批准停药
                              </button>
                              <button
                                onClick={() => { setShowApproveModal(stopConfirm.id); setApproveForm({ ...approveForm, action: 'reject' }); }}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600"
                              >
                                <XCircle className="w-3 h-3" />
                                驳回申请
                              </button>
                            </>
                          )}
                          <Link
                            to="/manager/overdue"
                            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                          >
                            <Eye className="w-3 h-3" />
                            查看
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-4">
                      <div className="ml-14 p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                        {patientRx && (
                          <div className="flex items-center gap-4 flex-wrap text-sm">
                            <span className="text-slate-500 flex items-center gap-1.5">
                              <Pill className="w-4 h-4 text-orange-500" />
                              处方：{patientRx.drugName} · {patientRx.dosage} {patientRx.frequency}
                            </span>
                            <span className={daysLeft <= 0 ? 'text-red-600 font-medium' : 'text-amber-600'}>
                              {daysLeft <= 0 ? `已过期${Math.abs(daysLeft)}天` : `剩${daysLeft}天到期`}
                              <span className="text-slate-400 ml-1">（{patientRx.expiryDate}）</span>
                            </span>
                          </div>
                        )}
                        {triages.length > 0 && (
                          <div>
                            <h5 className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                              <HandHeart className="w-3.5 h-3.5 text-rose-500" />
                              分层触发原因（{triages.length}条）
                            </h5>
                            <div className="space-y-1.5">
                              {triages.map((t) => (
                                <div key={t.id} className={`p-2.5 rounded-lg text-xs ${
                                  t.severity === 'high' ? 'bg-red-50 border-l-4 border-l-red-400' :
                                  t.severity === 'medium' ? 'bg-amber-50 border-l-4 border-l-amber-400' :
                                  'bg-sky-50 border-l-4 border-l-sky-400'
                                }`}>
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-slate-800">{t.title}</span>
                                    <span className="text-slate-500">
                                      {new Date(t.triggeredAt).toLocaleDateString('zh-CN')}
                                    </span>
                                  </div>
                                  <p className="text-slate-600 mt-0.5">{t.detail}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {exemptInfo.exempted && exemptInfo.exemption && (
                          <div className="p-2.5 bg-sky-50 rounded-lg text-xs border border-sky-100">
                            <div className="flex items-center gap-2 text-sky-800">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span className="font-medium">催办豁免生效中</span>
                              <span className="text-sky-600">至 {exemptInfo.exemption.exemptedUntil}</span>
                            </div>
                            <p className="text-sky-700 mt-0.5">原因：{exemptInfo.exemption.reason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Pill className="w-4 h-4 text-orange-500" />
              7天内到期处方
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">患者</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">药品</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">到期日期</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">剩余天数</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">分类</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...expiringPrescriptions, ...expiredPrescriptions].slice(0, 6).map((rx) => {
                  const patient = patients.find((p) => p.id === rx.patientId);
                  const daysLeft = Math.ceil((new Date(rx.expiryDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
                  const catKey: CategoryKey = highRiskPatientIds.has(rx.patientId) ? 'highRisk' :
                    revisitPatientIds.has(rx.patientId) ? 'revisit' :
                    stopConfirmPatientIds.has(rx.patientId) ? 'stopConfirm' : 'normal';
                  const cat = CATEGORIES.find((c) => c.key === catKey)!;
                  return (
                    <tr key={rx.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800">{patient?.name}</span>
                          {patient && (
                            <Badge className={`text-xs ${riskColors[patient.riskLevel]}`}>
                              {riskLabels[patient.riskLevel]}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-sm">{rx.drugName}</td>
                      <td className="px-4 py-3 text-slate-600 text-sm">{rx.expiryDate}</td>
                      <td className="px-4 py-3">
                        <span className={`font-medium text-sm ${
                          daysLeft < 0 ? 'text-red-600' : daysLeft <= 3 ? 'text-amber-600' : 'text-green-600'
                        }`}>
                          {daysLeft < 0 ? `已过期${Math.abs(daysLeft)}天` : `剩${daysLeft}天`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs ${cat.badgeColor}`}>{cat.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={rx.status === 'valid' ? 'success' : 'danger'}>
                          {rx.status === 'valid' ? '有效' : '已过期'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              分类统计概览
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {CATEGORIES.map((cat) => {
              const count = categoryPatientMap[cat.key].length;
              const total = Object.values(categoryPatientMap).flat().length || 1;
              const percent = Math.round((count / total) * 100);
              return (
                <div
                  key={cat.key}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    activeCategory === cat.key ? 'bg-slate-100' : 'hover:bg-slate-50'
                  }`}
                  onClick={() => setActiveCategory(cat.key)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cat.gradient} flex items-center justify-center`}>
                        <cat.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-slate-800 text-sm">{cat.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-slate-800">{count}</span>
                      <span className="text-xs text-slate-500">{percent}%</span>
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${cat.gradient} transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="pt-3 mt-3 border-t border-slate-100 text-xs text-slate-500 text-center">
              统计样本共 <span className="font-medium text-slate-700">{Object.values(categoryPatientMap).flat().length}</span> 位活跃患者
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            最近业务轨迹
          </h3>
        </div>
        <div className="p-6">
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
            <div className="space-y-4">
              {recentTrails.slice(0, 5).map((trail) => (
                <div key={trail.id} className="relative pl-10">
                  <div className={`absolute left-2 w-5 h-5 rounded-full border-2 border-white ${
                    trail.type === 'prescription_expired' ? 'bg-red-500' :
                    trail.type === 'overdue_escalated' ? 'bg-amber-500' :
                    trail.type === 'medication_stopped' ? 'bg-slate-500' :
                    trail.type === 'revisit_suggested' ? 'bg-orange-500' :
                    trail.type === 'stop_confirmed' ? 'bg-violet-500' :
                    trail.type === 'triage_changed' ? 'bg-rose-500' :
                    'bg-indigo-500'
                  }`}></div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-800">
                        {trail.patientName}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(trail.timestamp).toLocaleString('zh-CN')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{trail.description}</p>
                    <p className="text-xs text-slate-500 mt-1">操作人：{trail.operator}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={showApproveModal !== null}
        onClose={() => { setShowApproveModal(null); setApproveForm({ note: '', action: 'approve' }); }}
        title={approveForm.action === 'approve' ? '批准停药申请' : '驳回停药申请'}
        description="请填写审批意见，批准后将自动执行停药并归档保护"
      >
        {showApproveModal && (() => {
          const sc = stopMedicationConfirms.find((s) => s.id === showApproveModal);
          const patient = patients.find((p) => p.id === sc?.patientId);
          return (
            <div className="space-y-4">
              <div className={`p-3 rounded-lg border ${
                approveForm.action === 'approve'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center gap-2">
                  {approveForm.action === 'approve' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  <span className="font-medium">
                    {approveForm.action === 'approve' ? '即将批准停药' : '即将驳回申请'}
                  </span>
                </div>
                <p className="text-sm mt-1 opacity-90">
                  患者：{patient?.name} · 申请人：{sc?.requestedBy}
                </p>
                <p className="text-sm mt-0.5 opacity-90">申请原因：{sc?.requestReason}</p>
                {approveForm.action === 'approve' && (
                  <p className="text-xs mt-2 opacity-80 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    批准后将自动执行停药，患者超过30天归档后历史提醒不可误恢复
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  审批意见 *
                </label>
                <textarea
                  value={approveForm.note}
                  onChange={(e) => setApproveForm((f) => ({ ...f, note: e.target.value }))}
                  rows={3}
                  placeholder={
                    approveForm.action === 'approve'
                      ? '请填写批准意见，例如：同意停药，请通知患者家属并做好后续关怀记录...'
                      : '请填写驳回原因，例如：指标尚稳定，建议继续观察一个月后重新评估...'
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => { setShowApproveModal(null); setApproveForm({ note: '', action: 'approve' }); }}
                  className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                >
                  取消
                </button>
                <button
                  onClick={() => handleStopConfirmAction(showApproveModal)}
                  className={`px-4 py-2 text-sm text-white rounded-lg ${
                    approveForm.action === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {approveForm.action === 'approve' ? '确认批准停药' : '确认驳回'}
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
