import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de requisição para enviar o perfil de teste atual do Service Desk
api.interceptors.request.use((config) => {
  const role = localStorage.getItem('omnistock_role') || 'ADMIN';
  config.headers['X-User-Role'] = role;
  return config;
});

// Interceptor para tratamento de erro amigável
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erro de requisição API:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Métodos de Produtos (TI Service Desk)
export const getProducts = async (params?: any) => {
  const { data } = await api.get('/products', { params });
  return data;
};

export const getProductById = async (id: string) => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

export const createProduct = async (productData: any) => {
  const { data } = await api.post('/products', productData);
  return data;
};

export const updateProduct = async (id: string, productData: any) => {
  const { data } = await api.put(`/products/${id}`, productData);
  return data;
};

export const deleteProduct = async (id: string) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};

// Categorias e Fornecedores
export const getCategories = async () => {
  const { data } = await api.get('/categories');
  return data;
};

export const getSuppliers = async () => {
  const { data } = await api.get('/suppliers');
  return data;
};

// Movimentações (Entrada, Saída, Empréstimo, Devolução, Baixa)
export const getMovements = async (params?: any) => {
  const { data } = await api.get('/movements', { params });
  return data;
};

export const createMovement = async (movementData: any) => {
  const { data } = await api.post('/movements', movementData);
  return data;
};

// Empréstimos de TI
export const getLoans = async (status?: string) => {
  const { data } = await api.get('/loans', { params: status ? { status } : {} });
  return data;
};

export const createLoan = async (loanData: any) => {
  const { data } = await api.post('/loans', loanData);
  return data;
};

export const returnLoan = async (id: string) => {
  const { data } = await api.post(`/loans/${id}/return`);
  return data;
};

// KPIs e Gráficos do Dashboard
export const getDashboardKPIs = async () => {
  const { data } = await api.get('/reports/kpis');
  return data;
};

export const getDashboardCharts = async () => {
  const { data } = await api.get('/reports/charts');
  return data;
};

// Alertas e Auditoria
export const getAlerts = async () => {
  const { data } = await api.get('/alerts');
  return data;
};

export const markAlertAsRead = async (id: string) => {
  const { data } = await api.patch(`/alerts/${id}/read`);
  return data;
};

export const getAuditLogs = async (limit = 100) => {
  const { data } = await api.get(`/audit-logs?limit=${limit}`);
  return data;
};

// Download Helpers para Exportação PDF / Excel
export const downloadFile = async (endpoint: string, fallbackFilename: string) => {
  const response = await api.get(endpoint, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;

  // Tenta extrair nome do header Content-Disposition
  const disposition = response.headers['content-disposition'];
  let filename = fallbackFilename;
  if (disposition && disposition.indexOf('attachment') !== -1) {
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(disposition);
    if (matches != null && matches[1]) {
      filename = matches[1].replace(/['"]/g, '');
    }
  }

  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};
