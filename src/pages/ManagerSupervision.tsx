import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import Badge from '@/components/shared/Badge';
import { Clock, User, Phone, FileText, Filter, Search, CheckCircle, Calendar } from 'lucide-react';

const supervisionStatusLabels: Record<string, string> = {
  pending: '待处理',
  contacted: '已联系',
  appointing: '已预约',
  escalated: '已升级',
};

const supervisionStatusBadge: Record<string, 'danger' | 'warning' | 'info' | 'default'> = {
  pending: 'danger',
  contacted: 'warning',
  appointing: 'info',
  escalated: 'default',
};

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

export default function ManagerSupervision() {
  const { patients, overdueRecords, trails, superviseOverdue } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const supervisedRecords = overdueRecords.filter((r) => r.supervisor !== undefined);

  const getPatient = (patientId: string) => patients.find((p) => p.id === patientId);

  const filteredRecords = supervisedRecords.filter((record) => {
    const patient = getPatient(record.patientId);
    if (!patient) return false;
    if (filterStatus !== 'all' && record.supervisionStatus !== filterStatus) return false;
    if (searchQuery && !patient.name.includes(searchQuery) && !record.supervisor?.includes(searchQuery)) return false;
    return true;
  });

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    if (a.supervisedAt && b.supervisedAt) {
      return new Date(b.supervisedAt).getTime() - new Date(a.supervisedAt).getTime();
    }
    return 0;
  });

  const getPatientTrails = (patientId: string) => {
    return trails
      .filter((t) => t.patientId === patientId)
      .filter((t) => t.type === 'overdue_escalated' || t.type === 'prescription_expired' || t.type === 'revisit_suggested')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  };

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const selectedPatient = selectedPatientId ? getPatient(selectedPatientId) : null;
  const selectedPatientTrails = selectedPatientId ? getPatientTrails(selectedPatientId) : [];

  const contactedCount = supervisedRecords.filter((r) => r.supervisionStatus === 'contacted').length;
  const appointingCount = supervisedRecords.filter((r) => r.supervisionStatus === 'appointing').length;
  const escalatedCount = supervisedRecords.filter((r) => r.supervisionStatus === 'escalated').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">督办记录</h2>
          <p className="text-slate-500 mt-1">查看所有逾期患者的督办处理历史</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">已督办总数</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{supervisedRecords.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">已联系</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">{contactedCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">已预约复诊</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{appointingCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">已升级处理</p>
          <p className="text-3xl font-bold text-purple-600 mt-1">{escalatedCount}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索患者姓名或督办人..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        >
          <option value="all">全部状态</option>
          <option value="contacted">已联系</option>
          <option value="appointing">已预约</option>
          <option value="escalated">已升级</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800">督办列表</h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {sortedRecords.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-3" />
                <p>暂无督办记录</p>
              </div>
            ) : (
              sortedRecords.map((record) => {
                const patient = getPatient(record.patientId);
                if (!patient) return null;

                return (
                  <div
                    key={record.id}
                    onClick={() => setSelectedPatientId(patient.id)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedPatientId === patient.id
                        ? 'bg-indigo-50 border-l-4 border-indigo-500'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                          <span className="font-semibold text-slate-600">{patient.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-800">{patient.name}</span>
                            <Badge variant={supervisionStatusBadge[record.supervisionStatus]}>
                              {supervisionStatusLabels[record.supervisionStatus]}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {patient.chronicDisease} · 逾期 {record.overdueDays} 天
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600 font-medium">{record.supervisor}</p>
                        {record.supervisedAt && (
                          <p className="text-xs text-slate-400">
                            {new Date(record.supervisedAt).toLocaleString('zh-CN')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800">患者详情</h3>
          </div>
          <div className="p-4 max-h-[600px] overflow-y-auto">
            {selectedPatient ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-4 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-xl font-bold">{selectedPatient.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{selectedPatient.name}</h4>
                      <p className="text-white/80 text-sm">
                        {selectedPatient.chronicDisease} · {selectedPatient.age}岁
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-white/90 text-sm">
                    <Phone className="w-4 h-4" />
                    {selectedPatient.phone}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-500">风险等级</p>
                    <p className={`font-bold ${
                      selectedPatient.riskLevel === 'critical' ? 'text-red-600' :
                      selectedPatient.riskLevel === 'attention' ? 'text-amber-600' : 'text-green-600'
                    }`}>
                      {selectedPatient.riskLevel === 'critical' ? '重点' :
                       selectedPatient.riskLevel === 'attention' ? '关注' : '普通'}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-500">连续未反馈</p>
                    <p className="font-bold text-amber-600">{selectedPatient.consecutiveMissedFeedback} 次</p>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    相关业务轨迹
                  </h5>
                  <div className="space-y-2">
                    {selectedPatientTrails.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-4">暂无相关轨迹</p>
                    ) : (
                      selectedPatientTrails.map((trail) => (
                        <div key={trail.id} className="bg-slate-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="info">{trailTypeLabels[trail.type] || trail.type}</Badge>
                            <span className="text-xs text-slate-400">
                              {new Date(trail.timestamp).toLocaleDateString('zh-CN')}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">{trail.description}</p>
                          <p className="text-xs text-slate-400 mt-1">操作人：{trail.operator}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <h5 className="font-medium text-slate-700 mb-2">督办时间线</h5>
                  <div className="relative pl-4">
                    <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                    {sortedRecords
                      .filter((r) => r.patientId === selectedPatient.id)
                      .map((record, index) => (
                        <div key={record.id} className="relative pb-4 last:pb-0">
                          <div className={`absolute left-[-4px] w-3 h-3 rounded-full border-2 border-white ${
                            index === 0 ? 'bg-indigo-500' : 'bg-slate-300'
                          }`}></div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant={supervisionStatusBadge[record.supervisionStatus]}>
                                {supervisionStatusLabels[record.supervisionStatus]}
                              </Badge>
                              <span className="text-xs text-slate-500">
                                督办人：{record.supervisor}
                              </span>
                            </div>
                            {record.supervisedAt && (
                              <p className="text-xs text-slate-400 mt-1">
                                {new Date(record.supervisedAt).toLocaleString('zh-CN')}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                <User className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p>请选择一位患者查看详情</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
