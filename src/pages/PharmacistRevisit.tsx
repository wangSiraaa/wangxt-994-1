import { useStore } from '@/hooks/useStore';
import Badge from '@/components/shared/Badge';
import { Stethoscope, Send, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  sent: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-green-100 text-green-700',
};

const statusLabels = {
  pending: '待处理',
  sent: '已通知',
  confirmed: '已确认',
};

export default function PharmacistRevisit() {
  const { revisitSuggestions, patients, prescriptions, updateRevisitSuggestion, addRevisitSuggestion } = useStore();

  const handleSend = (id: string) => {
    updateRevisitSuggestion(id, 'sent');
  };

  const handleConfirm = (id: string) => {
    updateRevisitSuggestion(id, 'confirmed');
  };

  const pendingCount = revisitSuggestions.filter((r) => r.status === 'pending').length;
  const sentCount = revisitSuggestions.filter((r) => r.status === 'sent').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">复诊建议管理</h2>
          <p className="text-slate-500 mt-1">处方过期拦截、自动提醒复诊、跟踪复诊进度</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">待处理</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
            </div>
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">已通知</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{sentCount}</p>
            </div>
            <Send className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">已确认</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {revisitSuggestions.filter((r) => r.status === 'confirmed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">总计</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{revisitSuggestions.length}</p>
            </div>
            <Stethoscope className="w-8 h-8 text-slate-500" />
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-amber-900">处方过期拦截规则</p>
            <ul className="text-sm text-amber-700 mt-1 space-y-0.5">
              <li>• 系统自动检测过期处方，生成复诊建议</li>
              <li>• 处方过期后自动暂停该患者的随访计划</li>
              <li>• 连续未反馈≥2次自动升级风险等级并提示复诊</li>
              <li>• 患者提交反馈时如处方已过期自动提醒</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">复诊建议列表</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {revisitSuggestions.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Stethoscope className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>暂无复诊建议</p>
            </div>
          ) : (
            revisitSuggestions
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((rs) => {
                const patient = patients.find((p) => p.id === rs.patientId);
                const prescription = prescriptions.find((p) => p.id === rs.prescriptionId);
                return (
                  <div key={rs.id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-medium shrink-0">
                          {patient?.name.slice(0, 1)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">{patient?.name}</span>
                            <Badge className={statusColors[rs.status]}>
                              {statusLabels[rs.status]}
                            </Badge>
                            {patient?.riskLevel === 'critical' && (
                              <Badge className="bg-red-100 text-red-700">重点患者</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mt-1">
                            {patient?.chronicDisease} · {patient?.age}岁
                          </p>
                          {prescription && (
                            <p className="text-sm text-slate-500 mt-0.5">
                              处方：{prescription.drugName} · 有效期至 {prescription.expiryDate}
                              {new Date(prescription.expiryDate) < new Date() && (
                                <span className="text-red-600 ml-1">(已过期)</span>
                              )}
                            </p>
                          )}
                          <div className="mt-3 space-y-1.5">
                            <p className="text-sm">
                              <span className="text-slate-500">原因：</span>
                              <span className="text-slate-700">{rs.reason}</span>
                            </p>
                            <p className="text-sm">
                              <span className="text-slate-500">建议：</span>
                              <span className="text-slate-700">{rs.suggestion}</span>
                            </p>
                          </div>
                          <p className="text-xs text-slate-400 mt-2">
                            创建时间：{new Date(rs.createdAt).toLocaleString('zh-CN')}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {rs.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleSend(rs.id)}
                              className="flex items-center justify-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                              通知患者
                            </button>
                            <button
                              onClick={() => handleConfirm(rs.id)}
                              className="flex items-center justify-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              标记已复诊
                            </button>
                          </>
                        )}
                        {rs.status === 'sent' && (
                          <button
                            onClick={() => handleConfirm(rs.id)}
                            className="flex items-center justify-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            标记已复诊
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}
