import React, { useEffect, useState } from 'react';
import { getMovements, getProducts, createMovement } from '../services/api';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Search, 
  Filter, 
  X
} from 'lucide-react';

export const MOVEMENT_TYPES = [
  { value: 'ALL', label: 'Todas Movimentações' },
  { value: 'ENTRADA', label: 'Entrada (Compra / Recebimento)' },
  { value: 'SAIDA', label: 'Saída (Consumo / Instalação)' },
  { value: 'EMPRESTIMO', label: 'Empréstimo' },
  { value: 'DEVOLUCAO', label: 'Devolução' },
  { value: 'BAIXA', label: 'Baixa / Sucata' }
];

export const MovementsPage: React.FC = () => {
  const { role } = useApp();
  const [movements, setMovements] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal de Novo Registro
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    type: 'ENTRADA',
    quantity: 1,
    reason: '',
    observation: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [movRes, prodRes] = await Promise.all([
        getMovements({ limit: 500, type: selectedType === 'ALL' ? undefined : selectedType }),
        getProducts({ limit: 500 })
      ]);
      setMovements(movRes.data || []);
      setProducts(prodRes.data || []);
    } catch (err) {
      console.error('Erro ao buscar movimentações:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedType]);

  const handleOpenModal = () => {
    setFormData({
      productId: products[0]?.id || '',
      type: 'ENTRADA',
      quantity: 1,
      reason: '',
      observation: ''
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSaveMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.productId) {
      setErrorMsg('Selecione um equipamento da lista.');
      return;
    }

    if (formData.quantity <= 0) {
      setErrorMsg('A quantidade deve ser maior que zero.');
      return;
    }

    // Verificação de regra do SD: Não permitir estoque negativo
    const selectedProd = products.find((p) => p.id === formData.productId);
    const isReducing = ['SAIDA', 'EMPRESTIMO', 'BAIXA'].includes(formData.type);
    if (selectedProd && isReducing && selectedProd.currentStock < formData.quantity) {
      setErrorMsg(`Não permitido: A quantidade solicitada (${formData.quantity}) é maior que o estoque atual (${selectedProd.currentStock} ${selectedProd.unit}). O sistema não permite estoque negativo.`);
      return;
    }

    setSaving(true);
    try {
      await createMovement({
        productId: formData.productId,
        type: formData.type,
        quantity: Number(formData.quantity),
        reason: formData.reason.trim() || `Registro manual - ${formData.type}`,
        observation: formData.observation.trim() || undefined
      });

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      console.error('Erro ao registrar movimentação:', err);
      setErrorMsg(err.response?.data?.error || 'Erro ao registrar movimentação no Service Desk.');
    } finally {
      setSaving(false);
    }
  };

  const filteredMovements = movements.filter((m) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    const prodName = (m.product?.name || '').toLowerCase();
    const prodCode = (m.product?.code || '').toLowerCase();
    const user = (m.user?.name || '').toLowerCase();
    const reason = (m.reason || '').toLowerCase();
    return prodName.includes(s) || prodCode.includes(s) || user.includes(s) || reason.includes(s);
  });

  const getBadge = (type: string) => {
    switch (type) {
      case 'ENTRADA':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">Entrada</span>;
      case 'SAIDA':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">Saída</span>;
      case 'EMPRESTIMO':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">Empréstimo</span>;
      case 'DEVOLUCAO':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">Devolução</span>;
      case 'BAIXA':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">Baixa</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-800">{type}</span>;
    }
  };

  const canCreate = role === 'ADMIN' || role === 'TECNICO';

  return (
    <div className="space-y-6">
      {/* Topo da página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Histórico de Movimentações de TI
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Regra do Service Desk: O sistema registra todas as movimentações e não permite estoque negativo.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-lg shadow-blue-600/25"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Movimentação</span>
          </button>
        )}
      </div>

      {/* Busca e Filtro por Tipo */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por equipamento, responsável ou motivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {MOVEMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela de Movimentações */}
      <div className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-900/40">
                <th className="py-3.5 px-4">Data / Hora</th>
                <th className="py-3.5 px-4">Tipo</th>
                <th className="py-3.5 px-4">Equipamento</th>
                <th className="py-3.5 px-4">Patrimônio</th>
                <th className="py-3.5 px-4 text-center">Quantidade</th>
                <th className="py-3.5 px-4 text-center">Saldo Estoque</th>
                <th className="py-3.5 px-4">Responsável</th>
                <th className="py-3.5 px-4">Motivo / Observação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    Carregando histórico de movimentações...
                  </td>
                </tr>
              ) : filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    Nenhuma movimentação encontrada para o filtro selecionado.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {mov.datetime ? new Date(mov.datetime).toLocaleString('pt-BR') : '-'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getBadge(mov.type)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      {mov.product?.name || 'Item não especificado'}
                      <div className="text-[10px] text-slate-400">{mov.product?.code}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {mov.product?.patrimony || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-sm">
                      {mov.type === 'ENTRADA' || mov.type === 'DEVOLUCAO' ? (
                        <span className="text-emerald-600 dark:text-emerald-400">+{mov.quantity}</span>
                      ) : (
                        <span className="text-blue-600 dark:text-blue-400">-{mov.quantity}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300">
                        {mov.previousStock} &rarr; <strong>{mov.newStock}</strong>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {mov.user?.name || 'Sistema'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate" title={mov.observation}>
                      <strong>{mov.reason || '-'}</strong>
                      {mov.observation ? ` | ${mov.observation}` : ''}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Registrar Nova Movimentação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Registrar Movimentação de Estoque TI
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMovement} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Selecione o Equipamento
                </label>
                <select
                  required
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.code}] {p.name} — Estoque atual: {p.currentStock} {p.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Tipo de Movimentação
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="ENTRADA">Entrada (Compra / Devolução fornecedor)</option>
                    <option value="SAIDA">Saída (Uso / Substituição)</option>
                    <option value="EMPRESTIMO">Empréstimo temporário</option>
                    <option value="DEVOLUCAO">Devolução ao estoque</option>
                    <option value="BAIXA">Baixa / Perda / Defeito</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400">Estoque não pode ficar negativo.</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Motivo / Colaborador Solicitante
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Substituição de mouse com defeito - João (Suporte)"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Observações Adicionais (Chamado / OS / Patrimônio)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Chamado #9482 / PAT-2026-0030"
                  value={formData.observation}
                  onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-lg shadow-blue-600/25 disabled:opacity-50"
                >
                  {saving ? 'Gravando...' : 'Confirmar Movimentação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
