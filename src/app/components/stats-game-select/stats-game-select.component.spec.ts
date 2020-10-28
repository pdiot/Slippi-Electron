import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsGameSelectComponent } from './stats-game-select.component';

describe('StatsGameSelectComponent', () => {
  let component: StatsGameSelectComponent;
  let fixture: ComponentFixture<StatsGameSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatsGameSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatsGameSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
