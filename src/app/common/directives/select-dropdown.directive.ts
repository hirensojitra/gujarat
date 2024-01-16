import { Directive, ElementRef, Renderer2, OnInit, Input, SimpleChanges, AfterViewInit, OnChanges, Self, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subject } from 'rxjs';
export interface selectItems {
    id: string;
    name?: string;
}
@Directive({
    selector: '[selectDropdown]'
})

export class SelectDropdownDirective implements OnInit, AfterViewInit, OnChanges {
    @Input() multiple: boolean = false;
    @Input() set options(value: selectItems[] | null) {
        value && this.optionsSubject.next(value);
    }
    @Input() controlName: string = '';
    @Input() label: string = '';
    @Input() defaultOptionText: string = 'Select';
    @Input() loadingText: string = 'Loading...';
    btn: HTMLElement | undefined = undefined;
    dropdownItemArray: HTMLLIElement[] = [];
    private isFocusInProgress = false;
    private lastPressedKey: string | null = null;
    private lastFocusedItem: HTMLLIElement | null = null;
    private focusedItem: HTMLLIElement | null = null;
    private optionsSubject = new Subject<selectItems[]>();
    constructor(private el: ElementRef, private renderer: Renderer2, @Self() private ngControl: NgControl) {
        this.optionsSubject.subscribe((options: selectItems[]) => {
            options = Array.isArray(options) ? options : [];
            options.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            new Promise<void>((resolve) => {
                this.createDropdown(options);
                resolve();
            }).then(() => {
                this.checkActive(this.dropdownItemArray);
            });
        })
    }

    ngOnInit() {

    }
    @HostListener('blur')
    onBlur() {
        if (this.controlName && this.ngControl.control) {
            this.ngControl.control.markAsTouched();
            // this.ngControl.control.updateValueAndValidity();
        }
    }
    ngAfterViewInit(): void {
    }
    checkActive(dropdownItemArray: HTMLElement[]) {
        const controlValue = this.ngControl?.control?.value;
        let buttonText = 'Select Option';
        let isExist = false;
        if (Array.isArray(controlValue)) {
            let selected: string[] = [];
            dropdownItemArray.forEach(dropdownItem => {
                const optionId = dropdownItem.getAttribute('data-option-id');
                const optionName = dropdownItem.getAttribute('data-option-name');
                const isActive = controlValue.includes(optionId!);
                isActive
                    ? (isExist = true, this.renderer.addClass(dropdownItem, 'active'), selected.push(optionName?.toString() || ''))
                    : this.renderer.removeClass(dropdownItem, 'active');
            });
            if (!isExist) {
                this.ngControl?.control?.setValue('');
                buttonText = 'Select Option'
            }
            selected.sort((a, b) => a.localeCompare(b));
            this.renderer.setProperty(this.btn, 'textContent', selected.join(', ') || buttonText);
        } else {
            let buttonText: string | null = 'Select Option';
            dropdownItemArray.forEach(dropdownItem => {
                const optionId = dropdownItem.getAttribute('data-option-id')?.toString();
                const isActive = controlValue?.toString() === optionId;
                isActive
                    ? (isExist = true, this.renderer.addClass(dropdownItem, 'active'), buttonText = dropdownItem.getAttribute('data-option-name'))
                    : this.renderer.removeClass(dropdownItem, 'active');
            });
            if (!isExist) {
                this.ngControl?.control?.setValue('');
                buttonText = 'Select Option'
            }
            this.renderer.setProperty(this.btn, 'textContent', buttonText)
        }
    }


    ngOnChanges(changes: SimpleChanges): void {

    }
    generateRandomNumericString() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
    getButtonText(selectedValues: string[], options: selectItems[]): string {
        options.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        const selectedOptions = options.filter(option => selectedValues.includes(option.id.toString()));
        return selectedOptions.map(option => option.name || '').join(', ');
    }
    applyClasses(element: any, classes: string[]) {
        classes.forEach(className => this.renderer.addClass(element, className));
    }
    setAttributes(element: any, attributes: { [key: string]: string }) {
        for (const key in attributes) {
            if (attributes.hasOwnProperty(key)) {
                this.renderer.setAttribute(element, key, attributes[key]);
            }
        }
    }
    private createDropdown(options: selectItems[]) {
        if (Array.isArray(this.ngControl?.control?.value) && !this.multiple) {
            this.ngControl.control?.setValue('');
        } else if (!Array.isArray(this.ngControl?.control?.value) && this.multiple) {
            this.ngControl.control?.setValue([]);
        }
        const parent = this.renderer.parentNode(this.el.nativeElement);
        this.renderer.addClass(this.el.nativeElement, 'd-none');
        const childDropdown = parent.querySelector('.dropdown');
        const formGroup = (parent && parent.classList.contains('form-group'));
        if (childDropdown) {
            this.renderer.removeChild(parent, childDropdown);
        }
        const selectId = this.generateRandomNumericString();
        const dropdown = this.renderer.createElement('div');
        this.applyClasses(dropdown, ['dropdown', 'position-relative']);
        this.btn = this.renderer.createElement('button');
        this.applyClasses(this.btn, ['form-select', 'text-start', 'text-truncate', 'pe-5']);
        const btnAttributes = {
            'type': 'button',
            'id': `${selectId}-dropdown`,
            'data-bs-toggle': 'dropdown',
            'aria-haspopup': 'true',
            'aria-expanded': 'false',
            'tabindex': '0'
        };
        this.setAttributes(this.btn, btnAttributes);
        this.renderer.appendChild(this.btn, this.renderer.createText('Select'));
        const dropdownContainer = this.renderer.createElement('div');
        this.applyClasses(dropdownContainer, ['dropdown-menu', 'w-100', 'max-h-200-px', 'overflow-auto']);
        this.renderer.setAttribute(dropdownContainer, 'aria-labelledby', `${selectId}-dropdown`);

        const option = this.renderer.createElement('option');
        this.renderer.setAttribute(option, 'value', '');
        this.renderer.setProperty(option, 'textContent', 'Select Option');
        this.renderer.appendChild(this.el.nativeElement, option)
        const v = this.ngControl.control?.value;
        this.ngControl.control?.markAsUntouched;
        if (options.length) {
            this.dropdownItemArray = options.map((o: selectItems, index: number) => {
                const dropdownItem = this.renderer.createElement('a');
                const option = this.renderer.createElement('option');
                this.renderer.setAttribute(option, 'value', o.id);
                this.renderer.setProperty(option, 'textContent', o.name);
                this.renderer.appendChild(this.el.nativeElement, option)
                this.renderer.addClass(dropdownItem, 'dropdown-item');
                this.renderer.addClass(dropdownItem, 'mb-1');
                const liAttributes = {
                    'aria-disabled': 'true',
                    'data-option-id': o.id,
                    'data-option-name': o.name || ''
                };
                this.setAttributes(dropdownItem, liAttributes);
                this.renderer.appendChild(dropdownItem, this.renderer.createText(o.name || `Select ${index}`));
                const isSelected = this.multiple
                    ? Array.isArray(this.ngControl.control?.value) && this.ngControl.control?.value.includes(o.id.toString())
                    : this.ngControl.control?.value == o.id.toString();
                if (isSelected) {
                    this.renderer.addClass(dropdownItem, 'active');
                    this.renderer.setProperty(this.btn, 'textContent', o.name);
                }
                this.renderer.listen(dropdownItem, 'click', () => {
                    if (this.multiple) {
                        const currentValue = Array.isArray(this.ngControl.control!.value) ? this.ngControl.control!.value : [];
                        const indexToRemove = currentValue.indexOf(o.id.toString());
                        if (indexToRemove !== -1) {
                            currentValue.splice(indexToRemove, 1);
                            this.renderer.removeClass(dropdownItem, 'active');
                        } else {
                            currentValue.push(o.id.toString());
                            this.renderer.addClass(dropdownItem, 'active');
                        }
                        currentValue.map(num => num.toString());
                        currentValue.sort((a, b) => a.localeCompare(b));
                        this.ngControl.control?.setValue(currentValue);
                        const buttonText = currentValue.length ? this.getButtonText(currentValue, options) : 'Select Option';
                        this.renderer.setProperty(this.btn, 'textContent', buttonText);
                        this.renderer.removeClass(this.el.nativeElement, 'd-none');
                        this.el.nativeElement.focus();
                        this.renderer.addClass(this.el.nativeElement, 'd-none');
                    } else {
                        this.dropdownItemArray.forEach(otherLi => this.renderer.removeClass(otherLi, 'active'));
                        this.renderer.addClass(dropdownItem, 'active');
                        this.ngControl.control?.setValue(o.id.toString());

                        this.renderer.setProperty(this.btn, 'textContent', o.name);

                        this.renderer.removeClass(this.el.nativeElement, 'd-none');
                        this.el.nativeElement.focus();
                        this.renderer.addClass(this.el.nativeElement, 'd-none');
                    }
                    this.btn?.focus();
                });
                return dropdownItem;
            });
            this.dropdownItemArray.forEach(dropdownItem => this.renderer.appendChild(dropdownContainer, dropdownItem));
        } else {
            const dropdownItem = this.renderer.createElement('a');
            this.applyClasses(dropdownItem, ['dropdown-item', 'disabled', 'text-dark']);
            this.renderer.setAttribute(dropdownItem, 'aria-disabled', 'true');
            this.renderer.appendChild(dropdownItem, this.renderer.createText('Data Not Found'));
            this.renderer.appendChild(dropdownContainer, dropdownItem);
        }
        this.renderer.appendChild(dropdown, this.btn);
        this.renderer.appendChild(dropdown, dropdownContainer);
        this.renderer.insertBefore(this.el.nativeElement.parentElement, dropdown, this.el.nativeElement.nextSibling);
        this.dropdownItemArray.forEach((v: HTMLElement) => {
            v.addEventListener('focus', () => {
                this.focusedItem = v as HTMLLIElement;
            });
        })
        // Listen to Bootstrap's show.bs.dropdown event
        this.renderer.listen(this.btn, 'show.bs.dropdown', () => {
            this.dropdownItemArray.forEach((v: HTMLElement) => {
                let ele = v as HTMLLIElement;
                this.renderer.setAttribute(ele, 'tabindex', '0');
                if (ele.classList.contains('active')) {
                    ele.focus();
                }
            })
            document.addEventListener('keydown', this.handleDropdownKeyPress, false);
        });

        // Listen to Bootstrap's hide.bs.dropdown event
        this.renderer.listen(this.btn, 'hide.bs.dropdown', () => {
            this.renderer.selectRootElement(this.el.nativeElement).blur();
            document.removeEventListener('keydown', this.handleDropdownKeyPress);
            this.ngControl.control?.markAsTouched();
            this.renderer.removeClass(this.el.nativeElement, 'd-none');
            this.el.nativeElement.focus();
            this.renderer.addClass(this.el.nativeElement, 'd-none');
        });
        // this.ngControl.control?.markAsUntouched;
    }

    private handleDropdownKeyPress = (event: KeyboardEvent) => {
        if (event.keyCode >= 65 && event.keyCode <= 90) {
            const key = event.key.toLowerCase();
            if (/^[a-z]$/.test(key)) {
                // Check if the same key is pressed again
                if (key === this.lastPressedKey) {
                    // Find the next matching item after the last focused item
                    const currentIndex = this.lastFocusedItem
                        ? this.dropdownItemArray.indexOf(this.lastFocusedItem)
                        : -1;

                    let nextMatchingItem = this.dropdownItemArray.slice(currentIndex + 1)
                        .find(item => (item.textContent?.trim().charAt(0) || '').toLowerCase() === key);

                    if (!nextMatchingItem) {
                        nextMatchingItem = this.dropdownItemArray.find(item =>
                            (item.textContent?.trim().charAt(0) || '').toLowerCase() === key
                        );
                    }

                    if (nextMatchingItem) {
                        this.lastFocusedItem = nextMatchingItem as HTMLLIElement; // Assert the type here
                        nextMatchingItem.setAttribute('tabindex', '0');
                        nextMatchingItem.focus();
                    }
                } else {
                    const matchingItem = this.dropdownItemArray.find(item => {
                        const firstLetter = (item.textContent?.trim().charAt(0) || '').toLowerCase();
                        return firstLetter === key;
                    });
                    if (matchingItem) {
                        this.lastFocusedItem = matchingItem as HTMLLIElement; // Assert the type here
                        matchingItem.setAttribute('tabindex', '0');

                        matchingItem.focus();
                    }
                }
                this.lastPressedKey = key;
            }
        }
        else if (event.key == 'Enter' && this.focusedItem) {
            this.focusedItem.click();
        }
    };



}
