import { OnInit, Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
    selector: '.accordion-button'
})
export class AccordionActiveDirective implements OnInit {

    constructor(private el: ElementRef, private renderer: Renderer2) { }

    @HostListener('click')
    onClick() {
        const parentAccordion = this.el.nativeElement.closest('.accordion');
        const parentItem = this.el.nativeElement.closest('.accordion-item');
        if (parentAccordion && parentItem) {
            const allButtons = parentAccordion.querySelectorAll('.accordion-button');
            allButtons.forEach((button: HTMLElement) => {
                if (button !== this.el.nativeElement) {
                    this.renderer.setProperty(button, 'disabled', false);
                }
            });
            const allAccordionItem = parentAccordion.querySelectorAll('.accordion-item');
            allAccordionItem.forEach((accordionItem: HTMLElement) => {
                if (accordionItem) {
                    accordionItem.classList.remove('flex-grow-1');
                    accordionItem.classList.remove('d-flex');
                    accordionItem.classList.remove('flex-column');
                }
            });
            if (this.el.nativeElement.classList.contains('collapsed')) {
                this.renderer.removeClass(parentItem, 'flex-grow-1');
                this.renderer.removeClass(parentItem, 'd-flex');
                this.renderer.removeClass(parentItem, 'flex-column');
                this.renderer.setProperty(this.el.nativeElement, 'disabled', false);
            } else {
                this.renderer.addClass(parentItem, 'flex-grow-1');
                this.renderer.addClass(parentItem, 'd-flex');
                this.renderer.addClass(parentItem, 'flex-column');
                this.renderer.setProperty(this.el.nativeElement, 'disabled', true);
            }
        }
    }
    async ngOnInit(): Promise<void> {
        const accordion = this.el.nativeElement.closest('.accordion');
        if (!accordion) return;

        for (const button of accordion.querySelectorAll('.accordion-button')) {
            this.renderer.setProperty(button, 'disabled', false);
            button.closest('.accordion-item')?.classList.remove('flex-grow-1');
            button.closest('.accordion-item')?.classList.remove('d-flex');
            button.closest('.accordion-item')?.classList.remove('flex-column');
        }

        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for 100ms

        if (!this.el.nativeElement.classList.contains('collapsed')) {
            const parentItem = this.el.nativeElement.closest('.accordion-item');
            if (parentItem) {
                this.renderer.addClass(parentItem, 'flex-grow-1');
                this.renderer.addClass(parentItem, 'd-flex');
                this.renderer.addClass(parentItem, 'flex-column');
                this.renderer.setProperty(this.el.nativeElement, 'disabled', true);
            }
        }
    }
}
