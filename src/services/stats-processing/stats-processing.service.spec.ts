import { TestBed } from '@angular/core/testing';

import { StatsProcessingService } from './stats-processing.service';

describe('StatsProcessingService', () => {
  let service: StatsProcessingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatsProcessingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
