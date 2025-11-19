import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntityHierarchyNode } from '../../../../../core/interfaces/search.interface';

@Component({
  selector: 'app-entity-hierarchy-node',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './entity-hierarchy-node.component.html',
  styleUrls: ['./hierarchy-tree.component.css']
})
export class EntityHierarchyNodeComponent {
  @Input() node!: EntityHierarchyNode;
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

  getChildren(): EntityHierarchyNode[] {
    return this.node.children || [];
  }
}

