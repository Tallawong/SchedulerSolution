import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentTaskDefinitionComponent } from './agent-task-definition.component';
import { AccountsModule } from '../accounts.module';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AccountService, AlertService } from 'src/app/services';

describe('AgentTaskDefinitionComponent', () => {
  let component: AgentTaskDefinitionComponent;
  let fixture: ComponentFixture<AgentTaskDefinitionComponent>;
  const task = { agentTaskStr: 'Greeter', isGroup: true, highlighted: false, isDeleting: false };
  let updateTask: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    updateTask = vi.fn().mockReturnValue(of([{ ...task }]));
    await TestBed.configureTestingModule({
      imports: [AccountsModule],
      providers: [
        provideRouter([]),
        { provide: AccountService, useValue: { getAllAgentTaskConfigs: () => of([{ ...task }]), updateAgentTaskConfig: updateTask } },
        { provide: AlertService, useValue: { clear: vi.fn(), error: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AgentTaskDefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('disables Add/Update until a task name is provided', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBe(true);
    expect(component.f['isGroupBox'].disabled).toBe(true);

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[formControlName="agentTaskName"]');
    input.value = 'Greeter';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(button.disabled).toBe(false);
    expect(component.f['isGroupBox'].enabled).toBe(true);
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(updateTask).toHaveBeenCalledWith('Greeter', expect.objectContaining({ agentTaskStr: 'Greeter', isGroup: false }));
  });

  it('renders tasks and selects a row for editing', () => {
    const row: HTMLElement = fixture.nativeElement.querySelector('mat-row');
    expect(row.querySelector('input')?.value).toBe('Greeter');
    row.click();
    fixture.detectChanges();
    expect(component.f['agentTaskName'].value).toBe('Greeter');
    expect(component.f['isGroupBox'].value).toBe(true);
    expect(row.classList.contains('highlighted')).toBe(true);
    expect(fixture.nativeElement.querySelector('a[routerLink="../"]').textContent).toContain('Back');
  });
});
