import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Dashboard01Component } from './dashboard01.component';

describe('Dashboard01Component', () => {
  let component: Dashboard01Component;
  let fixture: ComponentFixture<Dashboard01Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Dashboard01Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Dashboard01Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
