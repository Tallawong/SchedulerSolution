import { Component, Input, inject, signal } from '@angular/core';
import { FormField, form, required } from '@angular/forms/signals';
import { FileDownloadService } from '../services/file-service/file-download-service';

@Component({
  selector: 'app-file-download',
  standalone: true,
  imports: [FormField],
  template: `
    <form (submit)="onSubmit($event)">
      <div>
        <label for="fileId">File ID or name:</label>
        <input id="fileId" [formField]="downloadForm.fileId" />
      </div>
      <button type="submit" [disabled]="!fileUrl || downloadForm().invalid()">
        Download File
      </button>
    </form>
  `
})
export class FileDownloadComponent {
  // Base API URL, e.g. /api/files/download; the file ID is appended as a path segment.
  @Input() fileUrl = '/api/files/download';
  @Input() fileName = '';
  private fileService = inject(FileDownloadService);

  fileModel = signal({
    fileId: ''
  });

  downloadForm = form(this.fileModel, (path) => {
    required(path.fileId);
  });

  onSubmit(event: Event) {
    event.preventDefault();

    if (!this.fileUrl || this.downloadForm().invalid()) return;

    const { fileId } = this.downloadForm().value();
    const resolvedFileId = fileId.trim();
    if (!resolvedFileId) return;
    const url = `${this.fileUrl.replace(/\/$/, '')}/${encodeURIComponent(resolvedFileId)}`;

    this.fileService.downloadFile(url).subscribe({
      next: (blob) => {
        this.triggerBrowserDownload(blob, this.fileName || resolvedFileId);
      },
      error: (err) => console.error('Download failed:', err)
    });
  }

  private triggerBrowserDownload(blob: Blob, fileName: string) {
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(objectUrl);
  }
}
