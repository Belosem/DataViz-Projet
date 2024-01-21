import { Component } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {

  scrollToAbout(): void {
    const aboutSection = document.getElementById('about-section');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToStats(): void {
    const aboutSection = document.getElementById('stats-section');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  }


  scrollToTop() {
    const container = document.scrollingElement || document.documentElement;
    container.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }


}
