import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

export interface ExportData {
  title: string;
  headers: string[];
  data: any[][];
  stats?: { label: string; value: string | number }[];
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  // Export data to Excel format
  exportToExcel(exportData: ExportData, filename: string): void {
    const workbook = XLSX.utils.book_new();

    // Create main data sheet
    const worksheetData = [
      [exportData.title],
      [],
      exportData.headers,
      ...exportData.data
    ];

    // Add stats if available
    if (exportData.stats && exportData.stats.length > 0) {
      worksheetData.push([]);
      worksheetData.push(['Statistics']);
      exportData.stats.forEach(stat => {
        worksheetData.push([stat.label, stat.value]);
      });
    }

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    worksheet['!cols'] = exportData.headers.map(() => ({ wch: 20 }));

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }

  // Export data to CSV format
  exportToCSV(exportData: ExportData, filename: string): void {
    let csvContent = `${exportData.title}\n\n`;

    // Add headers
    csvContent += exportData.headers.join(',') + '\n';

    // Add data rows
    exportData.data.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    // Add stats if available
    if (exportData.stats && exportData.stats.length > 0) {
      csvContent += '\nStatistics\n';
      exportData.stats.forEach(stat => {
        csvContent += `"${stat.label}","${stat.value}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, `${filename}.csv`);
  }

  // Export data to PDF format (simple text-based PDF)
  exportToPDF(exportData: ExportData, filename: string): void {
    // Create HTML content for PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${exportData.title}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            color: #333;
          }
          h1 {
            color: #69040C;
            border-bottom: 3px solid #69040C;
            padding-bottom: 10px;
            margin-bottom: 30px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th {
            background-color: #69040C;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
          }
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #e0e0e0;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .stats-section {
            margin-top: 30px;
            padding: 20px;
            background-color: #f5f5f5;
            border-radius: 8px;
          }
          .stats-section h2 {
            color: #69040C;
            margin-top: 0;
          }
          .stat-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #ddd;
          }
          .stat-label {
            font-weight: 600;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <h1>${exportData.title}</h1>
        <table>
          <thead>
            <tr>
              ${exportData.headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${exportData.data.map(row => `
              <tr>
                ${row.map(cell => `<td>${cell}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
    `;

    // Add stats if available
    if (exportData.stats && exportData.stats.length > 0) {
      htmlContent += `
        <div class="stats-section">
          <h2>Statistics Summary</h2>
          ${exportData.stats.map(stat => `
            <div class="stat-item">
              <span class="stat-label">${stat.label}:</span>
              <span>${stat.value}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    htmlContent += `
        <div class="footer">
          <p>Generated on ${new Date().toLocaleString()}</p>
          <p>Campus Facility Reservation and Equipment Borrowing System</p>
        </div>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.html`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Helper method to download blob
  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}