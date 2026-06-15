import { useStore } from '@/hooks/useStore';
import Badge from '@/components/shared/Badge';
import { Package, AlertTriangle, CheckCircle, ShoppingCart, Clock } from 'lucide-react';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  ordered: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
};

const statusLabels = {
  pending: '待补货',
  ordered: '已订购',
  resolved: '已解决',
};

export default function PharmacistRestock() {
  const { restockAlerts, patients, prescriptions, updateRestockAlert } = useStore();

  const handleOrder = (id: string) => {
    updateRestockAlert(id, 'ordered');
  };

  const handleResolve = (id: string) => {
    updateRestockAlert(id, 'resolved');
  };

  const getPatientsForDrug = (drugName: string) => {
    const rxPatientIds = prescriptions
      .filter((p) => p.drugName === drugName && p.status === 'valid')
      .map((p) => p.patientId);
    return patients.filter((p) => rxPatientIds.includes(p.id) && p.status === 'active');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">药品补货提醒</h2>
          <p className="text-slate-500 mt-1">监控慢病常用药品库存，确保患者用药不间断</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">待补货</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {restockAlerts.filter((r) => r.status === 'pending').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">已订购</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {restockAlerts.filter((r) => r.status === 'ordered').length}
              </p>
            </div>
            <ShoppingCart className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">已解决</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {restockAlerts.filter((r) => r.status === 'resolved').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">影响患者</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {restockAlerts.reduce((sum, r) => sum + r.patientCount, 0)}
              </p>
            </div>
            <Package className="w-8 h-8 text-slate-500" />
          </div>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-red-900">库存不足风险</p>
            <ul className="text-sm text-red-700 mt-1 space-y-0.5">
              <li>• 库存低于阈值时自动生成补货提醒</li>
              <li>• 药品缺货将影响{restockAlerts.reduce((sum, r) => sum + r.patientCount, 0)}位慢病患者的用药连续性</li>
              <li>• 重点关注药品：{restockAlerts.filter((r) => r.status === 'pending').map((r) => r.drugName).join('、')}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {restockAlerts.map((alert) => {
          const affectedPatients = getPatientsForDrug(alert.drugName);
          const stockRate = Math.min(100, (alert.currentStock / alert.threshold) * 100);

          return (
            <div
              key={alert.id}
              className={`bg-white rounded-xl border-2 p-5 ${
                alert.status === 'pending'
                  ? 'border-amber-300'
                  : alert.status === 'ordered'
                  ? 'border-blue-300'
                  : 'border-green-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      alert.status === 'pending'
                        ? 'bg-amber-100'
                        : alert.status === 'ordered'
                        ? 'bg-blue-100'
                        : 'bg-green-100'
                    }`}
                  >
                    <Package
                      className={`w-6 h-6 ${
                        alert.status === 'pending'
                          ? 'text-amber-600'
                          : alert.status === 'ordered'
                          ? 'text-blue-600'
                          : 'text-green-600'
                      }`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-800">{alert.drugName}</h3>
                      <Badge className={statusColors[alert.status]}>
                        {statusLabels[alert.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      当前库存：{alert.currentStock}盒 / 阈值：{alert.threshold}盒 · 影响{alert.patientCount}位患者
                    </p>

                    <div className="mt-3 w-64">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>库存水平</span>
                        <span>{Math.round(stockRate)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            stockRate < 30
                              ? 'bg-red-500'
                              : stockRate < 60
                              ? 'bg-amber-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${stockRate}%` }}
                        />
                      </div>
                    </div>

                    {affectedPatients.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-slate-500 mb-2">受影响患者：</p>
                        <div className="flex flex-wrap gap-1.5">
                          {affectedPatients.slice(0, 6).map((p) => (
                            <span
                              key={p.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-full"
                            >
                              <span className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-[10px] flex items-center justify-center">
                                {p.name.slice(0, 1)}
                              </span>
                              {p.name}
                            </span>
                          ))}
                          {affectedPatients.length > 6 && (
                            <span className="text-xs text-slate-500">
                              +{affectedPatients.length - 6}位
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {alert.status === 'pending' && (
                    <button
                      onClick={() => handleOrder(alert.id)}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      标记已订购
                    </button>
                  )}
                  {alert.status === 'ordered' && (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      标记已到货
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
