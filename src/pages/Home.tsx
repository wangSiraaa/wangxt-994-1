import { useNavigate } from 'react-router-dom';
import { Pill, UserCircle, Store, Heart, Shield, ClipboardCheck, AlertTriangle } from 'lucide-react';
import { useStore } from '@/hooks/useStore';

export default function Home() {
  const navigate = useNavigate();
  const { setCurrentRole, checkPrescriptionExpiry } = useStore();

  const handleRoleSelect = (role: 'pharmacist' | 'patient' | 'manager') => {
    setCurrentRole(role);
    checkPrescriptionExpiry();
    const defaultPath = {
      pharmacist: '/pharmacist',
      patient: '/patient',
      manager: '/manager',
    };
    navigate(defaultPath[role]);
  };

  const roles = [
    {
      role: 'pharmacist' as const,
      title: '药师工作台',
      subtitle: '随访计划管理与患者服务',
      icon: Pill,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      features: [
        '建立随访计划并分组管理',
        '查看患者用药反馈',
        '处方过期拦截与复诊建议',
        '过敏禁忌管理',
        '药品补货提醒',
        '批量发送随访提醒',
      ],
    },
    {
      role: 'patient' as const,
      title: '患者服务',
      subtitle: '用药反馈与健康管理',
      icon: UserCircle,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      features: [
        '提交用药反馈',
        '查看随访计划',
        '管理过敏禁忌',
        '查看处方信息',
        '浏览历史记录',
        '隐私授权管理',
      ],
    },
    {
      role: 'manager' as const,
      title: '店长督办',
      subtitle: '逾期管理与质量监控',
      icon: Store,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      features: [
        '查看逾期随访名单',
        '重点关注患者管理',
        '督办记录跟踪',
        '处方过期监控',
        '停药患者列表',
        '全流程业务轨迹',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            药房慢病随访管理系统
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            智能随访提醒、风险自动分级、全流程轨迹追溯，
            让慢病管理更高效、更安全、更贴心
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {roles.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.role}
                onClick={() => handleRoleSelect(item.role)}
                className={`${item.bgColor} border-2 ${item.borderColor} rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl group`}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-md group-hover:shadow-lg transition-shadow`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-slate-600 text-sm mb-4">{item.subtitle}</p>
                <ul className="space-y-2">
                  {item.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${item.color}`}></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">智能风险预警</h4>
            <p className="text-sm text-slate-600">
              连续2次未反馈自动升级为重点关注，处方过期自动拦截并生成复诊建议，已停药患者自动停止随访
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center mb-4">
              <ClipboardCheck className="w-6 h-6 text-sky-500" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">全流程轨迹追溯</h4>
            <p className="text-sm text-slate-600">
              计划生成、反馈变更、逾期升级、处方过期、停药归档，每一步操作都留痕可查
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-emerald-500" />
            </div>
            <h4 className="font-semibold text-slate-900 mb-2">用药安全保障</h4>
            <p className="text-sm text-slate-600">
              过敏禁忌校验、隐私授权管理、药品库存预警，多重保障患者用药安全
            </p>
          </div>
        </div>

        <div className="text-center mt-12 text-sm text-slate-500">
          <p>💡 点击上方角色卡片即可进入对应工作台</p>
          <p className="mt-1">已内置9位复杂患者样例，涵盖各种业务场景</p>
        </div>
      </div>
    </div>
  );
}
