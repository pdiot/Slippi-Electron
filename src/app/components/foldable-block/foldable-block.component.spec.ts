import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoldableBlockComponent } from './foldable-block.component';

describe('FoldableBlockComponent', () => {
  let component: FoldableBlockComponent;
  let fixture: ComponentFixture<FoldableBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FoldableBlockComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FoldableBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
