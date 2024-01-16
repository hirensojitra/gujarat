import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
    selector: '[togglePassword]'
})
export class TogglePasswordDirective {
    @Input() type: string | undefined;
    constructor(private el: ElementRef, private renderer: Renderer2) {

    }
    ngOnInit() {
        this.type = 'password';
        const container = this.renderer.createElement('div');
        this.renderer.addClass(container, 'input-group');
        const inputElement = this.el.nativeElement;
        this.renderer.setAttribute(inputElement, 'type', this.type);
        // Insert the container before the inputElement
        this.renderer.insertBefore(inputElement.parentElement, container, inputElement);
        // Move the inputElement into the container
        this.renderer.appendChild(container, inputElement);
        // Create the button element
        const buttonElement = this.renderer.createElement('button');
        this.renderer.setAttribute(buttonElement, 'type', 'button');
        this.renderer.addClass(buttonElement, 'btn');
        this.renderer.addClass(buttonElement, 'btn-outline-secondary');
        // Create the icon element inside the button
        const iconElement = this.renderer.createElement('i');
        this.renderer.addClass(iconElement, 'fa');
        this.renderer.addClass(iconElement, 'fa-eye-slash');
        // Append the icon element to the button
        this.renderer.appendChild(buttonElement, iconElement);
        this.renderer.appendChild(container, buttonElement);

        buttonElement.addEventListener('click', () => {
            // Toggle the classes
            if (iconElement.classList.contains('fa-eye-slash')) {
                iconElement.classList.remove('fa-eye-slash');
                iconElement.classList.add('fa-eye');
                inputElement.type = 'text';
            } else {
                iconElement.classList.remove('fa-eye');
                iconElement.classList.add('fa-eye-slash');
                inputElement.type = 'password';
            }
        });
        const parentElement = container.parentElement;
        if (parentElement.classList.contains('form-floating')) {
            parentElement.classList.remove('form-floating');
            container.classList.add('form-floating');
            container.classList.add('mb-3');
            const labelElement = parentElement.querySelector('label');
            if (labelElement) {
                // Move the label element to the container
                container.appendChild(labelElement);
                inputElement.classList.add('bg-transparent');
            }
    
            // Move the container next to the parent
            parentElement.parentNode.insertBefore(container, parentElement.nextSibling);
    
            // Remove the parent element
            parentElement.parentNode.removeChild(parentElement);
        }
    }

}
