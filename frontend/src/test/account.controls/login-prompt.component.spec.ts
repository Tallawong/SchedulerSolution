import { TestBed } from "@angular/core/testing";
import { LoginPromptComponent } from "../../app/account.controls/login-prompt.component";

describe('LoginPromptComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPromptComponent], // or declarations if using NgModule
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(LoginPromptComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(LoginPromptComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h3')?.textContent).toContain('Welcome back');
  });
});
