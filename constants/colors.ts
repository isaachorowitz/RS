// Dark theme color palette with warm, premium feel
export const colors = {
  // Background colors
  background: '#0A0A0A',        // Matte black
  cardBackground: '#1A1A1A',    // Slightly lighter for cards
  
  // Accent colors (pastel palette)
  yellow: '#FFE66D',            // Pastel yellow
  green: '#A8E6CF',             // Mint green
  offWhite: '#FFFEF7',          // Off-white
  
  // Text colors
  text: '#FFFEF7',              // Off-white for primary text
  textSecondary: '#B0B0B0',     // Gray for secondary text
  textMuted: '#707070',         // Muted gray
  
  // UI elements
  border: '#2A2A2A',            // Subtle borders
  error: '#FF6B6B',             // Error red
  success: '#A8E6CF',           // Success green (mint)
  warning: '#FFE66D',           // Warning yellow
  
  // Button colors
  primary: '#A8E6CF',           // Mint green for CTAs
  secondary: '#FFE66D',         // Yellow for secondary actions
  disabled: '#3A3A3A',          // Disabled state
  
  // Status colors
  pending: '#FFE66D',
  approved: '#A8E6CF',
  declined: '#FF6B6B',
  
  // Map colors
  mapBackground: '#1A1A1A',
  mapPath: '#FFE66D',
  mapMarker: '#A8E6CF',
};

export type ColorKeys = keyof typeof colors;

