import { TestBed } from '@angular/core/testing';
import { DateTime } from 'luxon';
import { ScheduleDateTimeComponent } from './schedule-date-time.component';

describe('ScheduleDateTimeComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [ScheduleDateTimeComponent] });
    const fixture = TestBed.createComponent(ScheduleDateTimeComponent);
    return { fixture, component: fixture.componentInstance };
  }

  it('preserves the time when the date changes', () => {
    const { component } = setup();
    let result: Date | null = null;
    component.registerOnChange((value) => (result = value));
    component.writeValue(new Date(2026, 8, 17, 14, 35));
    component.dateControl.setValue(DateTime.fromJSDate(new Date(2026, 8, 22)));
    expect(result).toEqual(new Date(2026, 8, 22, 14, 35));
  });

  it('preserves the date when the time changes', () => {
    const { component } = setup();
    let result: Date | null = null;
    component.registerOnChange((value) => (result = value));
    component.writeValue(new Date(2026, 8, 17, 14, 35));
    component.timeControl.setValue(DateTime.fromJSDate(new Date(2000, 0, 1, 8, 5)));
    expect(result).toEqual(new Date(2026, 8, 17, 8, 5));
  });

  it('updates the form before notifying scheduling handlers', () => {
    const { component } = setup();
    let formValue: Date | null = null;
    component.registerOnChange((value) => (formValue = value));
    component.writeValue(new Date(2026, 8, 17, 14, 35));
    component.dateChange.subscribe((event) => expect(formValue).toEqual(event.value));
    component.timeControl.setValue(DateTime.fromJSDate(new Date(2000, 0, 1, 9, 15)));
    expect(formValue).toEqual(new Date(2026, 8, 17, 9, 15));
  });

  it('does not emit changes when a saved schedule is loaded', () => {
    const { component } = setup();
    let calls = 0;
    component.registerOnChange(() => calls++);
    component.writeValue(new Date(2026, 8, 17, 14, 35));
    expect(calls).toBe(0);
    expect(component.dateControl.value?.day).toBe(17);
    expect(component.timeControl.value?.hour).toBe(14);
  });

  it('clears the combined value when either input is cleared', () => {
    const { component } = setup();
    let result: Date | null = new Date();
    component.registerOnChange((value) => (result = value));
    component.writeValue(new Date(2026, 8, 17, 14, 35));
    component.timeControl.setValue(null);
    expect(result).toBeNull();
  });

  it('disables both inputs without emitting a value change', () => {
    const { component } = setup();
    let calls = 0;
    component.registerOnChange(() => calls++);
    component.setDisabledState(true);
    expect(component.dateControl.disabled).toBe(true);
    expect(component.timeControl.disabled).toBe(true);
    expect(calls).toBe(0);
    component.setDisabledState(false);
    expect(component.dateControl.enabled).toBe(true);
    expect(component.timeControl.enabled).toBe(true);
  });

  it('renders both Material inputs', async () => {
    const { fixture } = setup();
    fixture.componentInstance.writeValue(new Date(2026, 8, 17, 14, 35));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector('input[matInput][placeholder="DD-MM-YYYY"]'),
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('input[matInput][placeholder="HH:mm"]'),
    ).toBeTruthy();
  });
});
