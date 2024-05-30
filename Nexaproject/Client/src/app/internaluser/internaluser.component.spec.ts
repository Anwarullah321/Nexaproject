import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternalwelcomeComponent } from './internaluser.component';

describe('InternalwelcomeComponent', () => {
  let component: InternalwelcomeComponent;
  let fixture: ComponentFixture<InternalwelcomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InternalwelcomeComponent]
    });
    fixture = TestBed.createComponent(InternalwelcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
