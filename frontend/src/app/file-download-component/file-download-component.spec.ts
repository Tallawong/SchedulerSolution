import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EMPTY } from 'rxjs';
import { vi } from 'vitest';
import { FileDownloadService } from '../services/file-service/file-download-service';
import { FileDownloadComponent } from './file-download-component';

describe('FileDownloadComponent', () => {
  let component: FileDownloadComponent;
  let fixture: ComponentFixture<FileDownloadComponent>;
  let downloadFile: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    downloadFile = vi.fn(() => EMPTY);
    await TestBed.configureTestingModule({
      imports: [FileDownloadComponent],
      providers: [{ provide: FileDownloadService, useValue: { downloadFile } }],
    }).compileComponents();

    fixture = TestBed.createComponent(FileDownloadComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('disables downloading until a URL is supplied', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBe(true);

    component.fileUrl = '/reports/1';
    component.fileModel.set({ fileId: 'report.pdf' });
    fixture.detectChanges();
    expect(button.disabled).toBe(false);
  });

  it('submits the encoded file ID without navigating the browser', () => {
    component.fileUrl = '/api/files/download';
    component.fileModel.set({ fileId: 'annual report.pdf' });
    fixture.detectChanges();

    const event = new Event('submit', { bubbles: true, cancelable: true });
    fixture.nativeElement.querySelector('form').dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(downloadFile).toHaveBeenCalledWith('/api/files/download/annual%20report.pdf');
  });
});
