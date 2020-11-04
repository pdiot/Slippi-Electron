import { TestBed } from '@angular/core/testing';

import { StatsGraphService } from './stats-graph.service';

describe('StatsGraphService', () => {
  let service: StatsGraphService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatsGraphService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
