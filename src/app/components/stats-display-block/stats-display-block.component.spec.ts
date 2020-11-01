import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsDisplayBlockComponent } from './stats-display-block.component';

describe('StatsDisplayBlockComponent', () => {
  let component: StatsDisplayBlockComponent;
  let fixture: ComponentFixture<StatsDisplayBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatsDisplayBlockComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatsDisplayBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
