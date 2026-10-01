import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbdModalConfirmComponent } from './ngbd-modal-confirm.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

describe('NgbdModalConfirmComponent', () => {
  let component: NgbdModalConfirmComponent;
  let fixture: ComponentFixture<NgbdModalConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgbdModalConfirmComponent],
      providers: [NgbActiveModal],
    }).compileComponents();

    fixture = TestBed.createComponent(NgbdModalConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
