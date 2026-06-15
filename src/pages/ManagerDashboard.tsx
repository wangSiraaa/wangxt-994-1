import { useStore } from '@/hooks/useStore';
import Badge from '@/components/shared/Badge';
import { Users, AlertTriangle, Clock, Pill, TrendingUp, CheckCircle, XCircle, Eye, Phone, Calendar, ArrowRight } from 'lucide-react';
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

export default function ManagerDashboard() {
  const { patients, plans, overdueRecords, prescriptions, trails, restockAlerts, revisitSuggestions, checkPrescriptionExpiry } = useStore();

  const activePatients = patients.filter((p) => p.status === 'active');
  const criticalPatients = patients.filter((p) => p.riskLevel === 'critical' && p.status === 'active');
  const stoppedPatients = patients.filter((p) => p.status === 'stopped');
  const activePlans = plans.filter((p) => p.status === 'active');
  const pendingOverdue = overdueRecords.filter((r) => r.supervisionStatus === 'pending');
  const expiringPrescriptions = prescriptions.filter(
    (p) => p.status === 'valid' && new Date(p.expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const expiredPrescriptions = prescriptions.filter((p) => p.status === 'expired');
  const pendingRestock = restockAlerts.filter((r) => r.status === 'pending');
  const pendingRevisit = revisitSuggestions.filter((s) => s.status === 'pending');

  const revisitPatientIds = new Set(pendingRevisit.map((s) => s.patientId));
  const revisitNeededPatients = patients.filter(
    (p) => revisitPatientIds.has(p.id) && p.status === 'active'
  );
  const criticalWithoutRevisit = criticalPatients.filter((p) => !revisitPatientIds.has(p.id));
  const recentTrails = [...trails].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

  const today = new Date().toISOString().slice(0, 10);

  const getOverdueForPatient = (patientId: string) => {
    return overdueRecords.filter((r) => r.patientId === patientId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">店长督办工作台</h2>
          <p className="text-slate-500 mt-1">总览随访情况、督办逾期患者、处理异常事项</p>
        </div>
        <button
          onClick={checkPrescriptionExpiry}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          <AlertTriangle className="w-4 h-4" />
          扫描处方过期
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">活跃患者</p>
              <p className="text-3xl font-bold mt-1">{activePatients.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-white/70 text-xs mt-3">总患者 {patients.length} 人</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">重点关注</p>
              <p className="text-3xl font-bold mt-1">{criticalPatients.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-white/70 text-xs mt-3">需立即跟进</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">待督办逾期</p>
              <p className="text-3xl font-bold mt-1">{pendingOverdue.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-white/70 text-xs mt-3">总逾期 {overdueRecords.length} 条</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">处方过期</p>
              <p className="text-3xl font-bold mt-1">{expiredPrescriptions.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
              <Pill className="w-6 h-6" />
            </div>
          </div>
          <p className="text-white/70 text-xs mt-3">7天内到期 {expiringPrescriptions.length} 张</p>
        </div>
      </div>

      {(pendingRestock.length > 0 || pendingRevisit.length > 0) && (
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
                      <Badge key={alert.id} variant="warning">
                        {alert.drugName}（剩{alert.currentStock}盒）
                      </Badge>
                    ))}
                    {pendingRestock.length > 3 && (
                      <span className="text-xs text-orange-600">等{pendingRestock.length}种</span>
                    )}
                  </div>
                  <Link to="/pharmacist/restock" className="text-sm text-orange-600 hover:text-orange-700 mt-2 inline-flex items-center gap-1">
                    查看详情 <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {pendingRevisit.length > 0 && (
            <div className="bg-red-50 border border-red-300 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800">需复诊续方（处方过期拦截）</h3>
                  <p className="text-sm text-red-700 mt-1">
                    有 {revisitNeededPatients.length} 位患者处方已过期或被拦截，须先复诊续方，不可继续跟进随访
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {revisitNeededPatients.slice(0, 4).map((patient) => {
                      const suggestion = pendingRevisit.find((s) => s.patientId === patient.id);
                      return (
                        <div key={patient.id} className="bg-white border border-red-200 rounded-lg px-3 py-1.5 text-xs">
                          <span className="font-medium text-red-800">{patient.name}</span>
                          <span className="text-red-600 ml-1">({patient.chronicDisease})</span>
                          {suggestion && (
                            <p className="text-red-500 mt-0.5 max-w-[200px] truncate">{suggestion.reason}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <Link to="/pharmacist/revisit" className="text-sm text-red-600 hover:text-red-700 mt-2 inline-flex items-center gap-1">
                    管理复诊建议 <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">逾期督办名单</h3>
            <Link
              to="/manager/overdue"
              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              全部督办 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {overdueRecords.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-3" />
                <p>暂无逾期记录</p>
              </div>
            ) : (
              [...overdueRecords]
                .sort((a, b) => b.overdueDays - a.overdueDays)
                .slice(0, 5)
                .map((record) => {
                  const patient = patients.find((p) => p.id === record.patientId);
                  if (!patient) return null;
                  return (
                    <div key={record.id} className="p-4 hover:bg-slate-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            record.overdueDays >= 7 ? 'bg-red-100' : 'bg-amber-100'
                          }`}>
                            <span className={`font-semibold ${
                              record.overdueDays >= 7 ? 'text-red-600' : 'text-amber-600'
                            }`}>
                              {patient.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-800">{patient.name}</span>
                              <Badge variant={patient.riskLevel === 'critical' ? 'danger' : patient.riskLevel === 'attention' ? 'warning' : 'success'}>
                                {riskLabels[patient.riskLevel]}
                              </Badge>
                              <Badge variant={
                                record.supervisionStatus === 'pending' ? 'danger' :
                                record.supervisionStatus === 'contacted' ? 'warning' :
                                record.supervisionStatus === 'appointing' ? 'info' : 'default'
                              }>
                                {supervisionStatusLabels[record.supervisionStatus]}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                              {patient.chronicDisease} · 逾期 {record.overdueDays} 天
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {record.supervisor && (
                            <span className="text-xs text-slate-500">
                              督办人：{record.supervisor}
                            </span>
                          )}
                          <Link
                            to="/manager/supervision"
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">重点关注患者</h3>
            <Link
              to="/manager/focus"
              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              全部 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {revisitNeededPatients.length > 0 && (
              <div className="bg-red-50/50">
                <div className="px-4 pt-3 pb-1">
                  <p className="text-xs font-semibold text-red-700 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    需复诊续方（不可继续跟进）
                  </p>
                </div>
                {revisitNeededPatients.map((patient) => {
                  const suggestion = pendingRevisit.find((s) => s.patientId === patient.id);
                  return (
                    <div key={`revisit-${patient.id}`} className="px-4 py-3 hover:bg-red-50">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-red-800">{patient.name}</span>
                          <Badge variant="danger">需复诊</Badge>
                        </div>
                        <span className="text-xs text-red-600">{patient.chronicDisease}</span>
                      </div>
                      {suggestion && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <Pill className="w-3 h-3" />
                          {suggestion.reason}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {criticalWithoutRevisit.length === 0 && revisitNeededPatients.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-3" />
                <p>暂无重点关注患者</p>
              </div>
            ) : criticalWithoutRevisit.length > 0 ? (
              <>
                {revisitNeededPatients.length > 0 && (
                  <div className="px-4 pt-3 pb-1">
                    <p className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      需继续跟进（非处方过期）
                    </p>
                  </div>
                )}
                {criticalWithoutRevisit.map((patient) => {
                  const patientOverdue = getOverdueForPatient(patient.id);
                  const patientRx = prescriptions.find((r) => r.patientId === patient.id && r.status === 'valid');
                  return (
                    <div key={patient.id} className="p-4 hover:bg-slate-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800">{patient.name}</span>
                          <Badge variant="danger">重点</Badge>
                        </div>
                        <span className="text-xs text-slate-500">{patient.chronicDisease}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          连续{patient.consecutiveMissedFeedback}次未反馈
                        </span>
                        {patientOverdue.length > 0 && (
                          <span className="flex items-center gap-1 text-red-500">
                            <Clock className="w-3 h-3" />
                            逾期{patientOverdue[0].overdueDays}天
                          </span>
                        )}
                      </div>
                      {patientRx && (
                        <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                          <Pill className="w-3 h-3" />
                          {patientRx.drugName} 有效期至 {patientRx.expiryDate}
                        </p>
                      )}
                    </div>
                  );
                })}
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800">7天内到期处方</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">患者</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">药品</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">到期日期</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">剩余天数</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...expiringPrescriptions, ...expiredPrescriptions].slice(0, 5).map((rx) => {
                  const patient = patients.find((p) => p.id === rx.patientId);
                  const daysLeft = Math.ceil((new Date(rx.expiryDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={rx.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800">{patient?.name}</span>
                          {patient && (
                            <Badge variant={patient.riskLevel === 'critical' ? 'danger' : patient.riskLevel === 'attention' ? 'warning' : 'success'}>
                              {riskLabels[patient.riskLevel]}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{rx.drugName}</td>
                      <td className="px-4 py-3 text-slate-600">{rx.expiryDate}</td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${
                          daysLeft < 0 ? 'text-red-600' : daysLeft <= 3 ? 'text-amber-600' : 'text-green-600'
                        }`}>
                          {daysLeft < 0 ? `已过期 ${Math.abs(daysLeft)} 天` : `剩 ${daysLeft} 天`}
                        </span>
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

        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800">停药患者</h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {stoppedPatients.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-3" />
                <p>暂无停药患者</p>
              </div>
            ) : (
              stoppedPatients.map((patient) => (
                <div key={patient.id} className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-800">{patient.name}</span>
                    <Badge variant="default">已停药</Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    {patient.chronicDisease} · 停药于 {patient.stoppedAt}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{patient.phone}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">最近业务轨迹</h3>
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
                    <p className="text-xs text-slate-500 mt-1">
                      操作人：{trail.operator}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
