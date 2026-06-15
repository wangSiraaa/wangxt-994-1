import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import Badge from '@/components/shared/Badge';
import Modal from '@/components/shared/Modal';
import Drawer from '@/components/shared/Drawer';
import { Search, User, Shield, AlertTriangle, Pause, Play, FileText, Eye, ShieldOff, ShieldCheck, Plus } from 'lucide-react';

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

export default function PharmacistPatients() {
  const {
    patients,
    plans,
    prescriptions,
    allergies,
    feedbacks,
    trails,
    groups,
    selectPatient,
    selectedPatientId,
    deselectPatient,
    togglePrivacy,
    stopMedication,
    archivePatient,
    addAllergy,
    setShowAllergyModal,
    showAllergyModal,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDrawer, setShowDrawer] = useState(false);
  const [allergyForm, setAllergyForm] = useState({
    drugName: '',
    severity: 'mild' as 'mild' | 'moderate' | 'severe',
    note: '',
  });

  const filteredPatients = patients.filter((p) => {
    const matchSearch = p.name.includes(searchTerm) || p.chronicDisease.includes(searchTerm);
    const matchRisk = riskFilter === 'all' || p.riskLevel === riskFilter;
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchRisk && matchStatus;
  });

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);
  const patientPlans = selectedPatient ? plans.filter((p) => p.patientId === selectedPatient.id) : [];
  const patientRx = selectedPatient ? prescriptions.filter((p) => p.patientId === selectedPatient.id) : [];
  const patientAllergies = selectedPatient ? allergies.filter((a) => a.patientId === selectedPatient.id) : [];
  const patientFeedbacks = selectedPatient ? feedbacks.filter((f) => f.patientId === selectedPatient.id) : [];
  const patientTrails = selectedPatient
    ? trails.filter((t) => t.patientId === selectedPatient.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    : [];

  const handleAddAllergy = () => {
    if (!selectedPatientId || !allergyForm.drugName) return;
    addAllergy(selectedPatientId, allergyForm.drugName, allergyForm.severity, allergyForm.note);
    setShowAllergyModal(false);
    setAllergyForm({ drugName: '', severity: 'mild', note: '' });
  };

  const handleStopMedication = () => {
    if (!selectedPatientId) return;
    const reason = prompt('请输入停药原因：');
    if (reason) {
      stopMedication(selectedPatientId, reason);
    }
  };

  const severityLabels = { mild: '轻度', moderate: '中度', severe: '严重' };
  const severityColors = {
    mild: 'bg-green-100 text-green-700',
    moderate: 'bg-amber-100 text-amber-700',
    severe: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">患者管理</h2>
          <p className="text-slate-500 mt-1">查看和管理所有慢病患者信息</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索患者姓名、疾病..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">全部风险等级</option>
              <option value="normal">普通</option>
              <option value="attention">关注</option>
              <option value="critical">重点</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">全部状态</option>
              <option value="active">活跃</option>
              <option value="stopped">停药</option>
              <option value="paused">暂停</option>
              <option value="archived">归档</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.map((patient) => {
          const patientGroup = groups.find((g) => g.id === patient.groupId);
          const hasActivePlan = plans.some((p) => p.patientId === patient.id && p.status === 'active');
          const hasValidRx = prescriptions.some((p) => p.patientId === patient.id && p.status === 'valid');
          return (
            <div
              key={patient.id}
              className={`bg-white rounded-xl border-2 p-5 transition-all cursor-pointer hover:shadow-lg ${
                selectedPatientId === patient.id
                  ? 'border-indigo-500 shadow-lg'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => {
                selectPatient(patient.id);
                setShowDrawer(true);
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
                    {patient.name.slice(0, 1)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{patient.name}</h3>
                    <p className="text-sm text-slate-500">
                      {patient.gender === '男' ? '先生' : '女士'} · {patient.age}岁
                    </p>
                  </div>
                </div>
                <Badge className={riskColors[patient.riskLevel]}>
                  {riskLabels[patient.riskLevel]}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{patient.chronicDisease}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span className={patient.privacyAuthorized ? 'text-green-600' : 'text-red-600'}>
                    {patient.privacyAuthorized ? '已授权隐私协议' : '未授权隐私协议'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge className={statusColors[patient.status]}>
                    {statusLabels[patient.status]}
                  </Badge>
                  {patientGroup && (
                    <span className="text-xs text-slate-500">{patientGroup.name}</span>
                  )}
                </div>
              </div>

              {patient.consecutiveMissedFeedback >= 2 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg text-sm text-red-700 mb-3">
                  <AlertTriangle className="w-4 h-4" />
                  连续{patient.consecutiveMissedFeedback}次未反馈
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex gap-2">
                  {!hasValidRx && patient.status === 'active' && (
                    <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">
                      处方已过期
                    </span>
                  )}
                  {!hasActivePlan && patient.status === 'active' && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                      无活跃计划
                    </span>
                  )}
                </div>
                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  查看详情 →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Drawer
        open={showDrawer}
        onClose={() => {
          setShowDrawer(false);
          deselectPatient();
        }}
        title="患者详情"
      >
        {selectedPatient && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                {selectedPatient.name.slice(0, 1)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">{selectedPatient.name}</h3>
                <p className="text-slate-500">
                  {selectedPatient.gender === '男' ? '男' : '女'} · {selectedPatient.age}岁 ·{' '}
                  {selectedPatient.phone}
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge className={riskColors[selectedPatient.riskLevel]}>
                    {riskLabels[selectedPatient.riskLevel]}
                  </Badge>
                  <Badge className={statusColors[selectedPatient.status]}>
                    {statusLabels[selectedPatient.status]}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => togglePrivacy(selectedPatient.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  selectedPatient.privacyAuthorized
                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                {selectedPatient.privacyAuthorized ? (
                  <><ShieldCheck className="w-4 h-4" /> 隐私已授权</>
                ) : (
                  <><ShieldOff className="w-4 h-4" /> 隐私未授权</>
                )}
              </button>
              {selectedPatient.status === 'active' && (
                <button
                  onClick={handleStopMedication}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  <Pause className="w-4 h-4" /> 停药
                </button>
              )}
              <button
                onClick={() => archivePatient(selectedPatient.id)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <FileText className="w-4 h-4" /> 归档
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600">慢病类型</p>
                <p className="text-lg font-semibold text-blue-900 mt-1">
                  {selectedPatient.chronicDisease}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600">连续未反馈</p>
                <p className="text-lg font-semibold text-purple-900 mt-1">
                  {selectedPatient.consecutiveMissedFeedback}次
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-800">处方信息</h4>
                <span className="text-sm text-slate-500">{patientRx.length}条记录</span>
              </div>
              <div className="space-y-2">
                {patientRx.map((rx) => (
                  <div
                    key={rx.id}
                    className={`p-3 rounded-lg border ${
                      rx.status === 'valid' ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-800">{rx.drugName}</span>
                      <Badge className={rx.status === 'valid' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}>
                        {rx.status === 'valid' ? '有效' : '已过期'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      {rx.dosage} · {rx.frequency}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      有效期至：{rx.expiryDate}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-800">过敏禁忌</h4>
                <button
                  onClick={() => setShowAllergyModal(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> 添加
                </button>
              </div>
              {patientAllergies.length > 0 ? (
                <div className="space-y-2">
                  {patientAllergies.map((al) => (
                    <div
                      key={al.id}
                      className="p-3 rounded-lg bg-red-50 border border-red-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-red-800">{al.drugName}</span>
                        <Badge className={severityColors[al.severity]}>
                          {severityLabels[al.severity]}
                        </Badge>
                      </div>
                      {al.note && (
                        <p className="text-sm text-red-700 mt-1">{al.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">暂无过敏记录</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-800">随访计划</h4>
                <span className="text-sm text-slate-500">{patientPlans.length}条记录</span>
              </div>
              <div className="space-y-2">
                {patientPlans.map((plan) => {
                  const group = groups.find((g) => g.id === plan.groupId);
                  return (
                    <div
                      key={plan.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-800">{group?.name}</span>
                        <Badge className={statusColors[plan.status]}>
                          {statusLabels[plan.status]}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-slate-600">
                        <div>周期：每{plan.cycleDays}天</div>
                        <div>下次：{plan.nextFollowupDate}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-800">最近反馈</h4>
                <span className="text-sm text-slate-500">{patientFeedbacks.length}条记录</span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {patientFeedbacks.slice(0, 5).map((fb) => (
                  <div key={fb.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">
                        疗效评分：{fb.efficacyRating}分
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(fb.submittedAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{fb.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-800">业务轨迹</h4>
                <Eye className="w-4 h-4 text-slate-400" />
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {patientTrails.slice(0, 10).map((t) => (
                  <div key={t.id} className="flex gap-3 pb-3 border-b border-slate-100 last:border-0">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">{t.description}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {t.operator} · {new Date(t.timestamp).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      <Modal
        open={showAllergyModal}
        onClose={() => setShowAllergyModal(false)}
        title="添加过敏记录"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">药品名称</label>
            <input
              type="text"
              value={allergyForm.drugName}
              onChange={(e) => setAllergyForm({ ...allergyForm, drugName: e.target.value })}
              placeholder="例如：青霉素"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">严重程度</label>
            <select
              value={allergyForm.severity}
              onChange={(e) =>
                setAllergyForm({
                  ...allergyForm,
                  severity: e.target.value as 'mild' | 'moderate' | 'severe',
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="mild">轻度</option>
              <option value="moderate">中度</option>
              <option value="severe">严重</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">备注说明</label>
            <textarea
              value={allergyForm.note}
              onChange={(e) => setAllergyForm({ ...allergyForm, note: e.target.value })}
              placeholder="过敏反应描述、注意事项等"
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowAllergyModal(false)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleAddAllergy}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
