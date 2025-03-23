
import { ProjectTreeNode } from "@/types/projectTree";

// This is a mock dataset representing different types of projects
// In a real application, this would come from an API or database
export const projectTreeData: ProjectTreeNode[] = [
  {
    id: "inf-001",
    title: "Road Infrastructure",
    price: 2500000,
    children: [
      {
        id: "inf-001-01",
        title: "Highway Construction",
        price: 1500000,
        children: [
          {
            id: "inf-001-01-01",
            title: "Asphalt Paving",
            price: 750000,
          },
          {
            id: "inf-001-01-02",
            title: "Bridge Construction",
            price: 500000,
          },
          {
            id: "inf-001-01-03",
            title: "Traffic Systems",
            price: 250000,
          }
        ]
      },
      {
        id: "inf-001-02",
        title: "Urban Roads",
        price: 1000000,
        children: [
          {
            id: "inf-001-02-01",
            title: "Intersection Improvements",
            price: 400000,
          },
          {
            id: "inf-001-02-02",
            title: "Sidewalk Construction",
            price: 300000,
          },
          {
            id: "inf-001-02-03",
            title: "Street Lighting",
            price: 300000,
          }
        ]
      }
    ]
  },
  {
    id: "inf-002",
    title: "Water Infrastructure",
    price: 1800000,
    children: [
      {
        id: "inf-002-01",
        title: "Water Treatment Plant",
        price: 1200000,
        children: [
          {
            id: "inf-002-01-01",
            title: "Filtration Systems",
            price: 500000,
          },
          {
            id: "inf-002-01-02",
            title: "Chemical Treatment",
            price: 400000,
          },
          {
            id: "inf-002-01-03",
            title: "Control Systems",
            price: 300000,
          }
        ]
      },
      {
        id: "inf-002-02",
        title: "Water Distribution",
        price: 600000,
        children: [
          {
            id: "inf-002-02-01",
            title: "Pipeline Installation",
            price: 400000,
          },
          {
            id: "inf-002-02-02",
            title: "Pump Stations",
            price: 200000,
          }
        ]
      }
    ]
  },
  {
    id: "inf-003",
    title: "Public Buildings",
    price: 3500000,
    children: [
      {
        id: "inf-003-01",
        title: "Government Offices",
        price: 2000000,
        children: [
          {
            id: "inf-003-01-01",
            title: "Administrative Buildings",
            price: 1200000,
          },
          {
            id: "inf-003-01-02",
            title: "Public Service Centers",
            price: 800000,
          }
        ]
      },
      {
        id: "inf-003-02",
        title: "Schools",
        price: 1500000,
        children: [
          {
            id: "inf-003-02-01",
            title: "Primary Schools",
            price: 800000,
          },
          {
            id: "inf-003-02-02",
            title: "Secondary Schools",
            price: 700000,
          }
        ]
      }
    ]
  },
  {
    id: "inf-004",
    title: "Energy Infrastructure",
    price: 5000000,
    children: [
      {
        id: "inf-004-01",
        title: "Renewable Energy",
        price: 3000000,
        children: [
          {
            id: "inf-004-01-01",
            title: "Solar Farms",
            price: 1500000,
          },
          {
            id: "inf-004-01-02",
            title: "Wind Farms",
            price: 1500000,
          }
        ]
      },
      {
        id: "inf-004-02",
        title: "Power Distribution",
        price: 2000000,
        children: [
          {
            id: "inf-004-02-01",
            title: "Substations",
            price: 1200000,
          },
          {
            id: "inf-004-02-02",
            title: "Transmission Lines",
            price: 800000,
          }
        ]
      }
    ]
  }
];

// Helper function to search through the tree for nodes matching a term
export const searchProjectTree = (
  searchTerm: string,
  nodes: ProjectTreeNode[] = projectTreeData,
  path: string[] = []
): Array<{ node: ProjectTreeNode; path: string[] }> => {
  let results: Array<{ node: ProjectTreeNode; path: string[] }> = [];
  
  for (const node of nodes) {
    const currentPath = [...path, node.title];
    
    // Check if the current node matches the search term
    if (node.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      results.push({ node, path: currentPath });
    }
    
    // Search through children if they exist
    if (node.children && node.children.length > 0) {
      const childResults = searchProjectTree(searchTerm, node.children, currentPath);
      results = [...results, ...childResults];
    }
  }
  
  return results;
};

// Helper function to find a node by ID
export const findNodeById = (
  id: string,
  nodes: ProjectTreeNode[] = projectTreeData,
  path: string[] = []
): { node: ProjectTreeNode | null; path: string[] } => {
  for (const node of nodes) {
    const currentPath = [...path, node.title];
    
    if (node.id === id) {
      return { node, path: currentPath };
    }
    
    if (node.children && node.children.length > 0) {
      const result = findNodeById(id, node.children, currentPath);
      if (result.node) {
        return result;
      }
    }
  }
  
  return { node: null, path: [] };
};
