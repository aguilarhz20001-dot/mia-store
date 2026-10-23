import type { CashMovementRow, ExpenseRow, PurchaseRow, SaleRow } from "./types";

const money = (n: number) => Math.round(n * 100) / 100;

/**
 * Dinero en caja = lo que se metió − lo que se sacó + lo que entró por ventas
 *                  − compras pagadas con la caja − gastos pagados con la caja.
 */
export function computeCash(purchases: PurchaseRow[], sales: SaleRow[], expenses: ExpenseRow[], movements: CashMovementRow[]) {
  const salesIn = sales.reduce((n, s) => n + s.qty * Number(s.unit_price), 0);
  const purchasesOut = purchases.filter((p) => p.paid_from === "caja").reduce((n, p) => n + p.qty * Number(p.unit_cost), 0);
  const expensesOut = expenses.filter((e) => e.paid_from === "caja").reduce((n, e) => n + Number(e.amount), 0);
  const deposits = movements.filter((m) => m.kind === "deposito").reduce((n, m) => n + Number(m.amount), 0);
  const withdrawals = movements.filter((m) => m.kind === "retiro").reduce((n, m) => n + Number(m.amount), 0);
  return {
    salesIn: money(salesIn),
    purchasesOut: money(purchasesOut),
    expensesOut: money(expensesOut),
    deposits: money(deposits),
    withdrawals: money(withdrawals),
    balance: money(deposits - withdrawals + salesIn - purchasesOut - expensesOut),
  };
}
