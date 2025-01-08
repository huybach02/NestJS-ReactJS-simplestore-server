import { Controller, Get, SetMetadata } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @SetMetadata('isPublic', true)
  @Get()
  async getDashboard() {
    return this.dashboardService.getDashboard();
  }
}
