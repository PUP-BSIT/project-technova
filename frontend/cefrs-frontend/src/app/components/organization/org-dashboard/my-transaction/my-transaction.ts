import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLogService, AuditLog } from '../../../../services/audit-log.service';

@Component({
  selector: 'app-org-my-transaction',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './my-transaction.html',
  styleUrls: ['./my-transaction.scss']
})
export class OrgMyTransactionComponent implements OnInit {
  private auditLogService = inject(AuditLogService);

  auditLogs: AuditLog[] = [];
  isLoadingLogs = false;
  searchQuery = '';

  ngOnInit(): void {
    this.fetchAuditLogs();
  }

  fetchAuditLogs(): void {
    this.isLoadingLogs = true;
    this.auditLogService.getMyAuditLogs().subscribe({
      next: (logs: AuditLog[]) => {
        this.auditLogs = logs;
        this.isLoadingLogs = false;
      },
      error: (err: any) => {
        console.error('Error fetching audit logs:', err);
        this.isLoadingLogs = false;
      }
    });
  }

  get filteredLogs(): AuditLog[] {
    if (!this.searchQuery) {
      return this.auditLogs;
    }

    const query = this.searchQuery.toLowerCase();
    return this.auditLogs.filter(log =>
      log.actionType?.toLowerCase().includes(query) ||
      log.tableName?.toLowerCase().includes(query) ||
      log.oldValues?.toLowerCase().includes(query) ||
      log.newValues?.toLowerCase().includes(query)
    );
  }
}

