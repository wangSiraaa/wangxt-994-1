import { useStore } from '@/hooks/useStore';
import Badge from '@/components/shared/Badge';
import { Pill, Clock, AlertTriangle, Shield, Calendar, CheckCircle, XCircle, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const riskColors = {
  normal: 'bg-green-100 text-green-700',
  attention: 'bg-amber-100 text-amber-700',
  critical: 'bg-red-100 text-red-700',
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
  active: '正常随访',
  stopped: '已停药',
  paused: '随访暂停',
  archived: '已归档',
};

export default function PatientDashboard() {
  const { patients, plans, prescriptions, allergies, feedbacks, currentRole, togglePrivacy, revisitSuggestions } = useStore();

  const demoPatient = patients[0];
  if (!demoPatient) return null;

  const patientPlans = plans.filter((p) => p.patientId === demoPatient.id);
  const patientPrescriptions = prescriptions.filter((p) => p.patientId === demoPatient.id);
  const patientAllergies = allergies.filter((a) => a.patientId === demoPatient.id);
  const patientFeedbacks = feedbacks.filter((f) => f.patientId === demoPatient.id).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  const patientSuggestions = revisitSuggestions.filter((s) => s.patientId === demoPatient.id && s.status !== 'confirmed');

  const activePlan = patientPlans.find((p) => p.status === 'active');
  const validPrescription = patientPrescriptions.find((p) => p.status === 'valid');
  const latestFeedback = patientFeedbacks[0];

  const today = new Date().toISOString().slice(0, 10);
  const daysUntilNextFollowup = activePlan
    ? Math.ceil((new Date(activePlan.nextFollowupDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const daysUntilPrescriptionExpiry = validPrescription
    ? Math.ceil((new Date(validPrescription.expiryDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">我的随访</h2>
          <p className="text-slate-500 mt-1">您好，{demoPatient.name}！请按时完成用药反馈</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{demoPatient.name}</h3>
              <p className="text-white/80 text-sm">{demoPatient.chronicDisease} · {demoPatient.age}岁 · {demoPatient.gender}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded-full text-xs ${riskColors[demoPatient.riskLevel]}`}>
                  {riskLabels[demoPatient.riskLevel]}风险
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[demoPatient.status]}`}>
                  {statusLabels[demoPatient.status]}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm">连续未反馈</p>
            <p className="text-3xl font-bold">{demoPatient.consecutiveMissedFeedback} 次</p>
          </div>
        </div>
      </div>

      {patientSuggestions.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800">复诊提醒</h3>
              {patientSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="mt-2">
                  <p className="text-amber-700 text-sm">{suggestion.reason}</p>
                  <p className="text-amber-700 text-sm mt-1">
                    <span className="font-medium">建议：</span>{suggestion.suggestion}
                  </p>
                  <Badge variant="warning" className="mt-2">
                    {suggestion.status === 'pending' ? '待查看' : '已通知'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              daysUntilNextFollowup !== null && daysUntilNextFollowup <= 0
                ? 'bg-red-100'
                : daysUntilNextFollowup !== null && daysUntilNextFollowup <= 3
                ? 'bg-amber-100'
                : 'bg-green-100'
            }`}>
              <Calendar className={`w-6 h-6 ${
                daysUntilNextFollowup !== null && daysUntilNextFollowup <= 0
                  ? 'text-red-600'
                  : daysUntilNextFollowup !== null && daysUntilNextFollowup <= 3
                  ? 'text-amber-600'
                  : 'text-green-600'
              }`} />
            </div>
            <div>
              <p className="text-sm text-slate-500">下次随访</p>
              {activePlan ? (
                <>
                  <p className="text-xl font-bold text-slate-800">{activePlan.nextFollowupDate}</p>
                  <p className={`text-sm ${
                    daysUntilNextFollowup !== null && daysUntilNextFollowup < 0
                      ? 'text-red-600 font-medium'
                      : daysUntilNextFollowup !== null && daysUntilNextFollowup === 0
                      ? 'text-amber-600 font-medium'
                      : 'text-slate-500'
                  }`}>
                    {daysUntilNextFollowup !== null && daysUntilNextFollowup < 0
                      ? `已逾期 ${Math.abs(daysUntilNextFollowup)} 天`
                      : daysUntilNextFollowup !== null && daysUntilNextFollowup === 0
                      ? '今天到期'
                      : `还有 ${daysUntilNextFollowup} 天`}
                  </p>
                </>
              ) : (
                <p className="text-slate-500">暂无活跃随访计划</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              daysUntilPrescriptionExpiry !== null && daysUntilPrescriptionExpiry <= 0
                ? 'bg-red-100'
                : daysUntilPrescriptionExpiry !== null && daysUntilPrescriptionExpiry <= 7
                ? 'bg-amber-100'
                : 'bg-blue-100'
            }`}>
              <Pill className={`w-6 h-6 ${
                daysUntilPrescriptionExpiry !== null && daysUntilPrescriptionExpiry <= 0
                  ? 'text-red-600'
                  : daysUntilPrescriptionExpiry !== null && daysUntilPrescriptionExpiry <= 7
                  ? 'text-amber-600'
                  : 'text-blue-600'
              }`} />
            </div>
            <div>
              <p className="text-sm text-slate-500">处方有效期</p>
              {validPrescription ? (
                <>
                  <p className="text-xl font-bold text-slate-800">{validPrescription.drugName}</p>
                  <p className={`text-sm ${
                    daysUntilPrescriptionExpiry !== null && daysUntilPrescriptionExpiry < 0
                      ? 'text-red-600 font-medium'
                      : daysUntilPrescriptionExpiry !== null && daysUntilPrescriptionExpiry <= 7
                      ? 'text-amber-600 font-medium'
                      : 'text-slate-500'
                  }`}>
                    {daysUntilPrescriptionExpiry !== null && daysUntilPrescriptionExpiry < 0
                      ? `已过期 ${Math.abs(daysUntilPrescriptionExpiry)} 天，请及时复诊`
                      : daysUntilPrescriptionExpiry !== null && daysUntilPrescriptionExpiry <= 7
                      ? `还有 ${daysUntilPrescriptionExpiry} 天到期，建议复诊续方`
                      : `有效期至 ${validPrescription.expiryDate}`}
                  </p>
                </>
              ) : (
                <p className="text-red-600 font-medium">处方已过期，请复诊续方</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              demoPatient.privacyAuthorized ? 'bg-green-100' : 'bg-amber-100'
            }`}>
              <Shield className={`w-6 h-6 ${
                demoPatient.privacyAuthorized ? 'text-green-600' : 'text-amber-600'
              }`} />
            </div>
            <div>
              <p className="text-sm text-slate-500">隐私授权</p>
              <p className={`text-xl font-bold ${
                demoPatient.privacyAuthorized ? 'text-green-600' : 'text-amber-600'
              }`}>
                {demoPatient.privacyAuthorized ? '已授权' : '未授权'}
              </p>
              <button
                onClick={() => togglePrivacy(demoPatient.id)}
                className="text-sm text-indigo-600 hover:text-indigo-700 mt-1"
              >
                {demoPatient.privacyAuthorized ? '撤回授权' : '立即授权'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">用药方案</h3>
          </div>
          <div className="p-4 space-y-4">
            {patientPrescriptions.length === 0 ? (
              <p className="text-slate-500 text-center py-8">暂无处方记录</p>
            ) : (
              patientPrescriptions.map((rx) => (
                <div key={rx.id} className="flex items-start gap-4 p-3 bg-slate-50 rounded-lg">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    rx.status === 'valid' ? 'bg-green-100' : 'bg-slate-100'
                  }`}>
                    <Pill className={`w-5 h-5 ${
                      rx.status === 'valid' ? 'text-green-600' : 'text-slate-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800">{rx.drugName}</span>
                      <Badge variant={rx.status === 'valid' ? 'success' : 'default'}>
                        {rx.status === 'valid' ? '有效' : rx.status === 'expired' ? '已过期' : '已续方'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{rx.dosage} · {rx.frequency}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      开具日期：{rx.prescribedDate} · 有效期至：{rx.expiryDate}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">过敏禁忌</h3>
          </div>
          <div className="p-4 space-y-3">
            {patientAllergies.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-2" />
                <p className="text-slate-500">暂无过敏记录</p>
              </div>
            ) : (
              patientAllergies.map((allergy) => (
                <div key={allergy.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-red-700">{allergy.drugName}</span>
                      <Badge variant={allergy.severity === 'severe' ? 'danger' : 'warning'}>
                        {allergy.severity === 'severe' ? '严重' : allergy.severity === 'moderate' ? '中度' : '轻度'}
                      </Badge>
                    </div>
                    {allergy.note && (
                      <p className="text-sm text-red-600 mt-1">{allergy.note}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">最近反馈记录</h3>
          <Link
            to="/patient/feedback"
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            提交新反馈 →
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {patientFeedbacks.length === 0 ? (
            <div className="p-12 text-center">
              <Clock className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">暂无反馈记录</p>
              <Link
                to="/patient/feedback"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                提交第一次反馈
              </Link>
            </div>
          ) : (
            patientFeedbacks.slice(0, 3).map((feedback) => (
              <div key={feedback.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={feedback.compliance === 'good' ? 'success' : feedback.compliance === 'moderate' ? 'warning' : 'danger'}>
                      {feedback.compliance === 'good' ? '依从性好' : feedback.compliance === 'moderate' ? '依从性一般' : '依从性差'}
                    </Badge>
                    <span className="text-sm text-slate-500">
                      疗效评分：{feedback.efficacyRating}/5
                    </span>
                  </div>
                  <span className="text-sm text-slate-500">
                    {new Date(feedback.submittedAt).toLocaleString('zh-CN')}
                  </span>
                </div>
                {feedback.adverseReaction && feedback.adverseReaction !== '无' && (
                  <p className="text-sm text-amber-600 mb-1">
                    <span className="font-medium">不良反应：</span>{feedback.adverseReaction}
                  </p>
                )}
                {feedback.note && (
                  <p className="text-sm text-slate-600">{feedback.note}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {activePlan && daysUntilNextFollowup !== null && daysUntilNextFollowup <= 3 && (
        <div className="flex justify-center">
          <Link
            to="/patient/feedback"
            className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-lg font-medium shadow-lg shadow-indigo-200"
          >
            <Pill className="w-6 h-6" />
            提交用药反馈
          </Link>
        </div>
      )}
    </div>
  );
}
