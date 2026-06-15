import { useStore } from '@/hooks/useStore';
import Badge from '@/components/shared/Badge';
import { Users, Pill, Send, TrendingUp } from 'lucide-react';

const riskColors = {
  normal: 'bg-green-100 text-green-700 border-green-200',
  attention: 'bg-amber-100 text-amber-700 border-amber-200',
  critical: 'bg-red-100 text-red-700 border-red-200',
};

const diseaseColors: Record<string, string> = {
  糖尿病: 'from-blue-400 to-blue-600',
  高血压: 'from-rose-400 to-rose-600',
  冠心病: 'from-purple-400 to-purple-600',
  慢阻肺: 'from-teal-400 to-teal-600',
  哮喘: 'from-orange-400 to-orange-600',
};

export default function PharmacistGroups() {
  const { groups, patients, plans, batchRemind } = useStore();

  const handleBatchRemind = (groupId: string) => {
    const confirm = window.confirm('确认向该分组所有活跃患者发送批量提醒？');
    if (confirm) {
      batchRemind([groupId]);
      alert('批量提醒已发送！');
    }
  };

  const handleBatchRemindAll = () => {
    const confirm = window.confirm('确认向所有重点分组发送批量提醒？');
    if (confirm) {
      const focusGroupIds = groups.filter((g) => g.riskLevel !== 'normal').map((g) => g.id);
      batchRemind(focusGroupIds);
      alert('批量提醒已发送到所有重点分组！');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">分组管理</h2>
          <p className="text-slate-500 mt-1">按疾病类型和风险等级对患者进行分组管理</p>
        </div>
        <button
          onClick={handleBatchRemindAll}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Send className="w-4 h-4" />
          批量提醒重点组
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => {
          const groupPatients = patients.filter((p) => p.groupId === group.id);
          const activePatients = groupPatients.filter((p) => p.status === 'active');
          const groupPlans = plans.filter((p) => p.groupId === group.id && p.status === 'active');
          const criticalPatients = activePatients.filter((p) => p.consecutiveMissedFeedback >= 2);
          const noPrivacyPatients = groupPatients.filter((p) => !p.privacyAuthorized);
          const stoppedPatients = groupPatients.filter((p) => p.status === 'stopped');

          return (
            <div
              key={group.id}
              className={`bg-white rounded-xl border-2 ${riskColors[group.riskLevel]} overflow-hidden`}
            >
              <div className={`p-5 bg-gradient-to-r ${diseaseColors[group.diseaseType] || 'from-slate-400 to-slate-600'} text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{group.name}</h3>
                    <p className="text-white/80 text-sm">{group.diseaseType}</p>
                  </div>
                  <div className="bg-white/20 rounded-lg px-3 py-1.5">
                    <span className="text-sm font-medium">{activePatients.length} 位活跃</span>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-800">{groupPatients.length}</p>
                    <p className="text-xs text-slate-500">总患者数</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-indigo-600">{groupPlans.length}</p>
                    <p className="text-xs text-slate-500">活跃计划</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{criticalPatients.length}</p>
                    <p className="text-xs text-slate-500">需重点关注</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {noPrivacyPatients.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                      <Users className="w-4 h-4" />
                      {noPrivacyPatients.length} 位患者未授权隐私
                    </div>
                  )}
                  {stoppedPatients.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                      <Pill className="w-4 h-4" />
                      {stoppedPatients.length} 位患者已停药
                    </div>
                  )}
                </div>

                {activePatients.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      重点关注患者
                    </p>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {criticalPatients.slice(0, 4).map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between px-3 py-2 bg-red-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                              {p.name.slice(0, 1)}
                            </div>
                            <span className="text-sm text-red-800">{p.name}</span>
                          </div>
                          <span className="text-xs text-red-600">
                            连续{p.consecutiveMissedFeedback}次未反馈
                          </span>
                        </div>
                      ))}
                      {criticalPatients.length === 0 && (
                        <p className="text-sm text-slate-500 text-center py-2">暂无重点关注患者</p>
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleBatchRemind(group.id)}
                  disabled={activePatients.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  发送批量提醒
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">分组患者明细</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-sm text-slate-600">
              <tr>
                <th className="text-left px-5 py-3 font-medium">分组</th>
                <th className="text-left px-5 py-3 font-medium">患者</th>
                <th className="text-left px-5 py-3 font-medium">疾病</th>
                <th className="text-left px-5 py-3 font-medium">风险等级</th>
                <th className="text-left px-5 py-3 font-medium">状态</th>
                <th className="text-left px-5 py-3 font-medium">隐私授权</th>
                <th className="text-left px-5 py-3 font-medium">未反馈次数</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.map((patient) => {
                const group = groups.find((g) => g.id === patient.groupId);
                return (
                  <tr key={patient.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <Badge className="bg-slate-100 text-slate-700">{group?.name}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-xs flex items-center justify-center">
                          {patient.name.slice(0, 1)}
                        </div>
                        <span className="font-medium text-slate-800">{patient.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{patient.chronicDisease}</td>
                    <td className="px-5 py-3">
                      <Badge className={riskColors[patient.riskLevel]}>
                        {patient.riskLevel === 'normal' ? '普通' : patient.riskLevel === 'attention' ? '关注' : '重点'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        className={
                          patient.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : patient.status === 'stopped'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-slate-200 text-slate-600'
                        }
                      >
                        {patient.status === 'active' ? '活跃' : patient.status === 'stopped' ? '停药' : '归档'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        className={
                          patient.privacyAuthorized
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }
                      >
                        {patient.privacyAuthorized ? '已授权' : '未授权'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={
                          patient.consecutiveMissedFeedback >= 2
                            ? 'text-red-600 font-medium'
                            : patient.consecutiveMissedFeedback === 1
                            ? 'text-amber-600'
                            : 'text-green-600'
                        }
                      >
                        {patient.consecutiveMissedFeedback}次
                      </span>
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
