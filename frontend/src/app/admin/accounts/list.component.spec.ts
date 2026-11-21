import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of, Subject, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Account, Role } from '../../entities';
import { AccountService, AlertService } from '../../services';
import { AccountsModule } from './accounts.module';
import { ListComponent } from './list.component';

describe('ListComponent schedule actions', () => {
  let fixture: ComponentFixture<ListComponent>;
  let component: ListComponent;
  let getAllDates: ReturnType<typeof vi.fn>;
  let generateSchedules: ReturnType<typeof vi.fn>;
  let deleteAccount: ReturnType<typeof vi.fn>;
  let deleteAllUserAccounts: ReturnType<typeof vi.fn>;
  let alertError: ReturnType<typeof vi.fn>;
  let download: Subject<Blob>;
  const emptyDates = { scheduleDateTimes: [] };
  const availableDates = { scheduleDateTimes: [{ id: 'schedule-1', date: '01-01-2030 09:00' }] };

  beforeEach(async () => {
    getAllDates = vi.fn().mockReturnValue(of(emptyDates));
    generateSchedules = vi.fn().mockReturnValue(of(true));
    deleteAccount = vi.fn().mockReturnValue(of({}));
    deleteAllUserAccounts = vi.fn().mockReturnValue(of([]));
    alertError = vi.fn();
    download = new Subject<Blob>();
    vi.spyOn(ListComponent.prototype, 'ngAfterViewInit').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [AccountsModule],
      providers: [
        provideRouter([]),
        {
          provide: AccountService,
          useValue: {
            getAllDates,
            generateSchedules,
            delete: deleteAccount,
            deleteAllUserAccounts,
            getAll: vi.fn().mockReturnValue(of([])),
            getAutoEmail: vi.fn().mockReturnValue(of(false)),
            downloadSchedulesFile: vi.fn().mockReturnValue(download),
          },
        },
        { provide: AlertService, useValue: { clear: vi.fn(), error: alertError } },
        {
          provide: NgbModal,
          useValue: { open: vi.fn().mockReturnValue({ componentInstance: {}, result: Promise.resolve(), close: vi.fn() }) },
        },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    fixture?.destroy();
    vi.restoreAllMocks();
  });

  function render(): void {
    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function buttons(): { modify: HTMLButtonElement; view: HTMLButtonElement; generate: HTMLButtonElement } {
    return {
      modify: Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
        .find((button) => button.textContent?.includes('Mod. Schedules'))!,
      view: fixture.nativeElement.querySelector('button[title="View Schedules in .pdf format"]'),
      generate: fixture.nativeElement.querySelector('button[title="Generate Schedules"]'),
    };
  }

  it('enables Delete Accounts only when accounts exist and schedule actions are not busy', () => {
    const generation = new Subject<boolean>();
    generateSchedules.mockReturnValue(generation);
    getAllDates.mockReturnValue(of(availableDates));
    render();
    const deleteButton: HTMLButtonElement = fixture.nativeElement.querySelector('button[title="Delete Accounts"]');
    expect(deleteButton.disabled).toBe(true);

    component.accounts.set([new Account()]);
    fixture.detectChanges();
    expect(deleteButton.disabled).toBe(false);

    buttons().generate.click();
    fixture.detectChanges();
    expect(deleteButton.disabled).toBe(true);

    generation.next(true);
    fixture.detectChanges();
    expect(deleteButton.disabled).toBe(false);

    buttons().view.click();
    fixture.detectChanges();
    expect(deleteButton.disabled).toBe(true);

    download.complete();
    fixture.detectChanges();
    expect(deleteButton.disabled).toBe(false);

    component.accounts.set([]);
    fixture.detectChanges();
    expect(deleteButton.disabled).toBe(true);
  });

  it('disables modify and view for an empty schedule list but permits generation', () => {
    render();
    expect(buttons().modify.disabled).toBe(true);
    expect(buttons().view.disabled).toBe(true);
    expect(buttons().generate.disabled).toBe(false);
  });

  it('enables modify and view when saved schedules exist', () => {
    getAllDates.mockReturnValue(of(availableDates));
    render();
    expect(buttons().modify.disabled).toBe(false);
    expect(buttons().view.disabled).toBe(false);
  });

  it('keeps schedule actions disabled while availability is loading or fails', () => {
    const result = new Subject<typeof emptyDates>();
    getAllDates.mockReturnValue(result);
    render();
    expect(buttons().modify.disabled).toBe(true);
    expect(buttons().view.disabled).toBe(true);

    const error = new Error('Unable to load schedules');
    result.error(error);
    fixture.detectChanges();
    expect(alertError).toHaveBeenCalledWith(error);
    expect(buttons().modify.disabled).toBe(true);
    expect(buttons().view.disabled).toBe(true);
  });

  it('refreshes availability after generation and respects busy states', () => {
    const generation = new Subject<boolean>();
    const refreshedDates = new Subject<typeof availableDates>();
    getAllDates.mockReturnValueOnce(of(emptyDates)).mockReturnValueOnce(refreshedDates);
    generateSchedules.mockReturnValue(generation);
    render();

    component.generateSchedules();
    fixture.detectChanges();
    expect(buttons().modify.disabled).toBe(true);
    expect(buttons().view.disabled).toBe(true);
    generation.next(true);
    fixture.detectChanges();
    expect(buttons().modify.disabled).toBe(true);
    expect(buttons().view.disabled).toBe(true);

    refreshedDates.next(availableDates);
    fixture.detectChanges();
    expect(buttons().modify.disabled).toBe(false);
    expect(buttons().view.disabled).toBe(false);
    buttons().view.click();
    fixture.detectChanges();
    expect(buttons().modify.disabled).toBe(true);
    expect(buttons().view.disabled).toBe(true);
    download.complete();
    fixture.detectChanges();
    expect(buttons().modify.disabled).toBe(false);
    expect(buttons().view.disabled).toBe(false);
  });

  it('reenables generation after an empty result', () => {
    const generation = new Subject<boolean>();
    generateSchedules.mockReturnValue(generation);
    render();

    buttons().generate.click();
    fixture.detectChanges();
    expect(buttons().generate.disabled).toBe(true);
    generation.next(true);
    fixture.detectChanges();

    expect(buttons().generate.disabled).toBe(false);
    expect(buttons().modify.disabled).toBe(true);
    expect(buttons().view.disabled).toBe(true);
  });

  it('refreshes availability even when generation fails', () => {
    const error = new Error('Generation failed');
    getAllDates.mockReturnValueOnce(of(availableDates)).mockReturnValueOnce(of(emptyDates));
    generateSchedules.mockReturnValue(throwError(() => error));
    render();
    component.generateSchedules();
    fixture.detectChanges();

    expect(alertError).toHaveBeenCalledWith(error);
    expect(getAllDates).toHaveBeenCalledTimes(2);
    expect(buttons().modify.disabled).toBe(true);
    expect(buttons().view.disabled).toBe(true);
  });

  it('ignores a stale availability response after generation', () => {
    const previous = new Subject<typeof availableDates>();
    getAllDates.mockReturnValueOnce(previous).mockReturnValueOnce(of(emptyDates));
    render();
    component.generateSchedules();
    previous.next(availableDates);
    fixture.detectChanges();

    expect(buttons().modify.disabled).toBe(true);
    expect(buttons().view.disabled).toBe(true);
  });

  it('refreshes availability after deleting an account', async () => {
    getAllDates.mockReturnValueOnce(of(availableDates)).mockReturnValueOnce(of(emptyDates));
    render();
    component.accounts.set([{ ...new Account(), id: 'account-1', role: Role.User }]);
    component.deleteAccount('account-1');
    await Promise.resolve();
    fixture.detectChanges();

    expect(deleteAccount).toHaveBeenCalledWith('account-1');
    expect(buttons().modify.disabled).toBe(true);
    expect(buttons().view.disabled).toBe(true);
  });

  it('refreshes availability after deleting all user accounts', async () => {
    getAllDates.mockReturnValueOnce(of(availableDates)).mockReturnValueOnce(of(emptyDates));
    render();
    component.onDeleteAllUserAccounts();
    await Promise.resolve();
    fixture.detectChanges();

    expect(deleteAllUserAccounts).toHaveBeenCalledOnce();
    expect(buttons().modify.disabled).toBe(true);
    expect(buttons().view.disabled).toBe(true);
  });
});
