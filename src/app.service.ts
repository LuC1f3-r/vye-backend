import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: 'vye-backend',
      scope: 'mvp',
      modules: ['auth', 'tracking', 'content', 'billing'],
      timestamp: new Date().toISOString(),
    };
  }
}
