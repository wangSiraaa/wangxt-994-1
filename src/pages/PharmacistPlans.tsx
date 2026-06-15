import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import Badge from '@/components/shared/Badge';
import Modal from '@/components/shared/Modal';
import { Plus, Calendar, Pill, User, AlertTriangle, CheckCircle, Pause, Play, Archive } from 'lucide-react';

const statusColors = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  expired: 'bg-red-100 text-red-700',
  suspended: 'bg-amber-100 text-amber-700',
};

const statusLabels = {
  active: '进行中',
  completed: '已完成',
  expired: '已过期',
  suspended: '已暂停',
};

export default function PharmacistPlans() {
  const { plans, patients, groups, prescriptions, createPlan, setShowCreatePlanModal, showCreatePlanModal, stopMedication, archivePatient, selectedPatientId, setCurrentRole } = useStore();
  const [formData, setFormData] = useState({
    patientId: '',
    groupId: '',
    cycleDays: 14,
    prescriptionExpiryDate: '',
  });

  const handleCreatePlan = () => {
    if (!formData.patientId || !formData.groupId || !formData.prescriptionExpiryDate) {
      alert('请填写完整信息');
      return;
    }
    const result = createPlan(
      formData.patientId,
      formData.groupId,
      formData.cycleDays,
      formData.prescriptionExpiryDate
    );
    if (result) {
      alert('随访计划创建成功！');
      setShowCreatePlanModal(false);
      setFormData({ patientId: '', groupId: '', cycleDays: 14, prescriptionExpiryDate: '' });
    } else {
      alert('创建失败，请检查患者隐私授权、过敏禁忌等情况');
    }
  };

  const handleStopMedication = (patientId: string) => {
    const reason = prompt('请输入停药原因：');
    if (reason) {
      stopMedication(patientId, reason);
      alert('已执行停药处理，随访计划已暂停');
    }
  };

  const activePatients = patients.filter((p) => p.status === 'active' && p.privacyAuthorized);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">随访计划管理</h2>
          <p className="text-slate-500 mt-1">创建、管理和跟踪患者随访计划</p>
        </div>
        <button
          onClick={() => setShowCreatePlanModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建随访计划
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(statusLabels).map(([status, label]) => (
          <div key={status} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {plans.filter((p) => p.status === status).length}
                </p>
              </div>
              <Badge className={statusColors[status as keyof typeof statusColors]}>{label}</Badge>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-sm text-slate-600">
              <tr>
                <th className="text-left px-5 py-3 font-medium">患者信息</th>
                <th className="text-left px-5 py-3 font-medium">分组</th>
                <th className="text-left px-5 py-3 font-medium">随访周期</th>
                <th className="text-left px-5 py-3 font-medium">下次随访</th>
                <th className="text-left px-5 py-3 font-medium">处方到期</th>
                <th className="text-left px-5 py-3 font-medium">上次反馈</th>
                <th className="text-left px-5 py-3 font-medium">状态</th>
                <th className="text-right px-5 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plans.map((plan) => {
                const patient = patients.find((p) => p.id === plan.patientId);
                const group = groups.find((g) => g.id === plan.groupId);
                const rx = prescriptions.find(
                  (p) => p.patientId === plan.patientId && p.status === 'valid'
                );
                const isRxExpired = !rx;
                const isOverdue = new Date(plan.nextFollowupDate) < new Date() && plan.status === 'active';
                return (
                  <tr key={plan.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                          {patient?.name.slice(0, 1)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{patient?.name}</p>
                          <p className="text-xs text-slate-500">{patient?.chronicDisease}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{group?.name}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>每{plan.cycleDays}天</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'}>
                        {plan.nextFollowupDate}
                        {isOverdue && ' (已逾期)'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={isRxExpired ? 'text-red-600 font-medium' : 'text-slate-600'}>
                        {plan.prescriptionExpiryDate}
                        {isRxExpired && ' (已过期)'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {plan.lastFeedbackDate || '暂无反馈'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[plan.status]}>
                          {statusLabels[plan.status]}
                        </Badge>
                        {isRxExpired && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {plan.status === 'active' && (
                          <>
                            <button
                              onClick={() => setCurrentRole('patient')}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="代患者提交反馈"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStopMedication(plan.patientId)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="停药处理"
                            >
                              <Pause className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {plan.status === 'suspended' && (
                          <button
                            onClick={() => {
                              const p = patients.find((pat) => pat.id === plan.patientId);
                              if (p && p.status === 'stopped') {
                                alert('患者已停药，如需恢复请先恢复患者状态');
                              }
                            }}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="恢复计划"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => archivePatient(plan.patientId)}
                          className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                          title="归档"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={showCreatePlanModal}
        onClose={() => setShowCreatePlanModal(false)}
        title="新建随访计划"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <User className="w-4 h-4 inline mr-1" />
              选择患者
            </label>
            <select
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">请选择患者</option>
              {activePatients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - {p.chronicDisease} ({p.age}岁)
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              仅显示已授权隐私协议的活跃患者
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <Pill className="w-4 h-4 inline mr-1" />
              选择分组
            </label>
            <select
              value={formData.groupId}
              onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">请选择分组</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              随访周期（天）
            </label>
            <input
              type="number"
              min="1"
              max="90"
              value={formData.cycleDays}
              onChange={(e) => setFormData({ ...formData, cycleDays: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              建议：糖尿病/高血压7天，冠心病/慢阻肺14天
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              处方有效期至
            </label>
            <input
              type="date"
              value={formData.prescriptionExpiryDate}
              onChange={(e) => setFormData({ ...formData, prescriptionExpiryDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="text-xs text-amber-600 mt-1">
              处方过期后将自动暂停随访并提示复诊
            </p>
          </div>

          {formData.patientId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 font-medium">创建前检查：</p>
              <ul className="text-xs text-blue-700 mt-1 space-y-1">
                <li className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  患者隐私授权：
                  {patients.find((p) => p.id === formData.patientId)?.privacyAuthorized ? '已授权' : '未授权'}
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  过敏记录：
                  {prescriptions.filter((a) => a.patientId === formData.patientId).length > 0
                    ? `${prescriptions.filter((a) => a.patientId === formData.patientId).length}条记录，需核对处方`
                    : '无'}
                </li>
              </ul>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowCreatePlanModal(false)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleCreatePlan}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              创建计划
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
