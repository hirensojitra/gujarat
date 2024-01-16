import { Directive, ElementRef, Renderer2, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators, FormGroupDirective } from '@angular/forms';

@Directive({
    selector: '[captcha]',
})
export class CaptchaDirective implements OnInit {
    private captchaValue: string = '';
    private canvasElement: HTMLCanvasElement;
    @Input() character: number | undefined;
    @Input() captchaStyle: string | undefined;
    constructor(
        private fb: FormBuilder,
        private el: ElementRef,
        private renderer: Renderer2,
        private formGroupDirective: FormGroupDirective,
    ) {
        this.canvasElement = this.renderer.createElement('canvas') as HTMLCanvasElement;
    }

    ngOnInit() {
        
        const formGroup = this.formGroupDirective.form;
        formGroup.addControl('captcha', this.fb.control('', Validators.required));
        formGroup.updateValueAndValidity();
        const control = formGroup.get('captcha');
        this.generateCaptcha(this.canvasElement);
        const form = this.el.nativeElement;
        form.formGroup = formGroup;
        const captchaContainer = this.renderer.createElement('div');
        captchaContainer.classList.add('mb-3')
        const submitButton = this.el.nativeElement.querySelector('button[type="submit"]');
        let parentForm = submitButton;
        while (parentForm && parentForm.parentElement.tagName !== 'FORM') {
            parentForm = parentForm.parentElement;
        }
        const inputLabel = this.renderer.createElement('label');
        inputLabel.textContent = 'Enter the captcha you see above';
        const inputElement = this.renderer.createElement('input');
        this.renderer.setAttribute(inputElement, 'type', 'text');
        this.renderer.setAttribute(inputElement, 'placeholder', 'Enter Captcha');
        this.renderer.setProperty(inputElement, 'formControlName', 'captcha');

        inputElement.classList.add('form-control');
        const errorMessageDiv = this.renderer.createElement('div');
        errorMessageDiv.classList.add('text-danger');
        errorMessageDiv.innerHTML = '<small>Captcha is not valid</small>';
        errorMessageDiv.style.display = 'none';
        inputElement.addEventListener('change', (event: Event) => {
            const input = event.target as HTMLInputElement;
            const newValue = input.value;
            const captchaControl = formGroup.get('captcha');
            if (captchaControl) {
                captchaControl.setValue(newValue);
            }
        });
        control?.valueChanges.subscribe((value)=>{
            const captchaInputValue = value;
            console.log(captchaInputValue)
                if (captchaInputValue === this.captchaValue) {
                    errorMessageDiv.style.display = 'none';
                    this.renderer.removeClass(inputLabel, 'text-danger');
                    this.renderer.removeClass(inputElement, 'border-danger');
                } else {
                    control.setErrors({ 'invalid': true });
                    errorMessageDiv.style.display = 'block';
                    this.renderer.addClass(inputLabel, 'text-danger');
                    this.renderer.addClass(inputElement, 'border-danger');
                }
        })
        form.addEventListener('submit', (event: Event) => {
            const captchaControl = formGroup.get('captcha');
            if (captchaControl) {
                const captchaInputValue = captchaControl.value;
                if (captchaInputValue === this.captchaValue) {
                    errorMessageDiv.style.display = 'none';
                    this.renderer.removeClass(inputLabel, 'text-danger');
                    this.renderer.removeClass(inputElement, 'border-danger');
                    if (!formGroup.valid) {
                        this.generateCaptcha(this.canvasElement);
                    } else {
                    }
                } else {
                    captchaControl.setErrors({ 'invalid': true });
                    errorMessageDiv.style.display = 'block';
                    this.generateCaptcha(this.canvasElement);
                    this.renderer.addClass(inputLabel, 'text-danger');
                    this.renderer.addClass(inputElement, 'border-danger');
                }
            }
            event.preventDefault();
        })
        const canvasElement = this.canvasElement;
        const refreshButton = this.renderer.createElement('button');
        refreshButton.classList.add('btn', 'btn-light');
        const buttonIcon = this.renderer.createElement('i');
        buttonIcon.classList.add('fa', 'fa-refresh');
        this.renderer.appendChild(refreshButton, buttonIcon);
        this.renderer.listen(refreshButton, 'click', (event: Event) => {
            event.preventDefault();
            this.generateCaptcha(this.canvasElement);
        });
        const captchaControl = this.renderer.createElement('div');
        captchaControl.classList.add('d-flex', 'align-items-center', 'justify-content-center')
        this.renderer.appendChild(captchaControl, canvasElement);
        this.renderer.appendChild(captchaControl, refreshButton);
        this.renderer.appendChild(captchaContainer, captchaControl);
        if (this.captchaStyle === 'floating') {
            const formFloatingDiv = this.renderer.createElement('div');
            formFloatingDiv.classList.add('form-floating');
            this.renderer.appendChild(formFloatingDiv, inputElement);
            this.renderer.appendChild(formFloatingDiv, inputLabel);
            this.renderer.appendChild(captchaContainer, formFloatingDiv);
        } else {
            // Add input and label directly to the captchaContainer for the default style
            this.renderer.appendChild(captchaContainer, inputLabel);
            this.renderer.appendChild(captchaContainer, inputElement);
        }
        this.renderer.appendChild(captchaContainer, errorMessageDiv);
        this.renderer.appendChild(form, captchaContainer);
        if (parentForm) {
            // Add captchaContainer before parentForm
            this.renderer.insertBefore(form, captchaContainer, parentForm);
        } else {
            // Add captchaContainer as the last child of the form
            this.renderer.appendChild(form, captchaContainer);
        }
    }

    private generateCaptcha(canvas: HTMLCanvasElement) {
        const character: number = (this.character) ? this.character : 6;
        this.canvasElement.setAttribute('height', '60')
        this.canvasElement.setAttribute('width', (character * 33.333).toString())
        const context: CanvasRenderingContext2D = canvas.getContext("2d")!;
        if (context) {
            // Clear the canvas
            context.clearRect(0, 0, canvas.width, canvas.height);
            // Define the string of characters that can be included in the captcha
            const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            let captchaText = "";
            // Define dimensions and angles
            const angleMin = -45;
            const angleMax = 45;
            const angleRange = angleMax - angleMin;
            const fontSizeMin = 20;
            const fontSizeMax = 30;
            const fontSizeRange = fontSizeMax - fontSizeMin;

            // Generate each character of the captcha
            for (let i = 0; i < character; i++) {
                // Select a random letter from the pool to be part of the captcha
                const randomChar = characters.charAt(Math.floor(Math.random() * characters.length));
                captchaText += randomChar;
                // Set up the text formatting
                context.font = fontSizeMin + Math.random() * fontSizeRange + "px Arial";
                context.textAlign = "center";
                context.textBaseline = "middle";
                // Set the color of the text
                context.fillStyle =
                    "rgb(" +
                    Math.floor(Math.random() * 256) +
                    "," +
                    Math.floor(Math.random() * 256) +
                    "," +
                    Math.floor(Math.random() * 256) +
                    ")";

                // Add the character to the canvas
                const angle = angleMin + Math.random() * angleRange;
                context.translate(20 + i * 30, canvas.height / 2);
                context.rotate(angle * (Math.PI / 180));
                context.fillText(randomChar, 0, 0);
                context.rotate(-angle * (Math.PI / 180));
                context.translate(-(20 + i * 30), -canvas.height / 2);
            }
            this.captchaValue = captchaText
            sessionStorage.setItem("captchaCode", this.captchaValue);
        }
    }

}
