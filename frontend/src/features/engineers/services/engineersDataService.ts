import { Engineer, EngineerRating, Project, SkillDefinition } from '../types';

/**
 * @description Load all engineers data from JSON files
 * @returns Promise that resolves to array of engineers with basic info
 */
interface EngineerBasic {
  id: string;
  name: string;
  email: string;
  profilePhoto: string;
  position: string;
  department: string;
}

export const loadEngineers = async (): Promise<Engineer[]> => {
  try {
    // In development, we'll use dynamic imports to load JSON data
    const engineersModule = await import('../data/engineers.json');
    const engineers = engineersModule.default as EngineerBasic[];
    // The basic engineers.json only has basic info, detailed info comes from individual files
    const defaultRating: EngineerRating = {
      averageRating: 0,
      totalReviews: 0,
      reviews: []
    };
    
    return engineers.map(engineer => ({
      ...engineer,
      skills: [],
      previousProjects: [],
      currentAssignments: [],
      rating: defaultRating
    }));
  } catch (error) {
    console.error('Error loading engineers:', error);
    return [];
  }
};

/**
 * @description Load detailed engineer data by ID
 * @param engineerId - The ID of the engineer to load
 * @returns Promise that resolves to detailed engineer data
 */
export const loadEngineerDetails = async (engineerId: string): Promise<Engineer | null> => {
  try {
    // Use dynamic imports for JSON data
    const engineerModule = await import(`../data/engineer-${engineerId}.json`);
    const engineer = engineerModule.default as Engineer;
    return engineer;
  } catch (error) {
    console.error(`Error loading engineer ${engineerId}:`, error);
    return null;
  }
};

/**
 * @description Load all engineers with detailed information
 * @returns Promise that resolves to array of engineers with full details
 */
export const loadAllEngineersWithDetails = async (): Promise<Engineer[]> => {
  try {
    const basicEngineers = await loadEngineers();
    const detailedEngineers = await Promise.all(
      basicEngineers.map(async (engineer) => {
        const details = await loadEngineerDetails(engineer.id);
        return details || engineer;
      })
    );
    return detailedEngineers;
  } catch (error) {
    console.error('Error loading detailed engineers:', error);
    return [];
  }
};

/**
 * @description Load all projects data
 * @returns Promise that resolves to array of projects
 */
export const loadProjects = async (): Promise<Project[]> => {
  try {
    const projectsModule = await import('../data/projects.json');
    const projects = projectsModule.default as Project[];
    return projects;
  } catch (error) {
    console.error('Error loading projects:', error);
    return [];
  }
};

/**
 * @description Load all skills definitions
 * @returns Promise that resolves to array of skill definitions
 */
export const loadSkills = async (): Promise<SkillDefinition[]> => {
  try {
    const skillsModule = await import('../data/skills.json');
    const skills = skillsModule.default as SkillDefinition[];
    return skills;
  } catch (error) {
    console.error('Error loading skills:', error);
    return [];
  }
};

/**
 * @description Get profile photo URL for an engineer
 * @param profilePhoto - The filename of the profile photo (e.g., "engineer-1.svg")
 * @returns Full URL path to the profile photo in /public/images/user folder
 */
export const getProfilePhotoUrl = (profilePhoto: string): string => {
  // Extract the number from profilePhoto (e.g., "engineer-1.svg" -> "1")
  const match = profilePhoto.match(/\d+/);
  if (match) {
    const number = match[0];
    // Map to user image format with zero-padding (e.g., "1" -> "user-01.jpg")
    const paddedNumber = number.padStart(2, '0');
    return `/images/user/user-${paddedNumber}.jpg`;
  }
  // If no number found, return empty string to trigger fallback
  return '';
};

/**
 * @description Validate engineer data structure
 * @param engineer - Engineer object to validate
 * @returns Boolean indicating if the engineer data is valid
 */
export const validateEngineerData = (engineer: unknown): engineer is Engineer => {
  if (!engineer || typeof engineer !== 'object') {
    return false;
  }
  
  const e = engineer as Record<string, unknown>;
  
  return (
    typeof e.id === 'string' &&
    typeof e.name === 'string' &&
    typeof e.email === 'string' &&
    typeof e.profilePhoto === 'string' &&
    typeof e.position === 'string' &&
    typeof e.department === 'string' &&
    Array.isArray(e.skills) &&
    Array.isArray(e.previousProjects) &&
    Array.isArray(e.currentAssignments)
  );
};

/**
 * @description Transform raw engineer data and ensure type safety
 * @param rawData - Raw engineer data from JSON
 * @returns Validated and transformed engineer data
 */
export const transformEngineerData = (rawData: unknown): Engineer | null => {
  if (!validateEngineerData(rawData)) {
    console.warn('Invalid engineer data:', rawData);
    return null;
  }

  return {
    ...rawData,
    skills: rawData.skills || [],
    previousProjects: rawData.previousProjects || [],
    currentAssignments: rawData.currentAssignments || [],
  };
};