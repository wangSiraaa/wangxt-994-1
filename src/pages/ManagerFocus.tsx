import { useStore } from '@/hooks/useStore';
import Badge from '@/components/shared/Badge';
import { AlertTriangle, User, Clock, Pill, XCircle, Phone, MessageSquare, Calendar, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const riskLabels = {
  normal: '普通',
  attention: '关注',
  critical: '重点',
};

const statusLabels = {
  active: '活跃',
  stopped: '停药',
  paused: '暂停',
  archived: '归档',
};

export default function ManagerFocus() {
  const { patients, plans, prescriptions, feedbacks, overdueRecords } = useStore();

  const criticalPatients = patients.filter((p) => p.riskLevel === 'critical' && p.status === 'active');
  const attentionPatients = patients.filter((p) => p.riskLevel === 'attention' && p.status === 'active');

  const getActivePlan = (patientId: string) => plans.find((p) => p.patientId === patientId && p.status === 'active');
  const getValidPrescription = (patientId: string) => prescriptions.find((p) => p.patientId === patientId && p.status === 'valid');
  const getExpiredPrescription = (patientId: string) => prescriptions.find((p) => p.patientId === patientId && p.status === 'expired');
  const getLatestFeedback = (patientId: string) => {
    return feedbacks
      .filter((f) => f.patientId === patientId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];
  };
  const getOverdueRecord = (patientId: string) => overdueRecords.find((r) => r.patientId === patientId);

  const PatientCard = ({ patient }: { patient: typeof patients[0] }) => {
    const activePlan = getActivePlan(patient.id);
    const validRx = getValidPrescription(patient.id);
    const expiredRx = getExpiredPrescription(patient.id);
    const latestFeedback = getLatestFeedback(patient.id);
    const overdueRecord = getOverdueRecord(patient.id);
    const patientAllergies = useStore.getState().allergies.filter((a) => a.patientId === patient.id);

    const today = new Date().toISOString().slice(0, 10);
    const daysUntilExpiry = validRx
      ? Math.ceil((new Date(validRx.expiryDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return (
      <div className="bg-white rounded-xl border border-slate-200 hover:shadow-lg transition-shadow">
        <div className={`h-2 rounded-t-xl ${
          patient.riskLevel === 'critical' ? 'bg-red-500' : 'bg-amber-500'
        }`}></div>
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                patient.riskLevel === 'critical' ? 'bg-red-100' : 'bg-amber-100'
              }`}>
                <span className={`text-xl font-semibold ${
                  patient.riskLevel === 'critical' ? 'text-red-600' : 'text-amber-600'
                }`}>
                  {patient.name.charAt(0)}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-800">{patient.name}</h3>
                  <Badge variant={patient.riskLevel === 'critical' ? 'danger' : 'warning'}>
                    {riskLabels[patient.riskLevel]}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500 mt-0.5">
                  {patient.chronicDisease} · {patient.age}岁 · {patient.gender}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <XCircle className="w-3.5 h-3.5" />
                连续未反馈
              </div>
              <p className={`text-lg font-bold ${
                patient.consecutiveMissedFeedback >= 2 ? 'text-red-600' : 'text-amber-600'
              }`}>
                {patient.consecutiveMissedFeedback} 次
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <Clock className="w-3.5 h-3.5" />
                随访周期
              </div>
              <p className="text-lg font-bold text-slate-700">
                {activePlan ? `每${activePlan.cycleDays}天` : '无计划'}
              </p>
            </div>
          </div>

          {overdueRecord && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">随访逾期 {overdueRecord.overdueDays} 天</span>
              </div>
              <Badge variant={
                overdueRecord.supervisionStatus === 'pending' ? 'danger' :
                overdueRecord.supervisionStatus === 'contacted' ? 'warning' :
                overdueRecord.supervisionStatus === 'appointing' ? 'info' : 'default'
              } className="mt-2">
                {overdueRecord.supervisionStatus === 'pending' ? '待督办' :
                 overdueRecord.supervisionStatus === 'contacted' ? '已联系' :
                 overdueRecord.supervisionStatus === 'appointing' ? '已预约' : '已升级'}
              </Badge>
            </div>
          )}

          {expiredRx && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-700">
                <Pill className="w-4 h-4" />
                <span className="font-medium">处方已过期：{expiredRx.drugName}</span>
              </div>
              <p className="text-xs text-amber-600 mt-1">请督促患者尽快复诊续方</p>
            </div>
          )}

          {validRx && daysUntilExpiry !== null && daysUntilExpiry <= 7 && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 text-orange-700">
                <Pill className="w-4 h-4" />
                <span className="font-medium">处方即将到期（剩{daysUntilExpiry}天）</span>
              </div>
              <p className="text-xs text-orange-600 mt-1">{validRx.drugName}</p>
            </div>
          )}

          {patientAllergies.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-slate-500 mb-2">过敏禁忌：</p>
              <div className="flex flex-wrap gap-1">
                {patientAllergies.map((a) => (
                  <Badge key={a.id} variant={a.severity === 'severe' ? 'danger' : 'warning'}>
                    {a.drugName}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {latestFeedback && (
            <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">最近反馈：</p>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">
                  疗效 {'★'.repeat(latestFeedback.efficacyRating)}{'☆'.repeat(5 - latestFeedback.efficacyRating)}
                </span>
                <Badge variant={latestFeedback.compliance === 'good' ? 'success' : latestFeedback.compliance === 'moderate' ? 'warning' : 'danger'}>
                  {latestFeedback.compliance === 'good' ? '依从好' : latestFeedback.compliance === 'moderate' ? '依从一般' : '依从差'}
                </Badge>
              </div>
              {latestFeedback.adverseReaction && latestFeedback.adverseReaction !== '无' && (
                <p className="text-xs text-amber-600 mt-1">不良反应：{latestFeedback.adverseReaction}</p>
              )}
              <p className="text-xs text-slate-400 mt-1">
                {new Date(latestFeedback.submittedAt).toLocaleDateString('zh-CN')}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Phone className="w-4 h-4" />
              {patient.phone}
            </div>
            <Link
              to="/manager/supervision"
              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              督办记录 →
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">重点关注</h2>
          <p className="text-slate-500 mt-1">高风险患者名单，需重点跟进</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg border border-red-200">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="font-semibold text-red-700">危重 {criticalPatients.length} 人</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-lg border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span className="font-semibold text-amber-700">关注 {attentionPatients.length} 人</span>
          </div>
        </div>
      </div>

      {criticalPatients.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-slate-800">危重患者（需立即跟进）</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {criticalPatients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        </div>
      )}

      {attentionPatients.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-slate-800">关注患者（需定期跟进）</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {attentionPatients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        </div>
      )}

      {criticalPatients.length === 0 && attentionPatients.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-green-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800">暂无重点关注患者</h3>
          <p className="text-slate-500 mt-2">所有患者风险等级均为普通，继续保持良好的随访管理</p>
        </div>
      )}

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-5">
        <h3 className="font-semibold text-indigo-800 mb-2">重点跟进标准</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-indigo-700">危重患者</p>
              <p className="text-indigo-600 text-xs">连续2次及以上未反馈自动升级</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-indigo-700">关注患者</p>
              <p className="text-indigo-600 text-xs">连续1次未反馈或慢病指标异常</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-indigo-700">降级规则</p>
              <p className="text-indigo-600 text-xs">连续3次按时反馈可考虑降级</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
