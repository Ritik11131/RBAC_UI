import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  SearchType, 
  PathResponse,
  EntityPathResponse,
  UserPathResponse,
  ProfilePathResponse,
  RolePathResponse,
  MeterPathResponse,
  PathItem
} from '../../../../../core/interfaces/search.interface';
import { PathDisplayComponent } from './path-display.component';

@Component({
  selector: 'app-path-view',
  standalone: true,
  imports: [CommonModule, PathDisplayComponent],
  templateUrl: './path-view.component.html',
  styleUrls: ['./path-view.component.css']
})
export class PathViewComponent {
  // Use signals for reactive updates
  private _pathResponse = signal<PathResponse | null>(null);
  private _type = signal<SearchType>('entity');

  @Input() 
  set pathResponse(value: PathResponse | null) {
    this._pathResponse.set(value);
  }
  get pathResponse(): PathResponse | null {
    return this._pathResponse();
  }

  @Input() 
  set type(value: SearchType) {
    this._type.set(value);
  }
  get type(): SearchType {
    return this._type();
  }

  // Computed properties instead of functions - these are cached and only recompute when inputs change
  readonly isEntity = computed(() => this.type === 'entity');
  readonly isUser = computed(() => this.type === 'user');
  readonly isProfile = computed(() => this.type === 'profile');
  readonly isRole = computed(() => this.type === 'role');
  readonly isMeter = computed(() => this.type === 'meter');

  // Type-safe getters for accessing response data
  get entityPath(): PathItem[] | null {
    const response = this._pathResponse();
    return this.isEntity() && response && 'path' in response ? (response as EntityPathResponse).path : null;
  }

  get userEntityPath(): PathItem[] | null {
    const response = this._pathResponse();
    return this.isUser() && response && 'entityPath' in response ? (response as UserPathResponse).entityPath : null;
  }

  get userUserPath(): PathItem[] | null {
    const response = this._pathResponse();
    return this.isUser() && response && 'userPath' in response ? (response as UserPathResponse).userPath : null;
  }

  get profileData(): ProfilePathResponse['profile'] | null {
    const response = this._pathResponse();
    return this.isProfile() && response && 'profile' in response ? (response as ProfilePathResponse).profile : null;
  }

  get profileEntityPath(): PathItem[] | null {
    const response = this._pathResponse();
    return this.isProfile() && response && 'entityPath' in response ? (response as ProfilePathResponse).entityPath : null;
  }

  get profileUserPath(): PathItem[] | null {
    const response = this._pathResponse();
    return this.isProfile() && response && 'userPath' in response ? (response as ProfilePathResponse).userPath : null;
  }

  get roleData(): RolePathResponse['role'] | null {
    const response = this._pathResponse();
    return this.isRole() && response && 'role' in response ? (response as RolePathResponse).role : null;
  }

  get roleEntityPath(): PathItem[] | null {
    const response = this._pathResponse();
    return this.isRole() && response && 'entityPath' in response ? (response as RolePathResponse).entityPath : null;
  }

  get roleUserPath(): PathItem[] | null {
    const response = this._pathResponse();
    return this.isRole() && response && 'userPath' in response ? (response as RolePathResponse).userPath : null;
  }

  get meterData(): MeterPathResponse['meter'] | null {
    const response = this._pathResponse();
    return this.isMeter() && response && 'meter' in response ? (response as MeterPathResponse).meter : null;
  }

  get meterEntityPath(): PathItem[] | null {
    const response = this._pathResponse();
    return this.isMeter() && response && 'entityPath' in response ? (response as MeterPathResponse).entityPath : null;
  }

  get meterUserPath(): PathItem[] | null {
    const response = this._pathResponse();
    return this.isMeter() && response && 'userPath' in response ? (response as MeterPathResponse).userPath : null;
  }
}

