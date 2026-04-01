import { Test, TestingModule } from '@nestjs/testing';
import { StaffDetailsController } from './staff_details.controller';
import { StaffDetailsService } from './staff_details.service';

describe('StaffDetailsController', () => {
  let controller: StaffDetailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaffDetailsController],
      providers: [StaffDetailsService],
    }).compile();

    controller = module.get<StaffDetailsController>(StaffDetailsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
