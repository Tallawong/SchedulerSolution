import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSlotTasksEditorComponent } from './time-slot-tasks-editor.component';
import { AccountsModule } from '../accounts.module';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AccountService, AlertService } from 'src/app/services';

describe('TimeSlotTasksEditorComponent', () => {
  let component: TimeSlotTasksEditorComponent;
  let fixture: ComponentFixture<TimeSlotTasksEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountsModule],
      providers: [
        provideRouter([]),
        {
          provide: AccountService,
          useValue: {
            getAllAgentTaskConfigs: () => of([{ agentTaskStr: 'Greeter', isGroup: false }]),
            getTimeSlotsTasks: () => of([{ date: '01-01-2030 09:00', tasks: 'Greeter Greeter' }]),
          },
        },
        { provide: AlertService, useValue: { clear: vi.fn(), error: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeSlotTasksEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders task counters and disables Add/Update when the form is invalid', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('.task-counter input');
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.time-slot-form .time-slot-action');
    expect(input.value).toBe('0');
    expect(button.disabled).toBe(false);

    input.value = '';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(button.disabled).toBe(true);

    input.value = '2';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(button.disabled).toBe(false);
    const addUpdate = vi.spyOn(component, 'onAddUpdateTimeSlot').mockImplementation(() => {});
    button.click();
    expect(addUpdate).toHaveBeenCalledOnce();
  });

  it('renders time slots and selects a row for editing', () => {
    const row: HTMLElement = fixture.nativeElement.querySelector('mat-row');
    expect(row.querySelector('input')?.value).toBe('01-01-2030 09:00');
    row.click();
    fixture.detectChanges();
    expect(component.f['Greeter'].value).toBe(2);
    expect(row.classList.contains('highlighted')).toBe(true);
    expect(fixture.nativeElement.querySelector('a[routerLink="../"]').textContent).toContain('Back');
  });
});
