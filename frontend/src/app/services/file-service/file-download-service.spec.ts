import { HttpEventType } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FileDownloadService } from './file-download-service';

describe('FileDownloadService', () => {
  let service: FileDownloadService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FileDownloadService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('downloads a blob from the supplied URL', () => {
    const blob = new Blob(['report'], { type: 'application/pdf' });
    let result: Blob | undefined;

    service.downloadFile('/reports/1').subscribe((download) => (result = download));
    const request = httpMock.expectOne('/reports/1');
    expect(request.request.method).toBe('GET');
    expect(request.request.responseType).toBe('blob');
    request.flush(blob);
    expect(result).toBe(blob);
  });

  it('exposes HTTP download progress when requested', () => {
    const progress: number[] = [];
    service.downloadFileWithProgress('/reports/1').subscribe((event) => {
      if (event.type === HttpEventType.DownloadProgress) progress.push(event.loaded);
    });

    const request = httpMock.expectOne('/reports/1');
    expect(request.request.reportProgress).toBe(true);
    request.event({ type: HttpEventType.DownloadProgress, loaded: 50, total: 100 });
    request.flush(new Blob(['report']));
    expect(progress).toEqual([50]);
  });
});
