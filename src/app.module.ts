import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ObserveModule } from './observe.js';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: requireEnv('OBSERVE_APP_KEY'),
      appSecret: requireEnv('OBSERVE_APP_SECRET'),
      serviceId: 'just-fit',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
