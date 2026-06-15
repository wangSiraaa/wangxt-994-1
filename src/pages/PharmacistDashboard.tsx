import { useStore } from '@/hooks/useStore';
import StatCard from '@/components/shared/StatCard';
import Badge from '@/components/shared/Badge';
import { AlertTriangle, Users, Pill, Clock, TrendingUp, Bell, Send, UserPlus } from 'lucide-react';
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

export default function PharmacistDashboard() {
  const { patients, plans, overdueRecords, prescriptions, trails, restockAlerts, batchRemind, groups } = useStore();

  const activePatients = patients.filter((p) => p.status === 'active');
  const criticalPatients = patients.filter((p) => p.riskLevel === 'critical' && p.status === 'active');
  const activePlans = plans.filter((p) => p.status === 'active');
  const expiringPrescriptions = prescriptions.filter(
    (p) => p.status === 'valid' && new Date(p.expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const pendingRestock = restockAlerts.filter((r) => r.status === 'pending');
  const recentTrails = [...trails].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8);

  const handleBatchRemind = () => {
    const focusGroups = groups.filter((g) => g.riskLevel === 'attention' || g.riskLevel === 'critical');
    if (focusGroups.length > 0) {
      batchRemind(focusGroups.map((g) => g.id));
      alert(`已向${focusGroups.length}个重点分组发送批量提醒！`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">药师工作台</h2>
          <p className="text-slate-500 mt-1">管理随访计划、跟进重点患者、处理异常情况</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleBatchRemind}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Send className="w-4 h-4" />
            批量提醒重点组
          </button>
          <Link
            to="/pharmacist/plans"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
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
          title="重点关注"
          value={criticalPatients.length}
          icon={<TrendingUp className="w-5 h-5" />}
          trend="需每日跟进"
          trendIcon={<Bell className="w-4 h-4" />}
          trendColor="text-rose-600"
        />
        <StatCard
          title="处方即将过期"
          value={expiringPrescriptions.length}
          icon={<Clock className="w-5 h-5" />}
          trend="7天内到期"
          trendIcon={<AlertTriangle className="w-4 h-4" />}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">重点关注患者</h3>
            <Link to="/pharmacist/patients" className="text-sm text-indigo-600 hover:text-indigo-700">
              查看全部 →
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {criticalPatients.slice(0, 5).map((patient) => {
              const patientPlan = plans.find((p) => p.patientId === patient.id && p.status === 'active');
              const patientRx = prescriptions.find(
                (r) => r.patientId === patient.id && r.status === 'valid'
              );
              const isExpired = !patientRx;
              return (
                <div key={patient.id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center text-white font-medium">
                        {patient.name.slice(0, 1)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800">{patient.name}</span>
                          <Badge className={riskColors[patient.riskLevel]}>
                            {riskLabels[patient.riskLevel]}
                          </Badge>
                          <Badge className={statusColors[patient.status]}>
                            {statusLabels[patient.status]}
                          </Badge>
                          {isExpired && (
                            <Badge className="bg-red-100 text-red-700">处方已过期</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {patient.chronicDisease} · {patient.age}岁 · 连续{patient.consecutiveMissedFeedback}次未反馈
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {patientPlan && (
                        <p className="text-sm text-slate-600">
                          下次随访：{patientPlan.nextFollowupDate}
                        </p>
                      )}
                      {patientRx && (
                        <p className="text-sm text-slate-500 mt-0.5">
                          用药：{patientRx.drugName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800">最近业务轨迹</h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {recentTrails.map((trail) => (
              <div key={trail.id} className="px-5 py-3">
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

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">即将到期处方（7天内）</h3>
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
                <th className="text-left px-5 py-3 font-medium">状态</th>
                <th className="text-right px-5 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expiringPrescriptions.slice(0, 5).map((rx) => {
                const patient = patients.find((p) => p.id === rx.patientId);
                const daysLeft = Math.ceil(
                  (new Date(rx.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <tr key={rx.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-slate-800">{patient?.name}</td>
                    <td className="px-5 py-4 text-slate-600">{rx.drugName}</td>
                    <td className="px-5 py-4 text-slate-600">{rx.dosage} {rx.frequency}</td>
                    <td className="px-5 py-4">
                      <span className={daysLeft <= 0 ? 'text-red-600 font-medium' : 'text-amber-600'}>
                        {rx.expiryDate}
                        {daysLeft > 0 && <span className="ml-2">({daysLeft}天后)</span>}
                        {daysLeft <= 0 && <span className="ml-2">(已过期)</span>}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Badge className={rx.status === 'valid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {rx.status === 'valid' ? '有效' : '已过期'}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                        发起复诊
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
