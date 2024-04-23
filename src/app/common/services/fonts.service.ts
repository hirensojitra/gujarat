import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class FontService {
    fontPaths: { [family: string]: { [weight: string]: string } } = {};
    fontFamilies = [
        {
            "family": "Anek Gujarati",
            "variables": ["100", "200", "300", "400", "500", "600", "700", "800"],
            "names": ["Thin", "ExtraLight", "Light", "Regular", "Medium", "SemiBold", "Bold", "ExtraBold"]
        },
        {
            "family": "Baloo Bhai 2",
            "variables": ["400", "500", "600", "700", "800"],
            "names": ["Regular", "Medium", "SemiBold", "Bold", "ExtraBold"]
        },
        {
            "family": "Farsan",
            "variables": [],
            "names": []
        },
        {
            "family": "Hind Vadodara",
            "variables": ["300", "400", "500", "600", "700"],
            "names": ["Light", "Regular", "Medium", "SemiBold", "Bold"]
        },
        {
            "family": "Kumar One",
            "variables": [],
            "names": []
        },
        {
            "family": "Kumar One Outline",
            "variables": [],
            "names": []
        },
        {
            "family": "Mogra",
            "variables": [],
            "names": []
        },
        {
            "family": "Mukta Vaani",
            "variables": ["200", "300", "400", "500", "600", "700", "800"],
            "names": ["ExtraLight", "Light", "Regular", "Medium", "SemiBold", "Bold", "ExtraBold"]
        },
        {
            "family": "Noto Sans Gujarati",
            "variables": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
            "names": ["Thin", "ExtraLight", "Light", "Regular", "Medium", "SemiBold", "Bold", "ExtraBold", "Black"]
        },
        {
            "family": "Noto Serif Gujarati",
            "variables": ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
            "names": ["Thin", "ExtraLight", "Light", "Regular", "Medium", "SemiBold", "Bold", "ExtraBold", "Black"]
        },
        {
            "family": "Rasa",
            "variables": ["0", "300", "400", "500", "600", "700", "1"],
            "names": ["Thin", "Light", "Regular", "Medium", "SemiBold", "Bold", "ExtraBold"]
        },
        {
            "family": "Shrikhand",
            "variables": [],
            "names": []
        },
        {
            "family": "Asar",
            "variables": [],
            "names": []
        }
    ]

    constructor() {
        this.generateFontPaths();
    }

    private generateFontPaths(): void {
        this.fontFamilies.forEach(fontFamily => {
            const folder = fontFamily.family.replace(/\s/g, '_');
            const file = fontFamily.family.replace(/\s/g, '');
            fontFamily.variables.forEach((weight, index) => {
                this.fontPaths[fontFamily.family] = this.fontPaths[fontFamily.family] || {};
                this.fontPaths[fontFamily.family][weight] = `${folder}/${file}-${fontFamily.names[index]}`;
            });
        });
    }

    getFontPath(fontFamily: string, fontWeight: string): string {
        const defaultFont = `${fontFamily.replace(/\s/g, '_')}/${fontFamily.replace(/\s/g, '')}-Regular`;
        const family = this.fontPaths[fontFamily];
        return family ? family[fontWeight] || defaultFont : defaultFont;
    }
}
