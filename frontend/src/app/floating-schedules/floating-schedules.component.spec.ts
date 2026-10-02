import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingSchedulesComponent } from './floating-schedules.component';
import * as signalR from '@microsoft/signalr';
describe('FloatingSchedulesComponent', () => {
  let component: FloatingSchedulesComponent;
  let fixture: ComponentFixture<FloatingSchedulesComponent>;

  beforeEach(async () => {

    vi.spyOn(signalR.HubConnection.prototype, 'start').mockResolvedValue();
    await TestBed.configureTestingModule({
      declarations: [FloatingSchedulesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FloatingSchedulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  afterEach(() => {
    vi.restoreAllMocks();
  });afterEach(() => {
    vi.restoreAllMocks();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
