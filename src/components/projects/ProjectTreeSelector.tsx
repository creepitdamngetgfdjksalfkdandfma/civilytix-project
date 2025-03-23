
import { useState, useEffect } from "react";
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronRight, Search } from "lucide-react";
import { ProjectTreeNode, ProjectTreeSelection } from "@/types/projectTree";
import { searchProjectTree, findNodeById, projectTreeData } from "@/data/projectTreeData";

interface ProjectTreeSelectorProps {
  onSelect: (selection: ProjectTreeSelection) => void;
  initialSelectedId?: string;
}

export const ProjectTreeSelector = ({ onSelect, initialSelectedId }: ProjectTreeSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Array<{ node: ProjectTreeNode; path: string[] }>>([]);
  const [selectedNode, setSelectedNode] = useState<ProjectTreeNode | null>(null);
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  
  // Navigate to a specific node and its children
  const [currentView, setCurrentView] = useState<{
    nodes: ProjectTreeNode[];
    parentPath: string[];
  }>({
    nodes: projectTreeData,
    parentPath: []
  });

  // Initialize with initial selection if provided
  useEffect(() => {
    if (initialSelectedId && !selectedNode) {
      const { node, path } = findNodeById(initialSelectedId);
      if (node) {
        setSelectedNode(node);
        setSelectedPath(path);
        
        // We'll call onSelect in a separate useEffect to avoid causing infinite updates
      }
    }
  }, [initialSelectedId, selectedNode]);
  
  // Trigger onSelect when selectedNode changes
  useEffect(() => {
    if (selectedNode) {
      onSelect({
        nodeId: selectedNode.id,
        nodeName: selectedNode.title,
        nodePath: selectedPath,
        totalPrice: selectedNode.price
      });
    }
  }, [selectedNode, selectedPath, onSelect]);

  // Handle search input
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.length >= 2) {
      const results = searchProjectTree(value);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  // Handle selecting a node from search
  const handleSelectFromSearch = (result: { node: ProjectTreeNode; path: string[] }) => {
    setSelectedNode(result.node);
    setSelectedPath(result.path);
    setIsSearchOpen(false);
    setSearchTerm("");
    
    // If the node has children, update the current view
    if (result.node.children && result.node.children.length > 0) {
      setCurrentView({
        nodes: result.node.children,
        parentPath: result.path
      });
    }
    
    // Note: onSelect will be triggered by the useEffect
  };

  // Handle selecting a node from browsing
  const handleSelectFromBrowse = (node: ProjectTreeNode) => {
    const newPath = [...currentView.parentPath, node.title];
    setSelectedNode(node);
    setSelectedPath(newPath);
    
    console.log("Selected node:", node.title, "Price:", node.price, "ID:", node.id);
    
    // Note: onSelect will be triggered by the useEffect
  };
  
  // Handle navigating to children 
  const handleNavigateToChildren = (node: ProjectTreeNode) => {
    const newPath = [...currentView.parentPath, node.title];
    
    if (node.children && node.children.length > 0) {
      setCurrentView({
        nodes: node.children,
        parentPath: newPath
      });
    }
    
    // Also select the node when navigating
    setSelectedNode(node);
    setSelectedPath(newPath);
    
    // Note: onSelect will be triggered by the useEffect
  };

  // Handle going back up a level
  const handleGoBack = () => {
    if (currentView.parentPath.length > 0) {
      // We need to find the parent node
      const parentPathWithoutLast = currentView.parentPath.slice(0, -1);
      let parentNodes = projectTreeData;
      let currentPath: string[] = [];
      
      // Traverse the tree to find the parent node
      for (const pathSegment of parentPathWithoutLast) {
        currentPath.push(pathSegment);
        const matchingNode = parentNodes.find(node => node.title === pathSegment);
        if (matchingNode && matchingNode.children) {
          parentNodes = matchingNode.children;
        }
      }
      
      setCurrentView({
        nodes: parentNodes,
        parentPath: parentPathWithoutLast
      });
    } else {
      // If at root level, just reset to the initial tree
      setCurrentView({
        nodes: projectTreeData,
        parentPath: []
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Button 
            variant="outline" 
            className="w-full justify-between"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            {searchTerm || selectedNode ? (
              <span className="truncate">
                {searchTerm || selectedNode.title}
              </span>
            ) : (
              <span className="text-muted-foreground">
                Search for a project...
              </span>
            )}
            <Search className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
          
          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 z-10 mt-1">
              <Command className="rounded-lg border shadow-md">
                <CommandInput 
                  placeholder="Search projects..." 
                  value={searchTerm}
                  onValueChange={handleSearch}
                  className="h-9"
                />
                <CommandList>
                  <CommandEmpty>No projects found.</CommandEmpty>
                  <CommandGroup heading="Projects">
                    {searchResults.map((result) => (
                      <CommandItem 
                        key={result.node.id}
                        onSelect={() => handleSelectFromSearch(result)}
                        className="cursor-pointer"
                      >
                        <span className="flex-1 truncate">{result.node.title}</span>
                        <span className="text-muted-foreground ml-2">
                          ${result.node.price.toLocaleString()}
                        </span>
                        {selectedNode?.id === result.node.id && (
                          <Check className="h-4 w-4 ml-2" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          )}
        </div>
      </div>
      
      {/* Display the selected node information */}
      {selectedNode && (
        <Card className="bg-muted/40">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{selectedNode.title}</h3>
                <span className="font-semibold">
                  ${selectedNode.price.toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                ID: {selectedNode.id}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Path: </span>
                {selectedPath.join(" > ")}
              </div>
              <div className="mt-2 text-sm text-green-600">
                This component is selected for the tender.
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Browse tree structure */}
      <div className="rounded-md border">
        <div className="p-2 bg-muted/40 flex items-center justify-between">
          <h3 className="font-medium flex items-center">
            {currentView.parentPath.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="mr-2 h-8 w-8 p-0"
                onClick={handleGoBack}
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </Button>
            )}
            Browse Projects
          </h3>
          <span className="text-sm text-muted-foreground">
            {currentView.parentPath.length > 0 
              ? currentView.parentPath.join(" > ") 
              : "Root Level"}
          </span>
        </div>
        
        <div className="divide-y">
          {currentView.nodes.map((node) => (
            <div 
              key={node.id} 
              className={`p-3 hover:bg-muted/50 cursor-pointer ${
                selectedNode?.id === node.id ? "bg-muted/70" : ""
              }`}
              onClick={() => handleSelectFromBrowse(node)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {node.children && node.children.length > 0 ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mr-2 h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigateToChildren(node);
                      }}
                    >
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  ) : (
                    <div className="w-8" />
                  )}
                  <span>{node.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">${node.price.toLocaleString()}</span>
                  <Button 
                    size="sm" 
                    variant={selectedNode?.id === node.id ? "default" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectFromBrowse(node);
                    }}
                  >
                    {selectedNode?.id === node.id ? "Selected" : "Select"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
