// E00-T02 · system module. Public surface of the system slice (ADR-0002).

import { Module } from '@nestjs/common';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';

/**
 * No provider binding for READINESS_CHECK or WALKING_SKELETON_PROBE here.
 *
 * T04 owns those implementations. Until then the service reports "not ready"
 * and the probe route reports the database as unavailable, which is the honest
 * answer for a skeleton with no datastore wired.
 */
@Module({
  controllers: [SystemController],
  providers: [SystemService],
  exports: [SystemService],
})
export class SystemModule {}
