import { Module } from '@nestjs/common';
import { registerModuleBoundary } from '@garazo/server-core';

export const apiModuleBoundary = registerModuleBoundary('api-root');

@Module({})
export class AppModule {}
