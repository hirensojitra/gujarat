import { AfterViewInit, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-img-process',
  templateUrl: './img-process.component.html',
  styleUrls: ['./img-process.component.scss']
})
export class ImgProcessComponent implements OnInit, AfterViewInit {
  makeEditable(event: MouseEvent) {
    const textElement = event.target as SVGTextElement;

    if (textElement) {
      // Get the SVG container
      const svgContainer = document.querySelector('svg');

      if (svgContainer) {
        // Get text position
        const x = textElement.getAttribute('x') || '0';
        const y = textElement.getAttribute('y') || '0';

        // Create foreignObject element
        const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        foreignObject.setAttribute('x', x);
        foreignObject.setAttribute('y', y);
        foreignObject.setAttribute('width', '100%'); // Set the width as needed
        foreignObject.setAttribute('height', textElement.clientHeight.toString()); // Set the height as needed

        // Create HTML input field
        const input = document.createElement('input');
        input.type = 'text';
        input.value = textElement.textContent || '';
        input.style.width = '100%';
        input.style.height = '100%';
        input.style.fontFamily = window.getComputedStyle(textElement).fontFamily;
        input.style.fontSize = window.getComputedStyle(textElement).fontSize;
        input.style.color = window.getComputedStyle(textElement).fill;
        input.style.background = 'none'; // Set background to none
        input.style.border = 'none'; // Remove border
        input.style.padding = '0'; // Remove padding
        input.style.margin = '0'; // Remove margin
        input.style.outline = 'none'; // Remove outline

        // Replace the text with the input field
        foreignObject.appendChild(input);
        svgContainer.replaceChild(foreignObject, textElement);

        // Focus on the input field
        input.focus();

        // Add an event listener to handle changes
        input.addEventListener('blur', () => {
          // Replace the input field with the updated text element
          const newTextElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          newTextElement.setAttribute('x', x);
          newTextElement.setAttribute('y', y);
          newTextElement.setAttribute('font-family', input.style.fontFamily);
          newTextElement.setAttribute('font-size', input.style.fontSize);
          newTextElement.setAttribute('fill', input.style.color);
          newTextElement.textContent = input.value;
          svgContainer.replaceChild(newTextElement, foreignObject);
          // Add click event listener to the new text element for editing
          newTextElement.addEventListener('click', (event) => this.makeEditable(event));
        });
      }
    }
  }




  ngAfterViewInit(): void {

  }
  ngOnInit(): void {

  }
}
