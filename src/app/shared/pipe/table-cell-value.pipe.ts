import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe to extract cell value from an object using a key path
 * Supports nested keys like 'user.name'
 */
@Pipe({
  name: 'tableCellValue',
  standalone: true,
  pure: true // Pure pipe for better performance
})
export class TableCellValuePipe implements PipeTransform {
  transform(item: any, key: string): any {
    if (!item || !key) {
      return '';
    }
    
    const keys = key.split('.');
    let value: any = item;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === null || value === undefined) {
        return '';
      }
    }
    
    return value ?? '';
  }
}

