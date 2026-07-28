"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSlaDueDate = calculateSlaDueDate;
exports.determineSlaStatus = determineSlaStatus;
/**
 * Calcula a data limite do SLA (slaDueAt) baseada no número de horas padrão da categoria/subcategoria
 * e na prioridade selecionada para o chamado.
 */
function calculateSlaDueDate(baseSlaHours, priority) {
    let multiplier = 1.0;
    switch (priority) {
        case 'CRITICAL':
            multiplier = 0.25; // 4x mais rápido
            break;
        case 'HIGH':
            multiplier = 0.5; // 2x mais rápido
            break;
        case 'MEDIUM':
            multiplier = 1.0;
            break;
        case 'LOW':
            multiplier = 1.5;
            break;
    }
    const actualHours = Math.max(1, Math.round(baseSlaHours * multiplier));
    const dueDate = new Date();
    dueDate.setHours(dueDate.getHours() + actualHours);
    return dueDate;
}
/**
 * Determina o status atual do SLA em relação à data atual ou data de encerramento
 */
function determineSlaStatus(slaDueAt, closedAt) {
    const referenceDate = closedAt ? new Date(closedAt) : new Date();
    const due = new Date(slaDueAt);
    if (referenceDate > due) {
        return 'OVERDUE';
    }
    // Se estiver a menos de 25% do tempo restante, colocar em WARNING
    const diffHours = (due.getTime() - referenceDate.getTime()) / (1000 * 60 * 60);
    if (diffHours <= 2 && diffHours > 0) {
        return 'WARNING';
    }
    return 'ON_TIME';
}
