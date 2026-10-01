import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentTaskDefinitionComponent } from './agent-task-definition.component';
import { AccountsModule } from '../accounts.module';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('AgentTaskDefinitionComponent', () => {
  let component: AgentTaskDefinitionComponent;
  let fixture: ComponentFixture<AgentTaskDefinitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountsModule],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AgentTaskDefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
