import { Component, OnInit } from '@angular/core';
import { DynamicPdfSignModel } from './dynamic-pdf-sign.model';

@Component({
  selector: 'app-dynamic-pdf-sign',
  templateUrl: './dynamic-pdf-sign.component.html',
  styleUrls: ['./dynamic-pdf-sign.component.scss']
})
export class DynamicPdfSignComponent implements OnInit {

  miniPdfComponents: DynamicPdfSignModel[] = [];

  constructor() { }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.miniPdfComponents = [
      {
        name: 'document1.pdf',
        size: 22,
        smallHash: 1969,
        base64: 'base1' 
      },
      {
        name: 'document2.pdf',
        size: 22,
        smallHash: 2012,
        base64: 'base2' 
      },
      {
        name: 'document3.pdf',
        size: 22,
        smallHash: 2019,
        base64: 'base3' 
      },
    ]
  }

}
