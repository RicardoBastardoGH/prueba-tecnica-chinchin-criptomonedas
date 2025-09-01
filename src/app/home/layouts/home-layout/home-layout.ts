import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from '../../../shared/components/footer/footer';
import { Navbar } from '../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-home-layout',
  imports: [RouterOutlet, Footer, Navbar],
  templateUrl: './home-layout.html',
  styles: ``,
})
export class HomeLayout {}
