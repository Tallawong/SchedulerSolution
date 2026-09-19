import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { App } from './app';
import { AccountService } from './services/account/account.service';

@Component({ selector: 'alert', standalone: true, template: '' })
class AlertStubComponent {}

describe('App', () => {
  let logoutCalls: number;

  beforeEach(async () => {
    logoutCalls = 0;
    await TestBed.configureTestingModule({
      imports: [CommonModule, RouterModule.forRoot([]), AlertStubComponent],
      declarations: [App],
      providers: [
        {
          provide: AccountService,
          useValue: {
            account: of(null),
            accountValue: null,
            logout: () => logoutCalls++,
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the shell without authenticated navigation when logged out', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.app-container')).toBeTruthy();
    expect(compiled.querySelector('nav')).toBeNull();
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('should delegate logout to the account service', () => {
    const fixture = TestBed.createComponent(App);
    fixture.componentInstance.logout();
    expect(logoutCalls).toBe(1);
  });
});
