import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserHierarchyNode } from '../../../../../core/interfaces/search.interface';

@Component({
  selector: 'app-user-hierarchy-node',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-hierarchy-node.component.html',
  styleUrls: ['./hierarchy-tree.component.css']
})
export class UserHierarchyNodeComponent {
  @Input() node!: UserHierarchyNode;
  @Input() level: number = 0;

  expandedNodes = new Set<string>();

  toggleNode(id: string) {
    if (this.expandedNodes.has(id)) {
      this.expandedNodes.delete(id);
    } else {
      this.expandedNodes.add(id);
    }
  }

  isExpanded(id: string): boolean {
    return this.expandedNodes.has(id);
  }

  hasChildren(): boolean {
    return !!this.node.children && this.node.children.length > 0;
  }

  getChildren(): UserHierarchyNode[] {
    return this.node.children || [];
  }
}

