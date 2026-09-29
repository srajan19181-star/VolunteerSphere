const { Parser } = require('json2csv');
const jsPDF = require('jspdf');

/**
 * Generate CSV buffer from data array
 */
const generateCSV = (data, fields) => {
  try {
    const parser = new Parser({ fields });
    return parser.parse(data);
  } catch (error) {
    throw new Error(`CSV generation failed: ${error.message}`);
  }
};

/**
 * Generate PDF buffer with autoTable
 * Uses jsPDF with manual table rendering (no autoTable plugin needed)
 */
const generatePDF = (title, headers, rows, summary = '') => {
  try {
    const doc = new jsPDF.jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // Header bar
    doc.setFillColor(124, 58, 237);
    doc.rect(0, 0, 297, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('VolunteerSphere', 10, 13);

    // Title
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(18);
    doc.text(title, 10, 35);

    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 10, 43);

    if (summary) {
      doc.text(summary, 10, 50);
    }

    // Table
    const startY = summary ? 58 : 52;
    const colWidth = Math.floor((277) / headers.length);
    let y = startY;

    // Header row
    doc.setFillColor(124, 58, 237);
    doc.rect(10, y, 277, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    headers.forEach((h, i) => {
      doc.text(String(h), 12 + i * colWidth, y + 5.5);
    });
    y += 10;

    // Data rows
    doc.setFont('helvetica', 'normal');
    rows.forEach((row, rowIdx) => {
      if (y > 185) {
        doc.addPage();
        y = 20;
      }
      if (rowIdx % 2 === 0) {
        doc.setFillColor(245, 245, 255);
        doc.rect(10, y, 277, 8, 'F');
      }
      doc.setTextColor(30, 30, 30);
      row.forEach((cell, i) => {
        doc.text(String(cell ?? '').substring(0, 20), 12 + i * colWidth, y + 5.5);
      });
      y += 9;
    });

    return doc.output('arraybuffer');
  } catch (error) {
    throw new Error(`PDF generation failed: ${error.message}`);
  }
};

module.exports = { generateCSV, generatePDF };
