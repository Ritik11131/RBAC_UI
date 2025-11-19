import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  SearchType, 
  HierarchyResponse,
  EntityHierarchyResponse,
  UserHierarchyResponse,
  ProfileHierarchyResponse,
  RoleHierarchyResponse
} from '../../../../../core/interfaces/search.interface';
import { EntityHierarchyNodeComponent } from './entity-hierarchy-node.component';
import { UserHierarchyNodeComponent } from './user-hierarchy-node.component';

@Component({
  selector: 'app-hierarchy-tree',
  standalone: true,
  imports: [CommonModule, EntityHierarchyNodeComponent, UserHierarchyNodeComponent],
  templateUrl: './hierarchy-tree.component.html',
  styleUrls: ['./hierarchy-tree.component.css']
})
export class HierarchyTreeComponent {
  @Input() hierarchyResponse: HierarchyResponse | null = null;
  @Input() type: SearchType = 'entity';
  @Input() level: number = 0;


  // Type guards
  isEntityResponse(response: HierarchyResponse): response is EntityHierarchyResponse {
    return this.type === 'entity' && 'hierarchy' in response;
  }

  isUserResponse(response: HierarchyResponse): response is UserHierarchyResponse {
    return this.type === 'user' && 'userHierarchy' in response;
  }

  isProfileResponse(response: HierarchyResponse): response is ProfileHierarchyResponse {
    return this.type === 'profile' && 'profile' in response;
  }

  isRoleResponse(response: HierarchyResponse): response is RoleHierarchyResponse {
    return this.type === 'role' && 'role' in response;
  }
}

