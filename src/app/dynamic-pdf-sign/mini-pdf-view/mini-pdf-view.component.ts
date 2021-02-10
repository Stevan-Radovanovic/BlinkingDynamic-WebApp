import { Component, Input, OnInit } from '@angular/core';
import { DynamicPdfSignModel } from '../dynamic-pdf-sign.model';

@Component({
  selector: 'app-mini-pdf-view',
  templateUrl: './mini-pdf-view.component.html',
  styleUrls: ['./mini-pdf-view.component.scss']
})
export class MiniPdfViewComponent implements OnInit {

  @Input('miniPdf') miniPdf!: DynamicPdfSignModel;

  constructor() { }

  ngOnInit(): void {
  }

}
