import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) { }

  async record(actorUserId: string, action: string, affectedCount: number): Promise<AuditLog> {
    const entry = this.auditLogRepository.create({ actorUserId, action, affectedCount });
    return this.auditLogRepository.save(entry);
  }
}
