import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppTourComponent } from './app-tour.component';

describe('AppTourComponent', () => {
  let component: AppTourComponent;
  let fixture: ComponentFixture<AppTourComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppTourComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppTourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
