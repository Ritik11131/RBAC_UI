// import { SearchType, PathItem } from '../../../core/interfaces/search.interfaces';

import { SearchType, PathItem } from "../../core/interfaces/search.interface";

/**
 * Shared utilities for search functionality
 */

/**
 * Get icon SVG for resource type
 */
export function getResourceIcon(type: SearchType): string {
  const icons: Record<SearchType, string> = {
    entity: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M3 7V5C3 3.89543 3.89543 3 5 3H9C10.1046 3 11 3.89543 11 5V7M3 7H21M3 7V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V7M21 7V5C21 3.89543 20.1046 3 19 3H15C13.8954 3 13 3.89543 13 5V7M7 3V7M17 3V7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    user: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    profile: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    role: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    meter: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  };
  return icons[type] || icons['entity'];
}

/**
 * Get background color class for resource type
 */
export function getResourceBgColor(type: SearchType): string {
  const colors: Record<SearchType, string> = {
    entity: 'bg-blue-100 dark:bg-blue-900/30',
    user: 'bg-green-100 dark:bg-green-900/30',
    profile: 'bg-purple-100 dark:bg-purple-900/30',
    role: 'bg-orange-100 dark:bg-orange-900/30',
    meter: 'bg-yellow-100 dark:bg-yellow-900/30'
  };
  return colors[type] || colors['entity'];
}

/**
 * Get text color class for resource type
 */
export function getResourceTextColor(type: SearchType): string {
  const colors: Record<SearchType, string> = {
    entity: 'text-blue-600 dark:text-blue-400',
    user: 'text-green-600 dark:text-green-400',
    profile: 'text-purple-600 dark:text-purple-400',
    role: 'text-orange-600 dark:text-orange-400',
    meter: 'text-yellow-600 dark:text-yellow-400'
  };
  return colors[type] || colors['entity'];
}

/**
 * Get display name for resource type
 */
export function getResourceTypeName(type: SearchType): string {
  const names: Record<SearchType, string> = {
    entity: 'Entity',
    user: 'User',
    profile: 'Profile',
    role: 'Role',
    meter: 'Meter'
  };
  return names[type] || 'Resource';
}

/**
 * Format path item for display
 */
export function formatPathItem(item: PathItem): {
  name: string;
  subtitle?: string;
  type: SearchType;
  isSelected: boolean;
} {
  return {
    name: item.name,
    subtitle: item.email_id || item.email || undefined,
    type: item.type,
    isSelected: item.isSelected
  };
}

/**
 * Check if path item can be expanded (future-proof for pagination)
 */
export function canExpandPathItem(item: PathItem): boolean {
  // Future-proof: Check if item has expandable children
  // Currently API doesn't support this, but structure allows for it
  return item.hasChildren === true && (item.childrenCount ?? 0) > 0;
}

