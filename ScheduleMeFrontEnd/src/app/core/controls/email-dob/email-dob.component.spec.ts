/// <reference types="jasmine" />

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailAndDobComponent } from './email-dob.component';

describe('EmailAndDobComponent', () => {
  let component: EmailAndDobComponent;
  let fixture: ComponentFixture<EmailAndDobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailAndDobComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailAndDobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
