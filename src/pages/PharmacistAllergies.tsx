import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import Badge from '@/components/shared/Badge';
import Modal from '@/components/shared/Modal';
import { AlertTriangle, Plus, Shield, User, FileText, X } from 'lucide-react';

const severityColors = {
  mild: 'bg-amber-100 text-amber-700 border-amber-200',
  moderate: 'bg-orange-100 text-orange-700 border-orange-200',
  severe: 'bg-red-100 text-red-700 border-red-200',
};

const severityLabels = {
  mild: '轻度',
  moderate: '中度',
  severe: '严重',
};

const severityBadge = {
  mild: 'warning' as const,
  moderate: 'warning' as const,
  severe: 'danger' as const,
};

export default function PharmacistAllergies() {
  const { patients, allergies, addAllergy, showAllergyModal, setShowAllergyModal, selectedPatientId, selectPatient } = useStore();
  const [selectedSeverity, setSelectedSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [drugName, setDrugName] = useState('');
  const [note, setNote] = useState('');

  const activePatients = patients.filter((p) => p.status === 'active');

  const getAllergiesForPatient = (patientId: string) => {
    return allergies.filter((a) => a.patientId === patientId);
  };

  const patientsWithAllergies = activePatients.filter((p) => getAllergiesForPatient(p.id).length > 0);
  const patientsWithoutAllergies = activePatients.filter((p) => getAllergiesForPatient(p.id).length === 0);
  const severeAllergyCount = allergies.filter((a) => a.severity === 'severe').length;

  const handleAddAllergy = () => {
    if (!selectedPatientId || !drugName.trim()) return;
    addAllergy(selectedPatientId, drugName.trim(), selectedSeverity, note.trim());
    setDrugName('');
    setNote('');
    setSelectedSeverity('mild');
    setShowAllergyModal(false);
    selectPatient('');
  };

  const openAddModal = (patientId: string) => {
    selectPatient(patientId);
    setShowAllergyModal(true);
  };

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">过敏禁忌管理</h2>
          <p className="text-slate-500 mt-1">记录和管理患者药物过敏信息，避免用药风险</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">严重过敏</p>
              <p className="text-2xl font-bold text-red-600">{severeAllergyCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">有过敏记录</p>
              <p className="text-2xl font-bold text-slate-800">{patientsWithAllergies.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">无过敏记录</p>
              <p className="text-2xl font-bold text-slate-800">{patientsWithoutAllergies.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-800">用药安全提醒</h3>
            <p className="text-sm text-amber-700 mt-1">
              为每位患者建立完整的过敏记录是用药安全的第一道防线。创建随访计划时，系统会自动检查处方药品与过敏记录是否存在冲突，存在冲突时将禁止创建计划。
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">过敏记录列表</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {allergies.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>暂无过敏记录</p>
            </div>
          ) : (
            [...allergies].sort((a, b) => {
              const severityOrder = { severe: 0, moderate: 1, mild: 2 };
              return severityOrder[a.severity] - severityOrder[b.severity];
            }).map((allergy) => {
              const patient = patients.find((p) => p.id === allergy.patientId);
              if (!patient) return null;
              return (
                <div key={allergy.id} className={`p-4 ${severityColors[allergy.severity]} border-l-4`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                        <span className="font-semibold text-slate-700">{patient.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">{patient.name}</span>
                          <Badge variant={severityBadge[allergy.severity]}>
                            {severityLabels[allergy.severity]}过敏
                          </Badge>
                          <Badge variant="info">{patient.chronicDisease}</Badge>
                        </div>
                        <p className="text-slate-700 mt-1">
                          <span className="font-medium">过敏药物：</span>
                          <span className="text-red-700 font-semibold">{allergy.drugName}</span>
                        </p>
                        {allergy.note && (
                          <p className="text-slate-600 text-sm mt-1">
                            <span className="font-medium">说明：</span>{allergy.note}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">年龄 {patient.age} 岁</p>
                      <p className="text-sm text-slate-500">{patient.phone}</p>
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
          <h3 className="font-semibold text-slate-800">患者列表 - 可添加过敏记录</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {activePatients.map((patient) => {
            const patientAllergies = getAllergiesForPatient(patient.id);
            return (
              <div
                key={patient.id}
                className="border border-slate-200 rounded-lg p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <span className="font-semibold text-slate-600">{patient.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{patient.name}</p>
                      <p className="text-sm text-slate-500">{patient.chronicDisease} · {patient.age}岁</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openAddModal(patient.id)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    添加过敏
                  </button>
                </div>
                {patientAllergies.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">现有过敏记录：</p>
                    <div className="flex flex-wrap gap-1">
                      {patientAllergies.map((a) => (
                        <Badge key={a.id} variant={severityBadge[a.severity]}>
                          {a.drugName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        show={showAllergyModal}
        onClose={() => {
          setShowAllergyModal(false);
          selectPatient('');
          setDrugName('');
          setNote('');
          setSelectedSeverity('mild');
        }}
        title="添加过敏记录"
      >
        {selectedPatient && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-sm text-slate-600">
                为 <span className="font-semibold text-slate-800">{selectedPatient.name}</span> 添加过敏记录
              </p>
              <p className="text-xs text-slate-500 mt-1">{selectedPatient.chronicDisease} · {selectedPatient.age}岁 · {selectedPatient.phone}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">过敏药物名称 *</label>
              <input
                type="text"
                value={drugName}
                onChange={(e) => setDrugName(e.target.value)}
                placeholder="请输入药物名称，如：阿司匹林"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">过敏严重程度</label>
              <div className="grid grid-cols-3 gap-2">
                {(['mild', 'moderate', 'severe'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSelectedSeverity(level)}
                    className={`px-3 py-2 rounded-lg border-2 transition-all ${
                      selectedSeverity === level
                        ? severityColors[level] + ' border-current font-medium'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {severityLabels[level]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">过敏反应说明</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="请描述过敏反应症状，如：皮疹、呼吸困难、胃肠不适等"
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAllergyModal(false);
                  selectPatient('');
                  setDrugName('');
                  setNote('');
                  setSelectedSeverity('mild');
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleAddAllergy}
                disabled={!drugName.trim()}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认添加
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
