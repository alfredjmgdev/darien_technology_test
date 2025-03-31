import { Injectable } from '@nestjs/common';
import { name, version } from '../package.json';

@Injectable()
export class AppService {
  getHealthCheck() {
    return {
      status: 'ok',
      message: `${name} is running on version ${version}`,
    };
  }
}
