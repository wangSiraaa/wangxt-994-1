import { useState, useMemo } from 'react';
import {
  History,
  Calendar,
  User,
  FileText,
  AlertTriangle,
  Pill,
  Shield,
  Users,
  Lock,
  Bell,
  ClipboardCheck,
  Search,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import AppLayout from '@/components/layout/AppLayout';
import Badge from '@/components/shared/Badge';
import StatCard from '@/components/shared/StatCard';
import type { TrailType, UserRole } from '@/types';

const trailTypeConfig: Record<TrailType, { label: string; icon: typeof FileText; variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; color: string }> = {
  plan_created: { label: '计划生成', icon: Pill, variant: 'info', color: 'bg-sky-100 text-sky-600' },
  feedback_changed: { label: '反馈变更', icon: ClipboardCheck, variant: 'success', color: 'bg-emerald-100 text-emerald-600' },
  overdue_escalated: { label: '逾期升级', icon: AlertTriangle, variant: 'danger', color: 'bg-rose-100 text-rose-600' },
  prescription_expired: { label: '处方过期', icon: Pill, variant: 'warning', color: 'bg-amber-100 text-amber-600' },
  medication_stopped: { label: '停药归档', icon: Shield, variant: 'default', color: 'bg-slate-100 text-slate-600' },
  batch_reminder: { label: '批量提醒', icon: Bell, variant: 'info', color: 'bg-indigo-100 text-indigo-600' },
  privacy_changed: { label: '隐私变更', icon: Lock, variant: 'default', color: 'bg-purple-100 text-purple-600' },
  allergy_added: { label: '过敏新增', icon: Shield, variant: 'warning', color: 'bg-orange-100 text-orange-600' },
  restock_alert: { label: '补货提醒', icon: Pill, variant: 'warning', color: 'bg-yellow-100 text-yellow-600' },
  revisit_suggested: { label: '复诊建议', icon: FileText, variant: 'info', color: 'bg-cyan-100 text-cyan-600' },
};

const operatorRoleConfig: Record<UserRole, { label: string; color: string }> = {
  pharmacist: { label: '药师', color: 'bg-blue-100 text-blue-700' },
  patient: { label: '患者', color: 'bg-green-100 text-green-700' },
  manager: { label: '系统', color: 'bg-amber-100 text-amber-700' },
};

export default function BusinessTrails() {
  const { trails, patients } = useStore();

  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<TrailType | 'all'>('all');
  const [selectedPatient, setSelectedPatient] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [showPatientFilter, setShowPatientFilter] = useState(false);
  const [showRoleFilter, setShowRoleFilter] = useState(false);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayTrails = trails.filter((t) => t.timestamp.slice(0, 10) === today);
    const riskTrails = trails.filter((t) => t.type === 'overdue_escalated' || t.type === 'prescription_expired');
    const systemAuto = trails.filter((t) => t.operatorRole === 'manager');
    return {
      total: trails.length,
      today: todayTrails.length,
      risk: riskTrails.length,
      systemAuto: systemAuto.length,
    };
  }, [trails]);

  const filteredTrails = useMemo(() => {
    return trails
      .filter((t) => {
        if (selectedType !== 'all' && t.type !== selectedType) return false;
        if (selectedPatient !== 'all' && t.patientId !== selectedPatient) return false;
        if (selectedRole !== 'all' && t.operatorRole !== selectedRole) return false;
        if (searchText) {
          const search = searchText.toLowerCase();
          return (
            t.patientName.toLowerCase().includes(search) ||
            t.description.toLowerCase().includes(search) ||
            t.operator.toLowerCase().includes(search)
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [trails, selectedType, selectedPatient, selectedRole, searchText]);

  const typeOptions: { value: TrailType | 'all'; label: string }[] = [
    { value: 'all', label: '全部类型' },
    ...(Object.keys(trailTypeConfig) as TrailType[]).map((t) => ({
      value: t,
      label: trailTypeConfig[t].label,
    })),
  ];

  const patientOptions = [
    { value: 'all', label: '全部患者' },
    ...patients.map((p) => ({ value: p.id, label: p.name })),
  ];

  const roleOptions: { value: UserRole | 'all'; label: string }[] = [
    { value: 'all', label: '全部角色' },
    { value: 'pharmacist', label: '药师操作' },
    { value: 'patient', label: '患者操作' },
    { value: 'manager', label: '系统自动' },
  ];

  const getSelectedLabel = (options: { value: string; label: string }[], value: string) => {
    return options.find((o) => o.value === value)?.label || '全部';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="总轨迹数"
            value={stats.total}
            icon={<History className="w-6 h-6" />}
            variant="default"
          />
          <StatCard
            title="今日新增"
            value={stats.today}
            icon={<Calendar className="w-6 h-6" />}
            variant="info"
          />
          <StatCard
            title="风险预警"
            value={stats.risk}
            icon={<AlertTriangle className="w-6 h-6" />}
            variant="danger"
          />
          <StatCard
            title="系统自动"
            value={stats.systemAuto}
            icon={<Users className="w-6 h-6" />}
            variant="warning"
          />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索患者姓名、操作描述..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setShowTypeFilter(!showTypeFilter);
                  setShowPatientFilter(false);
                  setShowRoleFilter(false);
                }}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>{getSelectedLabel(typeOptions, selectedType)}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {showTypeFilter && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10 min-w-[150px] animate-fadeIn">
                  {typeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSelectedType(opt.value);
                        setShowTypeFilter(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                        selectedType === opt.value ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setShowPatientFilter(!showPatientFilter);
                  setShowTypeFilter(false);
                  setShowRoleFilter(false);
                }}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>{getSelectedLabel(patientOptions, selectedPatient)}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {showPatientFilter && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10 min-w-[150px] max-h-[300px] overflow-y-auto animate-fadeIn">
                  {patientOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSelectedPatient(opt.value);
                        setShowPatientFilter(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                        selectedPatient === opt.value ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setShowRoleFilter(!showRoleFilter);
                  setShowTypeFilter(false);
                  setShowPatientFilter(false);
                }}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>{getSelectedLabel(roleOptions, selectedRole)}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {showRoleFilter && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10 min-w-[150px] animate-fadeIn">
                  {roleOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSelectedRole(opt.value);
                        setShowRoleFilter(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                        selectedRole === opt.value ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">业务轨迹时间线</h3>
            <span className="text-sm text-slate-500">共 {filteredTrails.length} 条记录</span>
          </div>

          <div className="p-6">
            {filteredTrails.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">暂无符合条件的业务轨迹</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                <div className="space-y-6">
                  {filteredTrails.map((trail) => {
                    const config = trailTypeConfig[trail.type];
                    const Icon = config.icon;
                    const roleConfig = operatorRoleConfig[trail.operatorRole];
                    const patient = patients.find((p) => p.id === trail.patientId);

                    return (
                      <div key={trail.id} className="relative pl-12">
                        <div
                          className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${config.color} border-2 border-white shadow-sm`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors">
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={config.variant}>{config.label}</Badge>
                              <span className="text-sm font-medium text-slate-800">{trail.patientName}</span>
                              {patient && (
                                <span className="text-xs text-slate-500">
                                  {patient.chronicDisease} · {patient.age}岁{patient.gender}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400">
                              {new Date(trail.timestamp).toLocaleString('zh-CN')}
                            </span>
                          </div>

                          <p className="text-sm text-slate-700 mb-3">{trail.description}</p>

                          <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${roleConfig.color}`}>
                              <User className="w-3 h-3" />
                              {trail.operator}
                            </span>
                            <span className="text-xs text-slate-400">轨迹ID: {trail.id}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-4">
          <h4 className="font-medium text-indigo-800 mb-2">📋 业务轨迹说明</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 text-xs text-indigo-700">
            <div>• <strong>计划生成</strong>：创建随访计划</div>
            <div>• <strong>反馈变更</strong>：患者提交用药反馈</div>
            <div>• <strong>逾期升级</strong>：未反馈自动升级风险</div>
            <div>• <strong>处方过期</strong>：处方到期自动拦截</div>
            <div>• <strong>停药归档</strong>：患者停药停止随访</div>
            <div>• <strong>批量提醒</strong>：分组批量发送提醒</div>
            <div>• <strong>隐私变更</strong>：隐私授权状态变更</div>
            <div>• <strong>过敏新增</strong>：添加过敏禁忌记录</div>
            <div>• <strong>补货提醒</strong>：药品库存不足提醒</div>
            <div>• <strong>复诊建议</strong>：生成复诊建议</div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
