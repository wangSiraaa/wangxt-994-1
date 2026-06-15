import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Pill,
  UserCircle,
  ClipboardCheck,
  AlertTriangle,
  History,
  Package,
  Menu,
  X,
  ChevronRight,
  Stethoscope,
  Users,
  ShieldAlert,
} from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import type { UserRole } from '@/types';

const roleConfig: Record<UserRole, { label: string; color: string; defaultPath: string }> = {
  pharmacist: { label: '药师', color: 'bg-blue-500', defaultPath: '/pharmacist' },
  patient: { label: '患者', color: 'bg-green-500', defaultPath: '/patient' },
  manager: { label: '店长', color: 'bg-amber-500', defaultPath: '/manager' },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentRole, setCurrentRole, sidebarCollapsed, toggleSidebar, checkPrescriptionExpiry } = useStore();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    setRoleMenuOpen(false);
    checkPrescriptionExpiry();
    navigate(roleConfig[role].defaultPath);
  };

  const menuItems = [
    {
      role: 'pharmacist' as UserRole,
      items: [
        { path: '/pharmacist', label: '工作台', icon: LayoutDashboard },
        { path: '/pharmacist/plans', label: '随访计划', icon: Pill },
        { path: '/pharmacist/groups', label: '分组管理', icon: Users },
        { path: '/pharmacist/patients', label: '患者管理', icon: UserCircle },
        { path: '/pharmacist/revisit', label: '复诊建议', icon: Stethoscope },
        { path: '/pharmacist/allergies', label: '过敏禁忌', icon: ShieldAlert },
        { path: '/pharmacist/restock', label: '药品补货', icon: Package },
        { path: '/trails', label: '业务轨迹', icon: History },
      ],
    },
    {
      role: 'patient' as UserRole,
      items: [
        { path: '/patient', label: '我的首页', icon: LayoutDashboard },
        { path: '/patient/feedback', label: '用药反馈', icon: ClipboardCheck },
        { path: '/patient/history', label: '历史记录', icon: History },
      ],
    },
    {
      role: 'manager' as UserRole,
      items: [
        { path: '/manager', label: '督办工作台', icon: LayoutDashboard },
        { path: '/manager/overdue', label: '逾期名单', icon: AlertTriangle },
        { path: '/manager/focus', label: '重点关注', icon: ShieldAlert },
        { path: '/manager/supervision', label: '督办记录', icon: ClipboardCheck },
        { path: '/trails', label: '业务轨迹', icon: History },
      ],
    },
  ];

  const currentMenu = menuItems.find((m) => m.role === currentRole)?.items || [];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside
        className={`${
          sidebarCollapsed ? 'w-16' : 'w-64'
        } bg-white border-r border-slate-200 flex flex-col transition-all duration-200 shrink-0`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Pill className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-slate-800">慢病随访</span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {currentMenu.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:bg-slate-100'
                } ${sidebarCollapsed ? 'justify-center' : ''}`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {!sidebarCollapsed && (
          <div className="p-3 border-t border-slate-200">
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className={`w-3 h-3 rounded-full ${roleConfig[currentRole].color}`} />
                <span className="text-sm font-medium text-slate-700">
                  当前角色：{roleConfig[currentRole].label}
                </span>
              </button>

              {roleMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg border border-slate-200 shadow-lg py-1 animate-fadeIn">
                  {(Object.keys(roleConfig) as UserRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(role)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-slate-50 ${
                        currentRole === role ? 'text-indigo-600 bg-indigo-50' : 'text-slate-700'
                      }`}
                    >
                      <div className={`w-2.5 h-2.5 rounded-full ${roleConfig[role].color}`} />
                      切换为{roleConfig[role].label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-slate-800">
              {currentMenu.find((m) => m.path === location.pathname)?.label || '慢病随访管理系统'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-800">
                {currentRole === 'pharmacist' && '赵药师'}
                {currentRole === 'patient' && '患者用户'}
                {currentRole === 'manager' && '王店长'}
              </p>
              <p className="text-xs text-slate-500">
                {new Date().toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-medium">
              {currentRole === 'pharmacist' && '药'}
              {currentRole === 'patient' && '患'}
              {currentRole === 'manager' && '店'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">{children}</div>
      </main>
    </div>
  );
}
