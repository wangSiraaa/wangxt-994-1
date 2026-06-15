import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import Badge from '@/components/shared/Badge';
import { Pill, Send, Star, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const complianceOptions = [
  { value: 'good' as const, label: '完全按时服药', description: '每天按时按量，没有遗漏' },
  { value: 'moderate' as const, label: '偶尔忘记服药', description: '每周遗漏1-2次，基本按时' },
  { value: 'poor' as const, label: '经常忘记服药', description: '每周遗漏3次以上，不太规律' },
];

export default function PatientFeedback() {
  const { patients, plans, prescriptions, allergies, submitFeedback, currentRole } = useStore();

  const demoPatient = patients[0];
  if (!demoPatient) return null;

  const patientPlans = plans.filter((p) => p.patientId === demoPatient.id);
  const patientPrescriptions = prescriptions.filter((p) => p.patientId === demoPatient.id);
  const patientAllergies = allergies.filter((a) => a.patientId === demoPatient.id);

  const activePlan = patientPlans.find((p) => p.status === 'active');
  const validPrescription = patientPrescriptions.find((p) => p.status === 'valid');

  const [efficacyRating, setEfficacyRating] = useState(4);
  const [adverseReaction, setAdverseReaction] = useState('无');
  const [compliance, setCompliance] = useState<'good' | 'moderate' | 'poor'>('good');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!activePlan) return;
    submitFeedback(
      demoPatient.id,
      activePlan.id,
      efficacyRating,
      adverseReaction.trim() || '无',
      compliance,
      note.trim()
    );
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEfficacyRating(4);
      setAdverseReaction('无');
      setCompliance('good');
      setNote('');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">提交用药反馈</h2>
          <p className="text-slate-500 mt-1">帮助药师了解您的用药情况，及时调整治疗方案</p>
        </div>
        <Link
          to="/patient"
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          ← 返回首页
        </Link>
      </div>

      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-800">反馈提交成功！</h3>
            <p className="text-sm text-green-700">感谢您的反馈，药师会尽快查看并给出建议。</p>
          </div>
        </div>
      )}

      {!activePlan && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-amber-600" />
          <div>
            <h3 className="font-semibold text-amber-800">暂无活跃随访计划</h3>
            <p className="text-sm text-amber-700">请联系药师为您创建随访计划后再提交反馈。</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Pill className="w-5 h-5 text-indigo-600" />
              当前用药方案
            </h3>
            {patientPrescriptions.length === 0 ? (
              <p className="text-slate-500">暂无处方记录</p>
            ) : (
              <div className="space-y-3">
                {patientPrescriptions.map((rx) => (
                  <div key={rx.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
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
                          {rx.status === 'valid' ? '有效' : '已过期'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{rx.dosage} · {rx.frequency}</p>
                    </div>
                    {rx.status !== 'valid' && (
                      <Badge variant="warning">请复诊续方</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {patientAllergies.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                过敏禁忌提醒
              </h3>
              <div className="space-y-2">
                {patientAllergies.map((allergy) => (
                  <div key={allergy.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
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
          )}

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-6">用药反馈表单</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  服药依从性
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {complianceOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setCompliance(option.value)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        compliance === option.value
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <p className={`font-medium ${
                        compliance === option.value ? 'text-indigo-700' : 'text-slate-700'
                      }`}>
                        {option.label}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  疗效评分
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEfficacyRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= efficacyRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-lg font-medium text-slate-700">
                    {efficacyRating}/5
                  </span>
                  <span className="text-sm text-slate-500 ml-2">
                    {efficacyRating === 1 ? '非常不满意' :
                     efficacyRating === 2 ? '不太满意' :
                     efficacyRating === 3 ? '一般' :
                     efficacyRating === 4 ? '比较满意' : '非常满意'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  不良反应
                </label>
                <input
                  type="text"
                  value={adverseReaction}
                  onChange={(e) => setAdverseReaction(e.target.value)}
                  placeholder="如有不适请描述症状，如：头晕、恶心、皮疹等，无不适请填'无'"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">
                  如有严重不良反应请立即停药并就医
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  其他说明
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="请描述您的用药感受、饮食运动情况、需要向药师咨询的问题等"
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!activePlan || submitted}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
                提交反馈
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {activePlan && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-800 mb-4">随访计划信息</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">随访周期</span>
                  <span className="font-medium text-slate-700">每 {activePlan.cycleDays} 天</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">下次随访</span>
                  <span className="font-medium text-slate-700">{activePlan.nextFollowupDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">最近反馈</span>
                  <span className="font-medium text-slate-700">
                    {activePlan.lastFeedbackDate || '暂无'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">状态</span>
                  <Badge variant={activePlan.status === 'active' ? 'success' : 'default'}>
                    {activePlan.status === 'active' ? '进行中' : activePlan.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {validPrescription && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-800 mb-4">处方有效期提醒</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">药品</span>
                  <span className="font-medium text-slate-700">{validPrescription.drugName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">开具日期</span>
                  <span className="font-medium text-slate-700">{validPrescription.prescribedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">有效期至</span>
                  <span className="font-medium text-amber-600">{validPrescription.expiryDate}</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-700">
                  请在处方到期前及时复诊续方，避免影响用药连续性。
                </p>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
            <h3 className="font-semibold mb-2">温馨提示</h3>
            <ul className="text-sm space-y-2 text-white/90">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 flex-shrink-0"></span>
                请按时服药，不要自行增减剂量或停药
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 flex-shrink-0"></span>
                定期监测血压、血糖等慢病指标
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 flex-shrink-0"></span>
                保持健康饮食和适量运动
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 flex-shrink-0"></span>
                如有不适及时与药师沟通或就医
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
