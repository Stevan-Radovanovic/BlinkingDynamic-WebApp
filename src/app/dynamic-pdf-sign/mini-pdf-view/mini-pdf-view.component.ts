import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DynamicPdfSignModel } from '../dynamic-pdf-sign.model';
import { PdfPreviewModalComponent } from '../pdf-preview-modal/pdf-preview-modal.component';

@Component({
  selector: 'app-mini-pdf-view',
  templateUrl: './mini-pdf-view.component.html',
  styleUrls: ['./mini-pdf-view.component.scss']
})
export class MiniPdfViewComponent implements OnInit {

  @Input('miniPdf') miniPdf!: DynamicPdfSignModel;

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  openPreview() {
    this.dialog.open(PdfPreviewModalComponent,{data: {base64: this.miniPdf.base64}})
  }

}
