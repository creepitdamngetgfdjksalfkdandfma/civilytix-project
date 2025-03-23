
// Types for the project tree structure
export interface ProjectTreeNode {
  id: string;
  title: string;  // Changed back from 'name' to 'title'
  price: number;
  children?: ProjectTreeNode[];
}

export interface ProjectTreeSelection {
  nodeId: string;
  nodeName: string;
  nodePath: string[];  // Changed back from 'path' to 'nodePath'
  totalPrice: number;
}
