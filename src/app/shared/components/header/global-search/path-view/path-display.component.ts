import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PathItem } from '../../../../../core/interfaces/search.interface';
import { Meter } from '../../../../../core/interfaces/meter.interface';
import { 
  getResourceIcon, 
  getResourceBgColor, 
  getResourceTextColor,
  canExpandPathItem
} from '../../../../utils/search.utils';

interface PathItemDisplay {
  item: PathItem;
  iconHtml: SafeHtml; // Changed from string to SafeHtml
  bgColorClass: string;
  textColorClass: string;
  canExpand: boolean;
  isExpanded: boolean; // Track expansion state to avoid function calls in template
  meterType?: string; // Meter type for meter items
}

@Component({
  selector: 'app-path-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './path-display.component.html',
  styleUrls: ['./path-view.component.css']
})
export class PathDisplayComponent {
  private sanitizer = inject(DomSanitizer);
  private _path: PathItem[] = [];
  private _meterData: Meter | null = null;
  private _displayItemsCache: PathItemDisplay[] | null = null;
  
  @Input() 
  set path(value: PathItem[]) {
    if (this._path !== value) {
      this._path = value;
      this._displayItemsCache = null; // Invalidate cache
    }
  }
  get path(): PathItem[] {
    return this._path;
  }

  // Optional: Pass meter data to display meter_type for meter items in path
  @Input()
  set meterData(value: Meter | null) {
    if (this._meterData !== value) {
      this._meterData = value;
      this._displayItemsCache = null; // Invalidate cache to update meter_type
    }
  }
  get meterData(): Meter | null {
    return this._meterData;
  }

  // Future-proof: Handle expansion
  // Use a Set for O(1) lookup performance
  private expandedItems = new Set<string>();
  // Use a Map for O(1) lookup of display items by ID (for toggleExpand optimization)
  private displayItemsMap = new Map<string, PathItemDisplay>();

  // Pre-computed display data with trusted HTML values
  // Following Angular security best practices: https://angular.dev/best-practices/security#preventing-cross-site-scripting-xss
  get displayItems(): PathItemDisplay[] {
    if (this._displayItemsCache === null) {
      // Build map for O(1) lookups
      this.displayItemsMap.clear();
      
      this._displayItemsCache = this._path.map(item => {
        const iconHtmlString = getResourceIcon(item.type);
        // Mark HTML as trusted using DomSanitizer.bypassSecurityTrustHtml()
        // This prevents Angular from sanitizing and showing warnings
        const trustedIconHtml = this.sanitizer.bypassSecurityTrustHtml(iconHtmlString);
        
        // Get meter_type for meter items if meter data is available
        // Only check if item is meter type (short-circuit optimization)
        const meterType = item.type === 'meter' && this._meterData?.id === item.id 
          ? this._meterData.meter_type 
          : undefined;
        
        const displayItem: PathItemDisplay = {
          item,
          iconHtml: trustedIconHtml, // Now SafeHtml type
          bgColorClass: getResourceBgColor(item.type),
          textColorClass: getResourceTextColor(item.type),
          canExpand: canExpandPathItem(item),
          isExpanded: this.expandedItems.has(item.id), // Include expansion state to avoid function calls
          meterType // Include meter_type for meter items
        };
        
        // Store in map for O(1) lookup
        this.displayItemsMap.set(item.id, displayItem);
        
        return displayItem;
      });
    } else {
      // Update only expansion state in cached items (most common update)
      // Only update meter_type if meter data exists and item is meter type
      const hasMeterData = this._meterData !== null;
      const meterId = this._meterData?.id;
      
      this._displayItemsCache.forEach(displayItem => {
        displayItem.isExpanded = this.expandedItems.has(displayItem.item.id);
        
        // Only check meter type if we have meter data (optimization)
        if (hasMeterData && displayItem.item.type === 'meter' && displayItem.item.id === meterId) {
          displayItem.meterType = this._meterData!.meter_type;
        }
      });
    }
    return this._displayItemsCache;
  }

  toggleExpand(itemId: string) {
    if (this.expandedItems.has(itemId)) {
      this.expandedItems.delete(itemId);
    } else {
      this.expandedItems.add(itemId);
      // Future: Load children if pagination is added
    }
    // Use Map for O(1) lookup instead of O(n) find()
    const displayItem = this.displayItemsMap.get(itemId);
    if (displayItem) {
      displayItem.isExpanded = this.expandedItems.has(itemId);
    }
  }
}

