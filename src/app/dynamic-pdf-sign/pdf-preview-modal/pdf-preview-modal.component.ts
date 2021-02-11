import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-pdf-preview-modal',
  templateUrl: './pdf-preview-modal.component.html',
  styleUrls: ['./pdf-preview-modal.component.scss']
})
export class PdfPreviewModalComponent implements OnInit {

  base64: string;
  newBase64: SafeResourceUrl;

  constructor(public dialogRef: MatDialogRef<PdfPreviewModalComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private sanitizer: DomSanitizer) {
    this.base64 = data.base64;
    this.newBase64 = this.sanitizer.bypassSecurityTrustResourceUrl(this.base64);
    
  }


  ngOnInit(): void {
  }

  closeModal() {
    this.dialogRef.close();
  }

  onImageLoad() {}
}
