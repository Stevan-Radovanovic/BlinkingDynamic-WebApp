import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-pdf-preview-modal',
  templateUrl: './pdf-preview-modal.component.html',
  styleUrls: ['./pdf-preview-modal.component.scss']
})
export class PdfPreviewModalComponent implements OnInit {

  base64: string;

  constructor(public dialogRef: MatDialogRef<PdfPreviewModalComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.base64 = data.base64;
  }


  ngOnInit(): void {
  }

  closeModal() {
    this.dialogRef.close();
  }

  onImageLoad() {}
}
