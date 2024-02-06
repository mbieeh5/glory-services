import React, { useState } from "react";
import styled from "styled-components";


type KategoryItem = {
  category: string;
};

type CategoryProps = {
  categories: KategoryItem[];
  onCategorySelect: (category: string) => void;
};

export default function CategorySelector({ categories, onCategorySelect }: CategoryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("terbaru");

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    onCategorySelect(category);
  }

  return (
    <div>
      {categories.map((cat, i) => (
        <PilihanKategory
          key={i}
          category={cat.category}
          isSelected={cat.category === selectedCategory}
          onSelect={handleCategorySelect}
        />
      ))}
    </div>
  );
}

type PilihanKategoryProps = {
  category: string;
  isSelected: boolean;
  onSelect: (category: string) => void;
};

function PilihanKategory({ category, isSelected, onSelect }: PilihanKategoryProps) {
  return (
    <Button
      onClick={() => onSelect(category)}
      style={{ 
      backgroundColor: isSelected ? "white" : "black", 
      color: isSelected ? "black" : "white" 
    }}>
      {category.toLocaleUpperCase()}
    </Button>
  );
}

const Button = styled.button`
  min-width: 8rem;
  background: transparent;
  white-space: nowrap;
  margin: 7px;
  padding: 7px;
  size-text: 10px;
  font-size: 2rem;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 6px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.2);
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;