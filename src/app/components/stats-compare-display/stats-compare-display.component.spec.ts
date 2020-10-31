import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsCompareDisplayComponent } from './stats-compare-display.component';

describe('StatsCompareDisplayComponent', () => {
  let component: StatsCompareDisplayComponent;
  let fixture: ComponentFixture<StatsCompareDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatsCompareDisplayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatsCompareDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
