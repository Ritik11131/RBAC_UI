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

  get profilePath(): PathItem[] | null {
    const response = this._pathResponse();
    return this.isProfile() && response && 'path' in response ? (response as ProfilePathResponse).path : null;
  }

  get roleData(): RolePathResponse['role'] | null {
    const response = this._pathResponse();
    return this.isRole() && response && 'role' in response ? (response as RolePathResponse).role : null;
  }

  get rolePath(): PathItem[] | null {
    const response = this._pathResponse();
    return this.isRole() && response && 'path' in response ? (response as RolePathResponse).path : null;
  }

  get meterData(): MeterPathResponse['meter'] | null {
    const response = this._pathResponse();
    return this.isMeter() && response && 'meter' in response ? (response as MeterPathResponse).meter : null;
  }

  get meterPath(): PathItem[] | null {
    const response = this._pathResponse();
    return this.isMeter() && response && 'path' in response ? (response as MeterPathResponse).path : null;
  }
}

