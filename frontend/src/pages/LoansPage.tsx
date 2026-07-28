import React, { useEffect, useState } from 'react';
import { 
  getLoans, 
  getProducts, 
  createLoan, 
  returnLoan, 
  downloadFile 
} from '../services/api';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Search, 
  Clock, 
  FileSpreadsheet, 
  FileText, 
  RotateCcw, 
  X,
  Tag
} from 'lucide-react';

export const LoansPage: React.FC = () => {
  const { role } = useApp();
  const [loans, setLoans] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'OVERDUE' | 'RETURNED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal de Novo Empréstimo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    department: 'Suporte Técnico',
    productId: '',
    patrimony: '',
    expectedReturnDate: '',
    deliveredBy: 'Carlos Silva (Service Desk)',
    notes: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [loanRes, prodRes] = await Promise.all([
        getLoans(statusFilter === 'ALL' ? undefined : statusFilter),
        getProducts({ limit: 500 })
      ]);
      setLoans(Array.isArray(loanRes) ? loanRes : []);
      setProducts(prodRes.data || []);
    } catch (err) {
      console.error('Erro ao buscar empréstimos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleOpenModal = () => {
    const availableProducts = products.filter((p) => p.currentStock > 0);
    const firstProd = availableProducts[0] || products[0];

    const defaultReturn = new Date();
    defaultReturn.setDate(defaultReturn.getDate() + 7); // Padrão 7 dias

    setFormData({
      userName: '',
      department: 'Infraestrutura / Redes',
      productId: firstProd?.id || '',
      patrimony: firstProd?.patrimony || '',
      expectedReturnDate: defaultReturn.toISOString().split('T')[0],
      deliveredBy: 'Equipe Service Desk',
      notes: ''
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleProductChange = (id: string) => {
    const prod = products.find((p) => p.id === id);
    setFormData({
      ...formData,
      productId: id,
      patrimony: prod?.patrimony || ''
    });
  };

  const handleSaveLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.productId) {
      setErrorMsg('Selecione um equipamento em estoque.');
      return;
    }

    const selectedProd = products.find((p) => p.id === formData.productId);
    if (!selectedProd || selectedProd.currentStock <= 0) {
      setErrorMsg('Equipamento indisponível. Estoque atual é zero.');
      return;
    }

    setSaving(true);
    try {
      await createLoan({
        userName: formData.userName.trim(),
        department: formData.department.trim(),
        equipmentName: selectedProd.name,
        productId: selectedProd.id,
        patrimony: formData.patrimony.trim() || undefined,
        expectedReturnDate: formData.expectedReturnDate,
        deliveredBy: formData.deliveredBy.trim(),
        notes: formData.notes.trim() || undefined
      });

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      console.error('Erro ao registrar empréstimo:', err);
      setErrorMsg(err.response?.data?.error || 'Erro ao registrar empréstimo de TI.');
    } finally {
      setSaving(false);
    }
  };

  const handleReturnLoan = async (loan: any) => {
    if (!confirm(`Confirmar a devolução de "${loan.equipmentName}" emprestado para "${loan.userName}"? O estoque será atualizado (+1).`)) {
      return;
    }
    try {
      await returnLoan(loan.id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao registrar devolução.');
    }
  };

  const handleDownloadPdf = () => {
    downloadFile('/reports/pdf/loans', `omnistock-emprestimos-ti-${Date.now()}.pdf`);
  };

  const handleDownloadExcel = () => {
    downloadFile('/reports/excel/loans', `omnistock-emprestimos-ti-${Date.now()}.xlsx`);
  };

  const filteredLoans = loans.filter((l) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    const user = (l.userName || '').toLowerCase();
    const dep = (l.department || '').toLowerCase();
    const eq = (l.equipmentName || '').toLowerCase();
    const pat = (l.patrimony || '').toLowerCase();
    return user.includes(s) || dep.includes(s) || eq.includes(s) || pat.includes(s);
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">Em Uso</span>;
      case 'OVERDUE':
        return <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500 text-white shadow-sm animate-pulse-soft">
          <Clock className="w-3 h-3" />
          <span>Atrasado (&gt;30d)</span>
        </span>;
      case 'RETURNED':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">Devolvido</span>;
      default:
        return <span>{status}</span>;
    }
  };

  const canManage = role === 'ADMIN' || role === 'TECNICO';

  return (
    <div className="space-y-6">
      {/* Topo: Título e Botões de Ação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Controle de Empréstimos de Periféricos & Equipamentos
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monitore prazos de devolução, equipamentos em uso e empréstimos com mais de 30 dias.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold transition-colors shadow-sm"
            title="Baixar Relatório em PDF"
          >
            <FileText className="w-4 h-4 text-rose-400" />
            <span>PDF</span>
          </button>

          <button
            onClick={handleDownloadExcel}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold transition-colors shadow-sm"
            title="Baixar Planilha Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Excel</span>
          </button>

          {canManage && (
            <button
              onClick={handleOpenModal}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-lg shadow-blue-600/25"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Empréstimo</span>
            </button>
          )}
        </div>
      </div>

      {/* Busca e Filtros de Status */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por colaborador, setor, equipamento ou patrimônio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'ALL' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'ACTIVE' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Em Uso
          </button>
          <button
            onClick={() => setStatusFilter('OVERDUE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'OVERDUE' ? 'bg-rose-500 text-white font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Atrasados (&gt;30d)
          </button>
          <button
            onClick={() => setStatusFilter('RETURNED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'RETURNED' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Devolvidos
          </button>
        </div>
      </div>

      {/* Tabela de Empréstimos */}
      <div className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-900/40">
                <th className="py-3.5 px-4">Colaborador / Setor</th>
                <th className="py-3.5 px-4">Equipamento</th>
                <th className="py-3.5 px-4">Patrimônio</th>
                <th className="py-3.5 px-4">Data Empréstimo</th>
                <th className="py-3.5 px-4">Previsão Devolução</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Ações SD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Carregando empréstimos de TI...
                  </td>
                </tr>
              ) : filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Nenhum empréstimo encontrado para o filtro selecionado.
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {loan.userName}
                      </div>
                      <div className="text-slate-500 text-[11px]">{loan.department}</div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {loan.equipmentName}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                      {loan.patrimony ? (
                        <span className="inline-flex items-center space-x-1">
                          <Tag className="w-3 h-3" />
                          <span>{loan.patrimony}</span>
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {loan.loanDate ? new Date(loan.loanDate).toLocaleDateString('pt-BR') : '-'}
                      <div className="text-[10px] text-slate-400">Por: {loan.deliveredBy || 'SD'}</div>
                    </td>

                    <td className="py-3.5 px-4 font-medium">
                      {loan.returnDate ? (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          Devolvido em {new Date(loan.returnDate).toLocaleDateString('pt-BR')}
                        </span>
                      ) : (
                        <span className={loan.status === 'OVERDUE' ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                          {loan.expectedReturnDate ? new Date(loan.expectedReturnDate).toLocaleDateString('pt-BR') : '-'}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {getStatusBadge(loan.status)}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {loan.status !== 'RETURNED' && canManage ? (
                        <button
                          onClick={() => handleReturnLoan(loan)}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm"
                          title="Registrar devolução do equipamento e restaurar ao estoque"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Devolver item</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Concluído</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Novo Empréstimo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Emprestar Equipamento / Periférico TI
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLoan} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Selecione o Equipamento Disponível
                </label>
                <select
                  required
                  value={formData.productId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white font-semibold"
                >
                  {products
                    .filter((p) => p.currentStock > 0)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        [{p.code}] {p.name} — Disponível: {p.currentStock} {p.unit}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Nome do Colaborador
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ana Clara Lima"
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Setor / Departamento
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Comercial / Recursos Humanos"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Patrimônio / Placa do Item
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: PAT-2026-0040"
                    value={formData.patrimony}
                    onChange={(e) => setFormData({ ...formData, patrimony: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Previsão de Devolução
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expectedReturnDate}
                    onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Técnico Responsável pela Entrega
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Silva (SD)"
                  value={formData.deliveredBy}
                  onChange={(e) => setFormData({ ...formData, deliveredBy: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Observações (Acessórios, Cabo, Fonte inclusos)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Acompanha fonte original e mouse com fio"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                  {saving ? 'Gravando...' : 'Confirmar Empréstimo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
