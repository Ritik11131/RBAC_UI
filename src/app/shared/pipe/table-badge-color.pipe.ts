import { Pipe, PipeTransform } from '@angular/core';

export interface BadgeColorConfig {
  item: any;
  badgeColorFn?: (item: any) => string;
  defaultColor?: string;
}

/**
 * Pipe to get badge color for table cells
 * Uses the badgeColor function from column config if available
 */
@Pipe({
  name: 'tableBadgeColor',
  standalone: true,
  pure: true
})
export class TableBadgeColorPipe implements PipeTransform {
  transform(config: BadgeColorConfig): string {
    if (!config || !config.item) {
      return config?.defaultColor || 'default';
    }
    
    if (config.badgeColorFn) {
      return config.badgeColorFn(config.item);
    }
    
    return config?.defaultColor || 'default';
  }
}

