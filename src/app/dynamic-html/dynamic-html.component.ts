import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ButtonType } from './button-type.enum';
import { DynamicPageModel } from './dynamic-page.model';

@Component({
  selector: 'app-dynamic-html',
  templateUrl: './dynamic-html.component.html',
  styleUrls: ['./dynamic-html.component.scss']
})
export class DynamicHtmlComponent implements OnInit {

  pageData!: DynamicPageModel;
  @ViewChild('contentDiv') contentDiv!: ElementRef;

  constructor() { }


  ngOnInit(): void {
    this.getDynamicHtml();
  }

  ngAfterViewInit() {
    this.fillContentDiv();
    console.log(this.contentDiv);

  }

  getDynamicHtml() {
    this.pageData = {
      title : "Dynamic Title",
      content: "<div style='padding: 25px; display: flex; flex-direction: column; justify-content: center'><p>Dynamic Paragraph 1</p><p>Dynamic Paragraph 2</p></div>",
      actions: [{label: 'Download', type: ButtonType.DOWNLOAD},{label: 'Cancel', type: ButtonType.CANCEL}]
    }

  }

  fillContentDiv() {
    this.contentDiv.nativeElement.innerHTML = this.pageData.content
  }

  onButtonClick(buttonType: ButtonType) {
    switch(buttonType) {
      case ButtonType.DOWNLOAD: return this.onClickDownload();
      case ButtonType.CONFIRM: return this.onClickConfirm();
      case ButtonType.CANCEL: return this.onClickCancel();
    }
  }

  onClickDownload() {
    console.log('Downloading...');
  }

  onClickCancel() {
    console.log('Canceling...');
  }

  onClickConfirm() {
    console.log('Confirming...');
  }

}
