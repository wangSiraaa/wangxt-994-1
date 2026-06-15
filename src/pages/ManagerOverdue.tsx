import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import Badge from '@/components/shared/Badge';
import Modal from '@/components/shared/Modal';
import { Clock, Phone, User, Calendar, AlertTriangle, CheckCircle, ArrowUpRight, Filter, Search } from 'lucide-react';

const riskLabels = {
  normal: '普通',
  attention: '关注',
  critical: '重点',
};

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

export default function ManagerOverdue() {
  const { patients, plans, prescriptions, feedbacks, overdueRecords, superviseOverdue } = useStore();
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);
  const [showSuperviseModal, setShowSuperviseModal] = useState(false);
  const [supervisorName, setSupervisorName] = useState('店长');
  const [newStatus, setNewStatus] = useState<'contacted' | 'appointing' | 'escalated'>('contacted');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getPatient = (patientId: string) => patients.find((p) => p.id === patientId);
  const getPlan = (planId: string) => plans.find((p) => p.id === planId);
  const getLatestFeedback = (patientId: string) => {
    return feedbacks
      .filter((f) => f.patientId === patientId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];
  };

  const filteredRecords = overdueRecords.filter((record) => {
    const patient = getPatient(record.patientId);
    if (!patient) return false;
    if (filterStatus !== 'all' && record.supervisionStatus !== filterStatus) return false;
    if (searchQuery && !patient.name.includes(searchQuery)) return false;
    return true;
  });

  const sortedRecords = [...filteredRecords].sort((a, b) => b.overdueDays - a.overdueDays);

  const pendingCount = overdueRecords.filter((r) => r.supervisionStatus === 'pending').length;
  const contactedCount = overdueRecords.filter((r) => r.supervisionStatus === 'contacted').length;
  const appointingCount = overdueRecords.filter((r) => r.supervisionStatus === 'appointing').length;
  const escalatedCount = overdueRecords.filter((r) => r.supervisionStatus === 'escalated').length;

  const handleSupervise = () => {
    if (!selectedRecord) return;
    superviseOverdue(selectedRecord, newStatus, supervisorName);
    setShowSuperviseModal(false);
    setSelectedRecord(null);
    setSupervisorName('店长');
    setNewStatus('contacted');
  };

  const openSuperviseModal = (recordId: string) => {
    setSelectedRecord(recordId);
    setShowSuperviseModal(true);
  };

  const selectedRecordData = selectedRecord ? overdueRecords.find((r) => r.id === selectedRecord) : null;
  const selectedPatient = selectedRecordData ? getPatient(selectedRecordData.patientId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">逾期名单</h2>
          <p className="text-slate-500 mt-1">查看所有逾期未反馈的患者，进行督办处理</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setFilterStatus('all')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filterStatus === 'all'
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <p className="text-sm text-slate-500">全部逾期</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{overdueRecords.length}</p>
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filterStatus === 'pending'
              ? 'border-red-500 bg-red-50'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <p className="text-sm text-slate-500">待处理</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{pendingCount}</p>
        </button>
        <button
          onClick={() => setFilterStatus('contacted')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filterStatus === 'contacted'
              ? 'border-amber-500 bg-amber-50'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <p className="text-sm text-slate-500">已联系</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{contactedCount}</p>
        </button>
        <button
          onClick={() => setFilterStatus('escalated')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filterStatus === 'escalated'
              ? 'border-purple-500 bg-purple-50'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <p className="text-sm text-slate-500">已升级</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{escalatedCount}</p>
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索患者姓名..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-medium text-slate-500 uppercase">患者信息</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-slate-500 uppercase">风险等级</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-slate-500 uppercase">逾期天数</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-slate-500 uppercase">上次反馈</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-slate-500 uppercase">处方状态</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-slate-500 uppercase">督办状态</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-slate-500 uppercase">督办人</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-slate-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-3" />
                    <p>暂无逾期记录</p>
                  </td>
                </tr>
              ) : (
                sortedRecords.map((record) => {
                  const patient = getPatient(record.patientId);
                  const plan = getPlan(record.planId);
                  const latestFeedback = getLatestFeedback(record.patientId);
                  const patientRx = prescriptions.find(
                    (r) => r.patientId === record.patientId && r.status === 'valid'
                  );
                  const expiredRx = prescriptions.find(
                    (r) => r.patientId === record.patientId && r.status === 'expired'
                  );

                  if (!patient) return null;

                  return (
                    <tr key={record.id} className={`hover:bg-slate-50 ${
                      record.overdueDays >= 7 ? 'bg-red-50/50' : ''
                    }`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            patient.riskLevel === 'critical' ? 'bg-red-100' :
                            patient.riskLevel === 'attention' ? 'bg-amber-100' : 'bg-green-100'
                          }`}>
                            <span className={`font-semibold ${
                              patient.riskLevel === 'critical' ? 'text-red-600' :
                              patient.riskLevel === 'attention' ? 'text-amber-600' : 'text-green-600'
                            }`}>
                              {patient.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{patient.name}</p>
                            <p className="text-xs text-slate-500">{patient.chronicDisease} · {patient.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={patient.riskLevel === 'critical' ? 'danger' : patient.riskLevel === 'attention' ? 'warning' : 'success'}>
                          {riskLabels[patient.riskLevel]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Clock className={`w-4 h-4 ${
                            record.overdueDays >= 7 ? 'text-red-500' : 'text-amber-500'
                          }`} />
                          <span className={`font-semibold ${
                            record.overdueDays >= 7 ? 'text-red-600' : 'text-amber-600'
                          }`}>
                            {record.overdueDays} 天
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {latestFeedback ? (
                          <div>
                            <p className="text-sm text-slate-600">
                              {new Date(latestFeedback.submittedAt).toLocaleDateString('zh-CN')}
                            </p>
                            <p className="text-xs text-slate-500">
                              疗效：{latestFeedback.efficacyRating}分 · {latestFeedback.compliance === 'good' ? '依从好' : latestFeedback.compliance === 'moderate' ? '依从一般' : '依从差'}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400">暂无反馈</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {expiredRx ? (
                          <div>
                            <Badge variant="danger">处方已过期</Badge>
                            <p className="text-xs text-red-500 mt-1">{expiredRx.drugName}</p>
                          </div>
                        ) : patientRx ? (
                          <div>
                            <Badge variant="success">有效</Badge>
                            <p className="text-xs text-slate-500 mt-1">{patientRx.drugName}</p>
                          </div>
                        ) : (
                          <Badge variant="danger">无有效处方</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={supervisionStatusBadge[record.supervisionStatus]}>
                          {supervisionStatusLabels[record.supervisionStatus]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {record.supervisor ? (
                          <span className="text-sm text-slate-600">{record.supervisor}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openSuperviseModal(record.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                          督办
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        show={showSuperviseModal}
        onClose={() => {
          setShowSuperviseModal(false);
          setSelectedRecord(null);
          setSupervisorName('店长');
          setNewStatus('contacted');
        }}
        title="督办处理"
      >
        {selectedPatient && selectedRecordData && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selectedPatient.riskLevel === 'critical' ? 'bg-red-100' :
                  selectedPatient.riskLevel === 'attention' ? 'bg-amber-100' : 'bg-green-100'
                }`}>
                  <span className={`text-xl font-semibold ${
                    selectedPatient.riskLevel === 'critical' ? 'text-red-600' :
                    selectedPatient.riskLevel === 'attention' ? 'text-amber-600' : 'text-green-600'
                  }`}>
                    {selectedPatient.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">{selectedPatient.name}</h4>
                  <p className="text-sm text-slate-500">
                    {selectedPatient.chronicDisease} · 逾期 {selectedRecordData.overdueDays} 天
                  </p>
                  <p className="text-sm text-slate-500">{selectedPatient.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1 text-slate-600">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  连续{selectedPatient.consecutiveMissedFeedback}次未反馈
                </div>
                <div className="flex items-center gap-1 text-slate-600">
                  <Badge variant={selectedPatient.riskLevel === 'critical' ? 'danger' : selectedPatient.riskLevel === 'attention' ? 'warning' : 'success'}>
                    {riskLabels[selectedPatient.riskLevel]}风险
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                督办状态
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setNewStatus('contacted')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    newStatus === 'contacted'
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Phone className="w-5 h-5 mx-auto mb-1" />
                  <p className="text-sm font-medium">已联系</p>
                </button>
                <button
                  type="button"
                  onClick={() => setNewStatus('appointing')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    newStatus === 'appointing'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Calendar className="w-5 h-5 mx-auto mb-1" />
                  <p className="text-sm font-medium">已预约</p>
                </button>
                <button
                  type="button"
                  onClick={() => setNewStatus('escalated')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    newStatus === 'escalated'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <ArrowUpRight className="w-5 h-5 mx-auto mb-1" />
                  <p className="text-sm font-medium">已升级</p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                督办人
              </label>
              <input
                type="text"
                value={supervisorName}
                onChange={(e) => setSupervisorName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowSuperviseModal(false);
                  setSelectedRecord(null);
                  setSupervisorName('店长');
                  setNewStatus('contacted');
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSupervise}
                disabled={!supervisorName.trim()}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认督办
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
