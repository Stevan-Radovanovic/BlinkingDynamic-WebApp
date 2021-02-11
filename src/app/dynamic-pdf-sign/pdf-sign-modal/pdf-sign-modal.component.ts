import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'app-pdf-sign-modal',
  templateUrl: './pdf-sign-modal.component.html',
  styleUrls: ['./pdf-sign-modal.component.scss']
})
export class PdfSignModalComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<PdfSignModalComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
  }

  closeModal() {
    this.dialogRef.close();
  }

  verify() {
    console.log('Verifying...');
  }

  resend() {
    console.log('Resending...');
  }

}
