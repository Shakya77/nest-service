import { Test, TestingModule } from '@nestjs/testing';
import { StaffDetailsService } from './staff_details.service';

describe('StaffDetailsService', () => {
  let service: StaffDetailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StaffDetailsService],
    }).compile();

    service = module.get<StaffDetailsService>(StaffDetailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
