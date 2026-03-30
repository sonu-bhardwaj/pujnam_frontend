import jsPDF from "jspdf";
import "jspdf-autotable";
import { Order, OrderItem, Product } from "../types";

export const generateOrderInvoicePDF = (order: Order) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const invoiceNumber = order.invoiceNumber || `INV-${Date.now()}`;
  const orderId = order.id || (order as unknown as { _id?: string })._id || "";
  const customer = (order.shippingAddress || order.shipping_address || {}) as { name?: string; email?: string; phone?: string; street?: string; address?: string; city?: string; state?: string; zipCode?: string; pincode?: string };

  doc.setFontSize(22);
  doc.setTextColor("#FF8C00");
  doc.text("Pujnam Store", 40, 50);

  doc.setFontSize(14);
  doc.setTextColor("#000000");
  doc.text(`Invoice #${invoiceNumber}`, 40, 80);
  doc.text(`Order ID: ${String(orderId).slice(-8).toUpperCase()}`, 40, 100);
  doc.text(`Date: ${new Date(order.createdAt || order.created_at || Date.now()).toLocaleString()}`, 40, 120);

  doc.setFontSize(12);
  doc.text("Billing / Shipping", 40, 160);
  doc.setFontSize(10);
  doc.text(`Name: ${customer.name || "N/A"}`, 40, 178);
  doc.text(`Email: ${customer.email || "N/A"}`, 40, 194);
  doc.text(`Phone: ${customer.phone || "N/A"}`, 40, 210);
  doc.text(`Address: ${(customer.street || customer.address || "")} ${customer.city || ""} ${customer.state || ""} ${customer.zipCode || customer.pincode || ""}`, 40, 226);

  const itemRows = (order.items || []).map((item: OrderItem, idx: number) => {
    const product = item.product as Product | undefined;
    const name = item.name || product?.name || "Item";
    const quantity = item.quantity || 0;
    const price = item.price || 0;
    const total = quantity * price;
    return [String(idx + 1), name, String(quantity), `₹${price.toFixed(2)}`, `₹${total.toFixed(2)}`];
  });

  type PdfAutoTable = jsPDF & {
    autoTable: (options: {
      head: string[][];
      body: string[][];
      startY: number;
      styles: { fontSize: number };
      headStyles: { fillColor: string; textColor: string };
    }) => void;
    lastAutoTable: { finalY: number };
  };

  const pdfDoc = doc as PdfAutoTable;
  pdfDoc.autoTable({
    head: [["#", "Product", "Qty", "Unit Price", "Total"]],
    body: itemRows,
    startY: 250,
    styles: { fontSize: 10 },
    headStyles: { fillColor: "#FF8C00", textColor: "#ffffff" },
  });

  const startY = pdfDoc.lastAutoTable.finalY + 20;

  doc.setFontSize(12);
  doc.text(`Subtotal: ₹${Number(order.subtotal || 0).toFixed(2)}`, 400, startY);
  doc.text(`Shipping: ₹${Number(order.shippingCost || order.shipping_cost || 0).toFixed(2)}`, 400, startY + 16);
  doc.text(`Tax: ₹${Number(order.tax || 0).toFixed(2)}`, 400, startY + 32);
  doc.text(`Total: ₹${Number(order.total || 0).toFixed(2)}`, 400, startY + 50);

  doc.text(`Payment Method: ${(order.paymentMethod || order.payment_method || "N/A").toUpperCase()}`, 40, startY);
  doc.text(`Payment Status: ${(order.paymentStatus || order.payment_status || "pending").toUpperCase()}`, 40, startY + 16);

  const filename = `${invoiceNumber || "invoice"}-${String(orderId).slice(-8)}.pdf`;
  doc.save(filename);
};