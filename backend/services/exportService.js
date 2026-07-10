// backend/services/exportService.js
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// ============ EXPORT TO EXCEL ============
const exportToExcel = async(data, columns, filename, sheetName = 'Data') => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Header
    worksheet.columns = columns.map(col => ({
        header: col.header,
        key: col.key,
        width: 20
    }));

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF5790AB' }
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' } };

    // Data
    data.forEach(row => {
        const rowData = {};
        columns.forEach(col => {
            let value = row[col.key];
            if (value instanceof Date) {
                value = value.toLocaleDateString('id-ID');
            }
            rowData[col.key] = value !== null && value !== undefined ? value : '-';
        });
        worksheet.addRow(rowData);
    });

    // Auto filter
    worksheet.autoFilter = {
        from: 'A1',
        to: `${String.fromCharCode(64 + columns.length)}${data.length + 1}`
    };

    // Directory
    const dir = './uploads/reports';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, `${filename}.xlsx`);
    await workbook.xlsx.writeFile(filePath);

    return {
        filePath,
        filename: `${filename}.xlsx`
    };
};

// ============ EXPORT TO PDF ============
const exportToPDF = async(data, columns, title, filename) => {
    const dir = './uploads/reports';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, `${filename}.pdf`);
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Title
    doc.fontSize(18).font('Helvetica-Bold').text(title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica')
        .text(`Tanggal Export: ${new Date().toLocaleDateString('id-ID')}`, { align: 'center' });
    doc.moveDown(2);

    // Table
    const tableTop = 120;
    const tableLeft = 30;
    const colWidth = (doc.page.width - 60) / columns.length;
    const rowHeight = 20;

    // Header
    doc.font('Helvetica-Bold').fontSize(8);
    columns.forEach((col, i) => {
        const x = tableLeft + (i * colWidth);
        doc.text(col.header, x, tableTop, { width: colWidth, align: 'center' });
    });

    // Border header
    doc.rect(tableLeft, tableTop - 4, doc.page.width - 60, rowHeight).stroke();

    // Data
    let y = tableTop + rowHeight;
    doc.font('Helvetica').fontSize(7);
    data.slice(0, 50).forEach((row) => {
        columns.forEach((col, i) => {
            const x = tableLeft + (i * colWidth);
            let value = row[col.key];
            if (value instanceof Date) {
                value = value.toLocaleDateString('id-ID');
            }
            if (value === null || value === undefined) value = '-';
            doc.text(value.toString(), x, y, { width: colWidth, align: 'center' });
        });
        y += rowHeight;

        doc.rect(tableLeft, y - rowHeight, doc.page.width - 60, rowHeight).stroke();

        if (y > 750) {
            doc.addPage();
            y = 50;
        }
    });

    // Footer
    if (data.length > 50) {
        doc.moveDown();
        doc.fontSize(8).text(`* Menampilkan 50 dari ${data.length} data`, { align: 'center' });
    }

    doc.end();

    return new Promise((resolve) => {
        stream.on('finish', () => {
            resolve({
                filePath,
                filename: `${filename}.pdf`
            });
        });
    });
};

// ============ EXPORT TO CSV ============
const exportToCSV = async(data, columns, filename) => {
    const dir = './uploads/reports';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, `${filename}.csv`);

    // Header
    let csv = columns.map(col => `"${col.header}"`).join(',') + '\n';

    // Data
    data.forEach(row => {
        const rowData = columns.map(col => {
            let value = row[col.key];
            if (value instanceof Date) {
                value = value.toLocaleDateString('id-ID');
            }
            if (value === null || value === undefined) value = '-';
            return `"${value}"`;
        });
        csv += rowData.join(',') + '\n';
    });

    fs.writeFileSync(filePath, csv, 'utf8');

    return {
        filePath,
        filename: `${filename}.csv`
    };
};

module.exports = {
    exportToExcel,
    exportToPDF,
    exportToCSV
};