import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class FontService {
    fontPaths: { [family: string]: { [weight: string]: string } } = {};
    rkrf: any = {
        "gjK_RA": {
            "Components": "ક્ર",
            "Name": "gjK_RA"
        },
        "gjKH_RA": {
            "Components": "ખ્ર",
            "Name": "gjKH_RA"
        },
        "gjG_RA": {
            "Components": "ગ્ર",
            "Name": "gjG_RA"
        },
        "gjGH_RA": {
            "Components": "ઘ્ર",
            "Name": "gjGH_RA"
        },
        "gjC_RA": {
            "Components": "ચ્ર",
            "Name": "gjC_RA"
        },
        "gjCH_RA": {
            "Components": "છ્ર",
            "Name": "gjCH_RA"
        },
        "gjJ_RA": {
            "Components": "જ્ર",
            "Name": "gjJ_RA"
        },
        "gjJH_RA": {
            "Components": "ઝ્ર",
            "Name": "gjJH_RA"
        },
        "gjTT_RA": {
            "Components": "ટ્ર",
            "Name": "gjTT_RA"
        },
        "gjTTH_RA": {
            "Components": "ઠ્ર",
            "Name": "gjTTH_RA"
        },
        "gjDD_RA": {
            "Components": "ડ્ર",
            "Name": "gjDD_RA"
        },
        "gjDDH_RA": {
            "Components": "ઢ્ર",
            "Name": "gjDDH_RA"
        },
        "gjT_RA": {
            "Components": "ત્ર",
            "Name": "gjT_RA"
        },
        "gjTH_RA": {
            "Components": "થ્ર",
            "Name": "gjTH_RA"
        },
        "gjD_RA": {
            "Components": "દ્ર",
            "Name": "gjD_RA"
        },
        "gjDH_RA": {
            "Components": "ધ્ર",
            "Name": "gjDH_RA"
        },
        "gjN_RA": {
            "Components": "ન્ર",
            "Name": "gjN_RA"
        },
        "gjP_RA": {
            "Components": "પ્ર",
            "Name": "gjP_RA"
        },
        "gjPH_RA": {
            "Components": "ફ્ર",
            "Name": "gjPH_RA"
        },
        "gjB_RA": {
            "Components": "બ્ર",
            "Name": "gjB_RA"
        },
        "gjBH_RA": {
            "Components": "ભ્ર",
            "Name": "gjBH_RA"
        },
        "gjM_RA": {
            "Components": "મ્ર",
            "Name": "gjM_RA"
        },
        "gjY_RA": {
            "Components": "ય્ર",
            "Name": "gjY_RA"
        },
        "gjV_RA": {
            "Components": "વ્ર",
            "Name": "gjV_RA"
        },
        "gjSH_RA": {
            "Components": "શ્ર",
            "Name": "gjSH_RA"
        },
        "gjS_RA": {
            "Components": "સ્ર",
            "Name": "gjS_RA"
        },
        "gjH_RA": {
            "Components": "હ્ર",
            "Name": "gjH_RA"
        }
    };
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
