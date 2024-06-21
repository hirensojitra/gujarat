import { Pipe, PipeTransform } from '@angular/core';
import { FormControl } from '@angular/forms';

@Pipe({ name: 'dependencyList' })
export class DependencyListPipe implements PipeTransform {
    transform(selectData: { [key: string]: { title: string, control: FormControl } }, key: string): { title: string, value: string }[] {
        const result: { title: string, value: string }[] = [];
        for (const k in selectData) {
            if (k !== key) {
                result.push({ title: selectData[k].title, value: k });
            }
        }
        console.log(result)
        return result;
    }
}
