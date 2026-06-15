import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import StatCard from '@/components/shared/StatCard';
import Badge from '@/components/shared/Badge';
import Modal from '@/components/shared/Modal';
import { AlertTriangle, Users, Pill, Clock, TrendingUp, Bell, Send, UserPlus, ChevronDown, ChevronUp, ShieldAlert, ShieldCheck, UserRound, Stethoscope, PillSwap, FileLock, RefreshCw, Eye, EyeOff, CheckCircle2, XCircle, HandHeart, ListFilter } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { RiskLevel, TriageReason, ReminderExemption } from '@/types';

const riskColors = {
  normal: 'bg-green-100 text-green-700 border-green-200',
  attention: 'bg-amber-100 text-amber-700 border-amber-200',
  critical: 'bg-red-100 text-red-700 border-red-200',
};

const riskLabels = {
  normal: '普通跟进',
  attention: '重点关注',
  critical: '风险预警',
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

const severityColors = {
  high: 'border-l-4 border-l-red-500 bg-red-50',
  medium: 'border-l-4 border-l-amber-500 bg-amber-50',
  low: 'border-l-4 border-l-sky-500 bg-sky-50',
};

const exemptionTypeLabels: Record<string, string> = {
  stock_sufficient: '库存充足',
  revisit_appointed: '已预约复诊',
  stop_pending: '停药待确认',
  privacy_unauthorized: '隐私未授权',
};

type TabKey = 'focus' | 'family' | 'revisit' | 'substitution' | 'privacy';

export default function PharmacistDashboard() {
  const {
    patients, plans, overdueRecords, prescriptions, trails, restockAlerts, groups,
    triageReasons, familySubmissions, drugSubstitutions, revisitSuggestions,
    reTriagePatient, resolveTriageReason, updateDrugSubstitution, addReminderExemption,
    isPatientExempted, smartBatchRemind,
  } = useStore();

  const [expandedPatients, setExpandedPatients] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<TabKey>('focus');
  const [showTriageModal, setShowTriageModal] = useState<string | null>(null);
  const [triageForm, setTriageForm] = useState({ riskLevel: 'attention' as RiskLevel, detail: '' });
  const [showExemptionModal, setShowExemptionModal] = useState<string | null>(null);
  const [exemptionForm, setExemptionForm] = useState({ type: 'stock_sufficient', reason: '', days: 3 });

  const activePatients = patients.filter((p) => p.status === 'active');
  const criticalPatients = patients.filter((p) => p.riskLevel === 'critical' && p.status === 'active');
  const attentionPatients = patients.filter((p) => p.riskLevel === 'attention' && p.status === 'active');
  const highRiskPatients = [...criticalPatients, ...attentionPatients];
  const activePlans = plans.filter((p) => p.status === 'active');
  const expiringPrescriptions = prescriptions.filter(
    (p) => p.status === 'valid' && new Date(p.expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const pendingRestock = restockAlerts.filter((r) => r.status === 'pending');
  const recentTrails = [...trails].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8);

  const unresolvedTriageByPatient: Record<string, TriageReason[]> = {};
  for (const t of triageReasons.filter((t) => !t.resolved)) {
    if (!unresolvedTriageByPatient[t.patientId]) unresolvedTriageByPatient[t.patientId] = [];
    unresolvedTriageByPatient[t.patientId].push(t);
  }

  const familySubmissionsPatientIds = new Set(familySubmissions.map((f) => f.patientId));

  const privacyChangedPatients = patients.filter((p) => !p.privacyAuthorized && p.status === 'active');
  const pendingRevisits = revisitSuggestions.filter((r) => r.status !== 'confirmed');
  const pendingSubstitutions = drugSubstitutions.filter((d) => d.status === 'pending');

  const togglePatientExpand = (pid: string) => {
    setExpandedPatients((prev) => ({ ...prev, [pid]: !prev[pid] }));
  };

  const handleSmartBatchRemind = () => {
    const focusGroups = groups.filter((g) => g.riskLevel === 'attention' || g.riskLevel === 'critical');
    if (focusGroups.length > 0) {
      const result = smartBatchRemind(focusGroups.map((g) => g.id));
      const msg = `智能批量提醒完成\n已提醒：${result.reminded} 位患者\n已豁免：${result.exempted} 位\n${result.reasons.length > 0 ? '\n豁免原因：\n' + result.reasons.map((r) => '  · ' + r).join('\n') : ''}`;
      alert(msg);
    }
  };

  const handleConfirmTriage = (patientId: string) => {
    if (!triageForm.detail.trim()) {
      alert('请填写重新分层的原因说明');
      return;
    }
    reTriagePatient(patientId, triageForm.riskLevel, 'manual_review', triageForm.detail.trim());
    setShowTriageModal(null);
    setTriageForm({ riskLevel: 'attention', detail: '' });
  };

  const handleResolveTriage = (tid: string) => {
    resolveTriageReason(tid, '药师');
  };

  const handleConfirmExemption = (patientId: string) => {
    if (!exemptionForm.reason.trim()) {
      alert('请填写豁免原因');
      return;
    }
    addReminderExemption(patientId, exemptionForm.type as any, exemptionForm.reason.trim(), exemptionForm.days, '药师');
    setShowExemptionModal(null);
    setExemptionForm({ type: 'stock_sufficient', reason: '', days: 3 });
  };

  const getPatientExemption = (patientId: string): { exempted: boolean; exemption?: ReminderExemption } => {
    return isPatientExempted(patientId);
  };

  const tabs: { key: TabKey; label: string; icon: any; count: number }[] = [
    { key: 'focus', label: '重点关注名单', icon: ShieldAlert, count: highRiskPatients.length },
    { key: 'family', label: '家属代办记录', icon: UserRound, count: familySubmissions.length },
    { key: 'revisit', label: '复诊建议', icon: Stethoscope, count: pendingRevisits.length },
    { key: 'substitution', label: '药品替代提醒', icon: PillSwap, count: pendingSubstitutions.length },
    { key: 'privacy', label: '隐私授权变更', icon: FileLock, count: privacyChangedPatients.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">药师工作台</h2>
          <p className="text-slate-500 mt-1">可解释分层追踪 · 智能催办豁免 · 五类模块联动</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSmartBatchRemind}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all shadow-sm"
          >
            <Send className="w-4 h-4" />
            智能批量提醒
            <Badge className="bg-white/20 text-white ml-1 border-0">
              自动豁免
            </Badge>
          </button>
          <Link
            to="/pharmacist/plans"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
          >
            <UserPlus className="w-4 h-4" />
            新建随访计划
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="活跃患者"
          value={activePatients.length}
          icon={<Users className="w-5 h-5" />}
          trend={`${activePatients.filter((p) => p.consecutiveMissedFeedback >= 2).length} 位连续未反馈`}
          trendIcon={<AlertTriangle className="w-4 h-4" />}
          trendColor="text-amber-600"
        />
        <StatCard
          title="活跃计划"
          value={activePlans.length}
          icon={<Pill className="w-5 h-5" />}
          trend={`${overdueRecords.length} 条逾期待处理`}
          trendIcon={<AlertTriangle className="w-4 h-4" />}
          trendColor="text-red-600"
        />
        <StatCard
          title="高风险患者"
          value={highRiskPatients.length}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={`${criticalPatients.length} 风险预警 / ${attentionPatients.length} 重点关注`}
          trendIcon={<Bell className="w-4 h-4" />}
          trendColor="text-rose-600"
        />
        <StatCard
          title="处方即将过期"
          value={expiringPrescriptions.length}
          icon={<Clock className="w-5 h-5" />}
          trend={`7天内到期 · 含 ${pendingSubstitutions.length} 条替代建议`}
          trendIcon={<PillSwap className="w-4 h-4" />}
          trendColor="text-orange-600"
        />
      </div>

      {pendingRestock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-amber-900">
                药品补货提醒：{pendingRestock.length} 种药品库存不足
              </p>
              <p className="text-sm text-amber-700 mt-0.5">
                {pendingRestock.map((r) => `${r.drugName}（剩${r.currentStock}盒）`).join('、')}
              </p>
            </div>
            <Link
              to="/pharmacist/restock"
              className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors"
            >
              查看详情
            </Link>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200">
          <div className="flex flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? 'text-indigo-600 border-indigo-600 bg-indigo-50/50'
                    : 'text-slate-600 border-transparent hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.key ? 'text-indigo-600' : 'text-slate-400'}`} />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    activeTab === tab.key
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
          {activeTab === 'focus' && (
            <div className="space-y-3">
              {highRiskPatients.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <ShieldCheck className="w-12 h-12 mx-auto text-green-400 mb-3" />
                  <p className="font-medium">暂无高风险患者</p>
                  <p className="text-sm mt-1">所有患者随访状态良好，请继续保持</p>
                </div>
              ) : (
                highRiskPatients.slice(0, 6).map((patient) => {
                  const patientPlan = plans.find((p) => p.patientId === patient.id && p.status === 'active');
                  const patientRx = prescriptions.find((r) => r.patientId === patient.id && r.status === 'valid');
                  const isExpired = !patientRx;
                  const patientTriage = unresolvedTriageByPatient[patient.id] || [];
                  const isExpanded = expandedPatients[patient.id];
                  const exemptInfo = getPatientExemption(patient.id);
                  const daysLeft = patientRx ? Math.ceil((new Date(patientRx.expiryDate).getTime() - Date.now()) / 86400000) : 0;
                  const needRetriageFlags = [
                    patient.consecutiveMissedFeedback >= 3 && '连续漏报',
                    patient.multiDisease && patient.multiDisease.length > 0 && '并发多病种',
                    familySubmissionsPatientIds.has(patient.id) && '家属代填反馈',
                  ].filter(Boolean) as string[];

                  return (
                    <div key={patient.id} className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
                      <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-white">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-medium shadow-sm shrink-0 ${
                              patient.riskLevel === 'critical'
                                ? 'bg-gradient-to-br from-rose-500 to-red-600'
                                : 'bg-gradient-to-br from-amber-400 to-orange-500'
                            }`}>
                              {patient.name.slice(0, 1)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-slate-800">{patient.name}</span>
                                <Badge className={riskColors[patient.riskLevel]}>
                                  {riskLabels[patient.riskLevel]}
                                </Badge>
                                <Badge className={statusColors[patient.status]}>
                                  {statusLabels[patient.status]}
                                </Badge>
                                {isExpired && (
                                  <Badge className="bg-red-100 text-red-700 border-red-200">处方已过期</Badge>
                                )}
                                {exemptInfo.exempted && exemptInfo.exemption && (
                                  <Badge className="bg-sky-100 text-sky-700 border-sky-200">
                                    <ShieldCheck className="w-3 h-3 inline mr-1" />
                                    催办豁免
                                  </Badge>
                                )}
                                {needRetriageFlags.length > 0 && (
                                  <Badge className="bg-violet-100 text-violet-700 border-violet-200">
                                    <RefreshCw className="w-3 h-3 inline mr-1" />
                                    需重新分层
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                                <span>{patient.chronicDisease} · {patient.age}岁</span>
                                {patient.multiDisease && patient.multiDisease.length > 0 && (
                                  <span className="text-violet-600">
                                    并发：{patient.multiDisease.join('、')}
                                  </span>
                                )}
                                <span>连续{patient.consecutiveMissedFeedback}次未反馈</span>
                                {patientPlan && <span>下次随访：{patientPlan.nextFollowupDate}</span>}
                                {patientRx && <span>用药：{patientRx.drugName}（{daysLeft}天后到期）</span>}
                              </div>
                              {needRetriageFlags.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {needRetriageFlags.map((flag) => (
                                    <span key={flag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-50 text-violet-700 text-xs rounded-md border border-violet-100">
                                      <ListFilter className="w-3 h-3" />
                                      {flag}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {exemptInfo.exempted && exemptInfo.exemption && (
                                <div className="mt-2 p-2.5 bg-sky-50 border border-sky-100 rounded-lg text-sm">
                                  <div className="flex items-center gap-2 text-sky-700">
                                    <ShieldCheck className="w-4 h-4 shrink-0" />
                                    <span className="font-medium">催办豁免中</span>
                                    <span className="text-xs text-sky-600">
                                      （{exemptionTypeLabels[exemptInfo.exemption.type] || exemptInfo.exemption.type}）
                                    </span>
                                  </div>
                                  <p className="text-sky-700 mt-0.5 ml-6">{exemptInfo.exemption.reason}</p>
                                  <p className="text-xs text-sky-600 mt-0.5 ml-6">豁免至：{exemptInfo.exemption.exemptedUntil}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <button
                              onClick={() => togglePatientExpand(patient.id)}
                              className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-800"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              <span className="text-xs">分层原因（{patientTriage.length}）</span>
                            </button>
                            <div className="flex flex-wrap justify-end gap-2">
                              <button
                                onClick={() => setShowTriageModal(patient.id)}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                              >
                                <RefreshCw className="w-3 h-3" />
                                重新分层
                              </button>
                              {!exemptInfo.exempted && (
                                <button
                                  onClick={() => setShowExemptionModal(patient.id)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                                >
                                  <ShieldCheck className="w-3 h-3" />
                                  设置豁免
                                </button>
                              )}
                              <Link
                                to={`/pharmacist/patients`}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                                详情
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-5 py-4 bg-slate-50/70 border-t border-slate-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                              <HandHeart className="w-4 h-4 text-rose-500" />
                              分层原因解释（点击标记为已处理）
                            </h4>
                            <span className="text-xs text-slate-500">共 {patientTriage.length} 条未处理</span>
                          </div>
                          {patientTriage.length === 0 ? (
                            <p className="text-sm text-slate-500 py-3 px-3 bg-white rounded-lg border border-dashed border-slate-200 text-center">
                              当前无待处理的分层触发原因
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {patientTriage.map((triage) => (
                                <div
                                  key={triage.id}
                                  className={`p-3 rounded-lg cursor-pointer hover:shadow-sm transition-shadow ${severityColors[triage.severity]}`}
                                  onClick={() => handleResolveTriage(triage.id)}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-slate-800 text-sm">{triage.title}</span>
                                        <Badge className={`text-xs ${
                                          triage.severity === 'high'
                                            ? 'bg-red-100 text-red-700'
                                            : triage.severity === 'medium'
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-sky-100 text-sky-700'
                                        }`}>
                                          {triage.severity === 'high' ? '高危' : triage.severity === 'medium' ? '中危' : '低危'}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-slate-600 mt-1">{triage.detail}</p>
                                      <p className="text-xs text-slate-500 mt-1.5">
                                        触发时间：{new Date(triage.triggeredAt).toLocaleString('zh-CN')}
                                      </p>
                                    </div>
                                    <CheckCircle2 className="w-5 h-5 text-slate-400 hover:text-green-600 shrink-0 mt-0.5" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'family' && (
            <div className="space-y-3">
              {familySubmissions.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <UserRound className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p className="font-medium">暂无家属代办记录</p>
                </div>
              ) : (
                familySubmissions.map((fs) => {
                  const patient = patients.find((p) => p.id === fs.patientId);
                  const feedback = fs.feedbackId ? useStore.getState().feedbacks.find((f) => f.id === fs.feedbackId) : null;
                  return (
                    <div key={fs.id} className="p-4 border border-violet-200 rounded-xl bg-violet-50/50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                            <UserRound className="w-5 h-5 text-violet-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-slate-800">{patient?.name}</span>
                              <Badge className="bg-violet-100 text-violet-700">家属代填</Badge>
                              <span className="text-sm text-violet-600">代办人：{fs.familyName}（{fs.relation}）</span>
                            </div>
                            <p className="text-sm text-slate-600 mt-1">
                              提交时间：{new Date(fs.submittedAt).toLocaleString('zh-CN')}
                              {fs.phone && <span className="ml-2">· 联系电话：{fs.phone}</span>}
                            </p>
                            {fs.note && <p className="text-sm text-slate-700 mt-2 italic">备注：{fs.note}</p>}
                            {feedback && (
                              <div className="mt-2 text-sm bg-white rounded-lg p-3 border border-violet-100">
                                <span className="text-slate-500">反馈疗效评分：</span>
                                <span className="font-medium text-violet-700">{feedback.efficacyRating}分</span>
                                <span className="ml-3 text-slate-500">依从性：</span>
                                <span className="font-medium text-violet-700">
                                  {feedback.compliance === 'good' ? '良好' : feedback.compliance === 'moderate' ? '一般' : '较差'}
                                </span>
                                {feedback.note && <p className="mt-1 text-slate-600">说明：{feedback.note}</p>}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <button
                            onClick={() => setShowTriageModal(fs.patientId)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                          >
                            <RefreshCw className="w-3 h-3" />
                            重新分层评估
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'revisit' && (
            <div className="space-y-3">
              {pendingRevisits.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <Stethoscope className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p className="font-medium">暂无不确认的复诊建议</p>
                </div>
              ) : (
                pendingRevisits.map((rs) => {
                  const patient = patients.find((p) => p.id === rs.patientId);
                  const exemptInfo = getPatientExemption(rs.patientId);
                  return (
                    <div key={rs.id} className="p-4 border border-sky-200 rounded-xl bg-sky-50/50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
                            <Stethoscope className="w-5 h-5 text-sky-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-slate-800">{patient?.name}</span>
                              <Badge className="bg-sky-100 text-sky-700">
                                {rs.status === 'pending' ? '待通知' : rs.status === 'sent' ? '已通知' : '未确认'}
                              </Badge>
                              {rs.revisitAppointedAt && (
                                <Badge className="bg-green-100 text-green-700">
                                  <CheckCircle2 className="w-3 h-3 inline mr-1" />
                                  已预约：{rs.revisitAppointedAt}
                                </Badge>
                              )}
                              {exemptInfo.exempted && (
                                <Badge className="bg-slate-100 text-slate-600">
                                  <ShieldCheck className="w-3 h-3 inline mr-1" />
                                  催办已豁免
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 mt-1">
                              <span className="font-medium text-slate-700">原因：</span>{rs.reason}
                            </p>
                            <p className="text-sm text-slate-700 mt-1">
                              <span className="font-medium text-slate-700">建议：</span>{rs.suggestion}
                            </p>
                            <p className="text-xs text-slate-500 mt-2">
                              创建时间：{new Date(rs.createdAt).toLocaleString('zh-CN')}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          {!rs.revisitAppointedAt && !exemptInfo.exempted && (
                            <button
                              onClick={() => setShowExemptionModal(rs.patientId)}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                            >
                              <ShieldCheck className="w-3 h-3" />
                              已预约复诊·豁免催办
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'substitution' && (
            <div className="space-y-3">
              {pendingSubstitutions.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <PillSwap className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p className="font-medium">暂无待确认的药品替代建议</p>
                </div>
              ) : (
                pendingSubstitutions.map((ds) => {
                  const patient = patients.find((p) => p.id === ds.patientId);
                  const exemptInfo = getPatientExemption(ds.patientId);
                  return (
                    <div key={ds.id} className="p-4 border border-orange-200 rounded-xl bg-orange-50/50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                            <PillSwap className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-slate-800">{patient?.name}</span>
                              <Badge className="bg-orange-100 text-orange-700">替代建议待确认</Badge>
                              {ds.stockStatus === 'sufficient' && (
                                <Badge className="bg-green-100 text-green-700">库存充足</Badge>
                              )}
                              {ds.stockStatus === 'low' && (
                                <Badge className="bg-red-100 text-red-700">库存紧张</Badge>
                              )}
                              {exemptInfo.exempted && ds.stockStatus === 'sufficient' && (
                                <Badge className="bg-slate-100 text-slate-600">催办已豁免</Badge>
                              )}
                            </div>
                            <div className="mt-2 p-3 bg-white rounded-lg border border-orange-100">
                              <div className="flex items-center gap-2 text-sm flex-wrap">
                                <span className="px-2 py-1 bg-red-50 text-red-700 rounded font-medium">{ds.originalDrug}</span>
                                <span className="text-slate-400">→</span>
                                <span className="px-2 py-1 bg-green-50 text-green-700 rounded font-medium">{ds.substituteDrug}</span>
                                <span className="text-slate-500 ml-2">
                                  差价：<span className="font-medium text-orange-600">{ds.costDifference > 0 ? '+' : ''}¥{ds.costDifference}</span>
                                </span>
                              </div>
                              <p className="text-sm text-slate-600 mt-2">{ds.reason}</p>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                              生成时间：{new Date(ds.suggestedAt).toLocaleString('zh-CN')}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <button
                            onClick={() => updateDrugSubstitution(ds.id, 'accepted')}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            接受替代
                          </button>
                          <button
                            onClick={() => updateDrugSubstitution(ds.id, 'rejected')}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-600 text-white rounded-lg hover:bg-slate-700"
                          >
                            <XCircle className="w-3 h-3" />
                            拒绝·保持原药
                          </button>
                          {!exemptInfo.exempted && ds.stockStatus === 'sufficient' && (
                            <button
                              onClick={() => setShowExemptionModal(ds.patientId)}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                            >
                              <ShieldCheck className="w-3 h-3" />
                              库存充足·豁免催办
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-3">
              {privacyChangedPatients.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <FileLock className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p className="font-medium">所有患者均已授权隐私协议</p>
                </div>
              ) : (
                privacyChangedPatients.map((patient) => {
                  const exemptInfo = getPatientExemption(patient.id);
                  return (
                    <div key={patient.id} className="p-4 border border-slate-300 rounded-xl bg-slate-50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
                            <FileLock className="w-5 h-5 text-slate-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-slate-800">{patient.name}</span>
                              <Badge className="bg-slate-200 text-slate-700">
                                <EyeOff className="w-3 h-3 inline mr-1" />
                                未授权隐私协议
                              </Badge>
                              {exemptInfo.exempted && (
                                <Badge className="bg-sky-100 text-sky-700">催办豁免中</Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 mt-1">
                              {patient.chronicDisease} · {patient.age}岁 · {patient.phone}
                            </p>
                            <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                              <HandHeart className="w-4 h-4 inline mr-1.5 align-middle" />
                              未授权隐私协议的患者将被<strong>自动豁免催办</strong>，建议联系患者补充授权
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <button
                            onClick={() => useStore.getState().togglePrivacy(patient.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                          >
                            <Eye className="w-3 h-3" />
                            补充授权记录
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              即将到期处方（7天内）
            </h3>
            <Link to="/pharmacist/revisit" className="text-sm text-indigo-600 hover:text-indigo-700">
              管理复诊建议 →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 text-sm text-slate-600">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">患者</th>
                  <th className="text-left px-5 py-3 font-medium">药品</th>
                  <th className="text-left px-5 py-3 font-medium">剂量</th>
                  <th className="text-left px-5 py-3 font-medium">到期日期</th>
                  <th className="text-left px-5 py-3 font-medium">催办状态</th>
                  <th className="text-right px-5 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expiringPrescriptions.slice(0, 6).map((rx) => {
                  const patient = patients.find((p) => p.id === rx.patientId);
                  const daysLeft = Math.ceil((new Date(rx.expiryDate).getTime() - Date.now()) / 86400000);
                  const exemptInfo = getPatientExemption(rx.patientId);
                  const sub = pendingSubstitutions.find((s) => s.patientId === rx.patientId);
                  return (
                    <tr key={rx.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-medium text-slate-800">{patient?.name}</td>
                      <td className="px-5 py-4 text-slate-600">{rx.drugName}</td>
                      <td className="px-5 py-4 text-slate-600 text-sm">{rx.dosage} {rx.frequency}</td>
                      <td className="px-5 py-4">
                        <span className={daysLeft <= 0 ? 'text-red-600 font-medium' : 'text-amber-600'}>
                          {rx.expiryDate}
                          {daysLeft > 0 && <span className="ml-2">({daysLeft}天后)</span>}
                          {daysLeft <= 0 && <span className="ml-2">(已过期)</span>}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {exemptInfo.exempted ? (
                          <Badge className="bg-sky-100 text-sky-700">
                            <ShieldCheck className="w-3 h-3 inline mr-1" />
                            豁免
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700">待催办</Badge>
                        )}
                        {sub && (
                          <span className="ml-2 text-xs text-orange-600">有替代建议</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                          发起复诊
                        </button>
                        {!exemptInfo.exempted && (
                          <button
                            onClick={() => setShowExemptionModal(rx.patientId)}
                            className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                          >
                            豁免
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">最近业务轨迹</h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {recentTrails.map((trail) => (
              <div key={trail.id} className="px-5 py-3 hover:bg-slate-50 transition-colors">
                <p className="text-sm text-slate-800 line-clamp-2">{trail.description}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-slate-500">{trail.patientName}</span>
                  <span className="text-xs text-slate-400">
                    {new Date(trail.timestamp).toLocaleString('zh-CN', {
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        open={showTriageModal !== null}
        onClose={() => { setShowTriageModal(null); setTriageForm({ riskLevel: 'attention', detail: '' }); }}
        title="重新分层评估"
        description="手动调整患者风险分层等级，系统将记录调整原因并生成业务轨迹"
      >
        {showTriageModal && (() => {
          const patient = patients.find((p) => p.id === showTriageModal);
          return (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm">
                  <span className="font-medium text-slate-800">{patient?.name}</span>
                  <span className="text-slate-500 mx-2">·</span>
                  <span className="text-slate-600">当前分层：</span>
                  <Badge className={riskColors[patient?.riskLevel || 'normal']}>{riskLabels[patient?.riskLevel || 'normal']}</Badge>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">新风险等级</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['normal', 'attention', 'critical'] as RiskLevel[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => setTriageForm((f) => ({ ...f, riskLevel: level }))}
                      className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                        triageForm.riskLevel === level
                          ? riskColors[level].replace('bg-', 'border-').replace('text-', 'text-') + ' bg-white'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {riskLabels[level]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">调整原因说明 *</label>
                <textarea
                  value={triageForm.detail}
                  onChange={(e) => setTriageForm((f) => ({ ...f, detail: e.target.value }))}
                  rows={3}
                  placeholder="请详细说明重新分层的原因，例如：患者近期血糖指标连续3次波动超过阈值20%，需提升至风险预警等级..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => { setShowTriageModal(null); setTriageForm({ riskLevel: 'attention', detail: '' }); }}
                  className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                >
                  取消
                </button>
                <button
                  onClick={() => handleConfirmTriage(showTriageModal)}
                  className="px-4 py-2 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                >
                  确认调整分层
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      <Modal
        open={showExemptionModal !== null}
        onClose={() => { setShowExemptionModal(null); setExemptionForm({ type: 'stock_sufficient', reason: '', days: 3 }); }}
        title="设置催办豁免"
        description="在豁免期内，该患者不会收到批量催办和自动提醒。适用于已预约复诊、库存充足等场景"
      >
        {showExemptionModal && (() => {
          const patient = patients.find((p) => p.id === showExemptionModal);
          return (
            <div className="space-y-4">
              <div className="p-3 bg-sky-50 rounded-lg border border-sky-200">
                <p className="text-sm text-sky-800">
                  <span className="font-medium">{patient?.name}</span>
                  <span className="text-sky-600 mx-2">·</span>
                  <span>{patient?.chronicDisease}</span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">豁免类型</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(exemptionTypeLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setExemptionForm((f) => ({ ...f, type: key }))}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                        exemptionForm.type === key
                          ? 'border-sky-500 bg-sky-50 text-sky-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">豁免天数</label>
                <div className="flex gap-2">
                  {[3, 7, 14, 30].map((d) => (
                    <button
                      key={d}
                      onClick={() => setExemptionForm((f) => ({ ...f, days: d }))}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                        exemptionForm.days === d
                          ? 'border-sky-500 bg-sky-50 text-sky-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {d}天
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">豁免原因说明 *</label>
                <textarea
                  value={exemptionForm.reason}
                  onChange={(e) => setExemptionForm((f) => ({ ...f, reason: e.target.value }))}
                  rows={2}
                  placeholder="请填写具体豁免原因，例如：患者已于12月15日预约三甲医院内分泌科复诊续方"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => { setShowExemptionModal(null); setExemptionForm({ type: 'stock_sufficient', reason: '', days: 3 }); }}
                  className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                >
                  取消
                </button>
                <button
                  onClick={() => handleConfirmExemption(showExemptionModal)}
                  className="px-4 py-2 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                >
                  确认豁免
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
