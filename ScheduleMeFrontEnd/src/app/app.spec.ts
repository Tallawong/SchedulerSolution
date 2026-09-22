import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { vi } from 'vitest';
import { App } from './app';
import { Account, Role } from './entities';
import { AccountService } from './services/account/account.service';

@Component({ selector: 'alert', standalone: true, template: '' })
class AlertStubComponent {}

describe('App', () => {
  let logoutCalls: number;
  let account: BehaviorSubject<Account | null>;

  beforeEach(async () => {
    logoutCalls = 0;
    account = new BehaviorSubject<Account | null>(null);
    await TestBed.configureTestingModule({
      imports: [CommonModule, RouterModule.forRoot([]), AlertStubComponent],
      declarations: [App],
      providers: [
        {
          provide: AccountService,
          useValue: {
            account: account.asObservable(),
            get accountValue() { return account.value; },
            logout: () => {
              logoutCalls++;
              account.next(null);
            },
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

  it('logs out from the navigation button without issuing a competing route change', async () => {
    const signedIn = new Account();
    signedIn.role = Role.User;
    account.next(signedIn);
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl');
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('nav button');

    expect(button).not.toBeNull();
    expect(button.type).toBe('button');
    expect(button.textContent).toContain('Logout');
    button.click();
    fixture.detectChanges();

    expect(logoutCalls).toBe(1);
    expect(navigateByUrl).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('nav')).toBeNull();
  });
});
