import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styles: ``,
})
export class Footer implements OnInit {
  currentYear: number = new Date().getFullYear();

  constructor() {}

  ngOnInit(): void {}
}
