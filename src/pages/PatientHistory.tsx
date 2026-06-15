import { useStore } from '@/hooks/useStore';
import Badge from '@/components/shared/Badge';
import { Clock, Pill, AlertTriangle, FileText, Shield, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const trailTypeLabels: Record<string, string> = {
  plan_created: '随访计划创建',
  feedback_changed: '用药反馈提交',
  overdue_escalated: '逾期升级',
  prescription_expired: '处方过期',
  medication_stopped: '停药处理',
  batch_reminder: '批量提醒',
  privacy_changed: '隐私授权变更',
  allergy_added: '过敏记录添加',
  restock_alert: '药品补货提醒',
  revisit_suggested: '复诊建议',
};

const trailTypeColors: Record<string, string> = {
  plan_created: 'bg-blue-100 text-blue-700',
  feedback_changed: 'bg-green-100 text-green-700',
  overdue_escalated: 'bg-amber-100 text-amber-700',
  prescription_expired: 'bg-red-100 text-red-700',
  medication_stopped: 'bg-slate-100 text-slate-700',
  batch_reminder: 'bg-indigo-100 text-indigo-700',
  privacy_changed: 'bg-purple-100 text-purple-700',
  allergy_added: 'bg-rose-100 text-rose-700',
  restock_alert: 'bg-orange-100 text-orange-700',
  revisit_suggested: 'bg-amber-100 text-amber-700',
};

export default function PatientHistory() {
  const { patients, feedbacks, trails, prescriptions, allergies } = useStore();

  const demoPatient = patients[0];
  if (!demoPatient) return null;

  const patientFeedbacks = feedbacks
    .filter((f) => f.patientId === demoPatient.id)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  const patientTrails = trails
    .filter((t) => t.patientId === demoPatient.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const patientPrescriptions = prescriptions
    .filter((p) => p.patientId === demoPatient.id)
    .sort((a, b) => new Date(b.prescribedDate).getTime() - new Date(a.prescribedDate).getTime());

  const patientAllergies = allergies.filter((a) => a.patientId === demoPatient.id);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">我的历史记录</h2>
          <p className="text-slate-500 mt-1">查看您的随访、反馈和诊疗历史</p>
        </div>
        <Link
          to="/patient"
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          ← 返回首页
        </Link>
      </div>

      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{demoPatient.name}</h3>
            <p className="text-white/80 text-sm">{demoPatient.chronicDisease} · {demoPatient.age}岁 · {demoPatient.gender}</p>
            <p className="text-white/70 text-xs mt-1">随访开始于 {demoPatient.createdAt}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">反馈记录</p>
              <p className="text-2xl font-bold text-slate-800">{patientFeedbacks.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Pill className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">处方记录</p>
              <p className="text-2xl font-bold text-slate-800">{patientPrescriptions.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">过敏记录</p>
              <p className="text-2xl font-bold text-slate-800">{patientAllergies.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">业务轨迹</p>
              <p className="text-2xl font-bold text-slate-800">{patientTrails.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              用药反馈历史
            </h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {patientFeedbacks.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>暂无反馈记录</p>
                <Link
                  to="/patient/feedback"
                  className="inline-block mt-4 text-indigo-600 hover:text-indigo-700"
                >
                  提交第一次反馈 →
                </Link>
              </div>
            ) : (
              patientFeedbacks.map((feedback) => (
                <div key={feedback.id} className="p-4 hover:bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={feedback.compliance === 'good' ? 'success' : feedback.compliance === 'moderate' ? 'warning' : 'danger'}>
                        {feedback.compliance === 'good' ? '依从性好' : feedback.compliance === 'moderate' ? '依从性一般' : '依从性差'}
                      </Badge>
                      <span className="text-sm text-slate-500">
                        疗效：{'★'.repeat(feedback.efficacyRating)}{'☆'.repeat(5 - feedback.efficacyRating)}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {formatDate(feedback.submittedAt)}
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
                  <p className="text-xs text-slate-400 mt-2">
                    提交者：{feedback.submittedBy === 'patient' ? '患者本人' : feedback.submittedBy === 'pharmacist' ? '药师代填' : '管理员'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Pill className="w-5 h-5 text-blue-600" />
              处方历史
            </h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {patientPrescriptions.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Pill className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>暂无处方记录</p>
              </div>
            ) : (
              patientPrescriptions.map((rx) => (
                <div key={rx.id} className="p-4 hover:bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800">{rx.drugName}</span>
                      <Badge variant={rx.status === 'valid' ? 'success' : rx.status === 'expired' ? 'danger' : 'info'}>
                        {rx.status === 'valid' ? '有效' : rx.status === 'expired' ? '已过期' : '已续方'}
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-400">
                      开具：{rx.prescribedDate}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{rx.dosage} · {rx.frequency}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    有效期至：{rx.expiryDate}
                    {rx.status === 'expired' && <span className="text-red-500 ml-2">已过期，请复诊续方</span>}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            全流程业务轨迹
          </h3>
          <p className="text-sm text-slate-500 mt-1">所有与您相关的随访操作记录</p>
        </div>
        <div className="p-6">
          {patientTrails.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>暂无业务轨迹记录</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
              <div className="space-y-6">
                {patientTrails.map((trail) => (
                  <div key={trail.id} className="relative pl-10">
                    <div className={`absolute left-2 w-5 h-5 rounded-full border-2 border-white ${
                      trailTypeColors[trail.type]?.split(' ')[0] || 'bg-slate-400'
                    }`}></div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            trailTypeColors[trail.type] || 'bg-slate-100 text-slate-700'
                          }`}>
                            {trailTypeLabels[trail.type] || trail.type}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {formatDate(trail.timestamp)}
                        </span>
                      </div>
                      <p className="text-slate-700">{trail.description}</p>
                      <p className="text-xs text-slate-500 mt-2">
                        操作人：{trail.operator}（{trail.operatorRole === 'pharmacist' ? '药师' : trail.operatorRole === 'patient' ? '患者' : '管理员'}）
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {patientAllergies.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              过敏禁忌记录
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patientAllergies.map((allergy) => (
                <div key={allergy.id} className="flex items-center gap-4 p-4 bg-red-50 rounded-lg border border-red-100">
                  <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-red-700">{allergy.drugName}</span>
                      <Badge variant={allergy.severity === 'severe' ? 'danger' : 'warning'}>
                        {allergy.severity === 'severe' ? '严重过敏' : allergy.severity === 'moderate' ? '中度过敏' : '轻度过敏'}
                      </Badge>
                    </div>
                    {allergy.note && (
                      <p className="text-sm text-red-600 mt-1">{allergy.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
