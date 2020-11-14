import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsDisplayReworkComponent } from './stats-display-rework.component';

describe('StatsDisplayReworkComponent', () => {
  let component: StatsDisplayReworkComponent;
  let fixture: ComponentFixture<StatsDisplayReworkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatsDisplayReworkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatsDisplayReworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
