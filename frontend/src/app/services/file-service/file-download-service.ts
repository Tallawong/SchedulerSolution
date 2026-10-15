import { HttpClient, HttpEvent } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FileDownloadService {
  private readonly http = inject(HttpClient);

  downloadFile(url: string): Observable<Blob> {
    return this.http.get(url, { responseType: 'blob' });
  }

  downloadFileWithProgress(url: string): Observable<HttpEvent<Blob>> {
    return this.http.get(url, {
      observe: 'events',
      reportProgress: true,
      responseType: 'blob',
    });
  }
}