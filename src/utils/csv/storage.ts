
import { ProcessedData } from "../../types";

// Function to load data from localStorage
export const loadSavedData = (): ProcessedData | null => {
  try {
    const savedData = localStorage.getItem('pmksy_bksy_data');
    return savedData ? JSON.parse(savedData) : null;
  } catch (error) {
    console.error('Error loading saved data:', error);
    return null;
  }
};
