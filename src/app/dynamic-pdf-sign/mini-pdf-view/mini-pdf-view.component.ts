import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatAnchor } from '@angular/material/button';
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
  @ViewChild('downloadLink') downloadLink: MatAnchor;

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    console.log(this.downloadLink)
  }

  openPreview() {
    this.dialog.open(PdfPreviewModalComponent,{data: {base64: this.miniPdf.base64}, height: '800px', width: '800px'})
  }

  downloadPdf() {
    this.downloadLink._elementRef.nativeElement.href = this.miniPdf.base64;
    this.downloadLink._elementRef.nativeElement.download = `blinking${Date.now().toString()}.pdf`;
  }
  

}
