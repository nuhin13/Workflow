import { Module } from '@nestjs/common';
import { registerModuleBoundary } from '@garazo/server-core';

export const workerModuleBoundary = registerModuleBoundary('worker-root');

@Module({})
export class WorkerModule {}
