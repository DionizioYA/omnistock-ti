import React, { useEffect, useState } from 'react';
import { 
  getProducts, 
  getCategories, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../services/api';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Plus, 
  Filter, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  X,
  Tag,
  MapPin
} from 'lucide-react';

export const IT_CATEGORIES = [
  'Notebook',
  'Desktop',
  'Monitor',
  'Mouse',
  'Teclado',
  'Headset',
  'Webcam',
  'Impressora',
  'Tablet',
  'Celular',
  'Switch',
  'Access Point',
  'Cabo de Rede',
  'Fonte',
  'SSD',
  'HD',
  'Memória RAM',
  'Adaptador',
  'Outro'
];

export const InventoryPage: React.FC = () => {
  const { role } = useApp();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'ZERO'>('ALL');

  // Modal de Adição/Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Modal de Exclusão (Confirmação Obrigatória)
  const [deletingProduct, setDeletingProduct] = useState<any | null>(null);

  // Campos do formulário de cadastro do Service Desk
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    categoryName: 'Notebook',
    brand: '',
    unit: 'UN',
    currentStock: 0,
    minStock: 2,
    maxStock: 50,
    purchasePrice: 0,
    salesPrice: 0,
    patrimony: '',
    serialNumber: '',
    location: 'Estoque Central TI',
    notes: ''
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        getProducts({ limit: 500, search: searchTerm || undefined, categoryId: selectedCategory || undefined }),
        getCategories()
      ]);
      setProducts(prodRes.data || []);
      setCategories(catRes || []);
    } catch (err) {
      console.error('Erro ao carregar equipamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadInventory();
  };

  const openNewModal = () => {
    setEditingProduct(null);
    setFormData({
      code: `TI-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      categoryName: 'Notebook',
      brand: '',
      unit: 'UN',
      currentStock: 1,
      minStock: 2,
      maxStock: 50,
      purchasePrice: 0,
      salesPrice: 0,
      patrimony: '',
      serialNumber: '',
      location: 'Estoque Central TI',
      notes: ''
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    setFormData({
      code: p.code || '',
      name: p.name || '',
      categoryName: p.category?.name || 'Outro',
      brand: p.brand || '',
      unit: p.unit || 'UN',
      currentStock: p.currentStock || 0,
      minStock: p.minStock || 2,
      maxStock: p.maxStock || 50,
      purchasePrice: p.purchasePrice || 0,
      salesPrice: p.salesPrice || 0,
      patrimony: p.patrimony || '',
      serialNumber: p.serialNumber || '',
      location: p.location || '',
      notes: p.notes || ''
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.currentStock < 0) {
      setErrorMsg('O estoque do item não pode ser negativo.');
      return;
    }

    setSaving(true);
    try {
      // Procura ID da categoria, se não houver, fallback para categoria "Outro" ou a primeira disponível
      let foundCat = categories.find((c) => c.name.toLowerCase() === formData.categoryName.toLowerCase());
      if (!foundCat && categories.length > 0) {
        foundCat = categories.find((c) => c.name.toLowerCase() === 'outro') || categories[0];
      }
      const payload: any = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        categoryId: foundCat?.id || 'e65daf6f-35dd-4f4f-9e90-edaf4bfd5a95',
        brand: formData.brand.trim() || undefined,
        unit: formData.unit,
        currentStock: Number(formData.currentStock),
        minStock: Number(formData.minStock),
        maxStock: Number(formData.maxStock),
        purchasePrice: Number(formData.purchasePrice),
        salesPrice: Number(formData.salesPrice),
        patrimony: formData.patrimony.trim() || undefined,
        serialNumber: formData.serialNumber.trim() || undefined,
        location: formData.location.trim() || undefined,
        notes: formData.notes.trim() || undefined
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await createProduct(payload);
      }

      setIsModalOpen(false);
      loadInventory();
    } catch (err: any) {
      console.error('Erro ao salvar item:', err);
      setErrorMsg(err.response?.data?.error || 'Erro ao salvar equipamento. Verifique o código/nome.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    try {
      await deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
      loadInventory();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao remover equipamento.');
    }
  };

  const filteredProducts = products.filter((p) => {
    if (stockFilter === 'LOW') return p.currentStock < p.minStock && p.currentStock > 0;
    if (stockFilter === 'ZERO') return p.currentStock === 0;
    return true;
  });

  const canEdit = role === 'ADMIN' || role === 'TECNICO';
  const canDelete = role === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Cabeçalho da página de Cadastro e Controle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Inventário de TI (Equipamentos & Periféricos)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gerencie notebooks, monitores, periféricos e suprimentos com código de patrimônio e série.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={openNewModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-lg shadow-blue-600/25"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Equipamento</span>
          </button>
        )}
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Campo de Busca por Código / Patrimônio / Série / Nome */}
        <form onSubmit={handleSearch} className="flex-1 flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, código, patrimônio ou nº de série..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
          >
            Buscar
          </button>
        </form>

        {/* Filtro por Categoria de TI */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas Categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Filtros Rápido de Status de Estoque */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setStockFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                stockFilter === 'ALL' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStockFilter('LOW')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                stockFilter === 'LOW' ? 'bg-amber-500 text-white font-bold' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Estoque Baixo
            </button>
            <button
              onClick={() => setStockFilter('ZERO')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                stockFilter === 'ZERO' ? 'bg-rose-500 text-white font-bold' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Sem Estoque
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de Equipamentos do Service Desk */}
      <div className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-900/40">
                <th className="py-3.5 px-4">Código / Categoria</th>
                <th className="py-3.5 px-4">Equipamento / Periférico</th>
                <th className="py-3.5 px-4">Patrimônio / Série</th>
                <th className="py-3.5 px-4">Localização</th>
                <th className="py-3.5 px-4 text-center">Estoque</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Carregando inventário de TI...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Nenhum equipamento correspondente encontrado no estoque.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.currentStock < p.minStock && p.currentStock > 0;
                  const isZero = p.currentStock === 0;

                  return (
                    <tr 
                      key={p.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{p.code}</div>
                        <span className="inline-flex items-center mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                          {p.category?.name || 'Geral'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white text-sm">
                          {p.name}
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          {p.brand ? `Marca: ${p.brand}` : ''}{p.brand && p.unit ? ' • ' : ''}Unid: {p.unit}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-slate-800 dark:text-slate-200 font-medium">
                          {p.patrimony ? (
                            <span className="inline-flex items-center space-x-1 text-indigo-600 dark:text-indigo-400">
                              <Tag className="w-3 h-3" />
                              <span>{p.patrimony}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {p.serialNumber ? `S/N: ${p.serialNumber}` : ''}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{p.location || 'Central SD'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-3 py-1 rounded-lg font-bold text-sm ${
                          isZero 
                            ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800' 
                            : isLow 
                              ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                        }`}>
                          {p.currentStock} {p.unit}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Mín: {p.minStock}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {isZero ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500 text-white shadow-sm">
                            Sem Estoque
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-sm">
                            Estoque Baixo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            Disponível
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">
                          {canEdit && (
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                              title="Editar Equipamento"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => setDeletingProduct(p)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                              title="Excluir Equipamento"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Novo/Editar Equipamento com 19 Categorias de TI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingProduct ? 'Editar Equipamento SD' : 'Cadastrar Novo Equipamento SD'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Código (Obrigatório)</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Nome do Equipamento</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Notebook Latitude 5440 i7 16GB"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Categoria TI</label>
                  <select
                    value={formData.categoryName}
                    onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                  >
                    {IT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Marca / Fabricante</label>
                  <input
                    type="text"
                    placeholder="Ex: Dell, Lenovo, HP, Logitech"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Unidade</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                  >
                    <option value="UN">Unidade (UN)</option>
                    <option value="CX">Caixa (CX)</option>
                    <option value="KIT">Kit (KIT)</option>
                    <option value="RL">Rolo (RL)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Número de Patrimônio (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: PAT-2026-0045"
                    value={formData.patrimony}
                    onChange={(e) => setFormData({ ...formData, patrimony: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Número de Série (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: SN-889410-X2"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Estoque Atual
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400">Regra: Sem estoque negativo</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Estoque Mínimo</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Localização</label>
                  <input
                    type="text"
                    placeholder="Ex: Armário A2 / Sala TI"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Observações Técnicas</label>
                <textarea
                  rows={2}
                  placeholder="Especificações do item, garantia, etc."
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
                  {saving ? 'Salvar...' : 'Salvar Equipamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão ("Confirmar antes de excluir") */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-2.5 rounded-full bg-rose-500/10">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Confirmar Exclusão de Item
              </h3>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              Você está prestes a excluir permanentemente o equipamento <strong>"{deletingProduct.name}"</strong> (Código: <code>{deletingProduct.code}</code>).
            </p>
            <p className="text-xs text-rose-500 font-medium">
              Aviso do Service Desk: Esta operação requer perfil Administrador e não poderá ser desfeita.
            </p>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
              <button
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteProduct}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors shadow-lg shadow-rose-600/25"
              >
                Sim, Excluir Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
