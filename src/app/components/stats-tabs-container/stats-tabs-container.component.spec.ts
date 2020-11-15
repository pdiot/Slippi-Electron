import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsTabsContainerComponent } from './stats-tabs-container.component';

describe('StatsTabsContainerComponent', () => {
  let component: StatsTabsContainerComponent;
  let fixture: ComponentFixture<StatsTabsContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatsTabsContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatsTabsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
