/**
 * Application configuration for different environments
 */

export interface AppConfig {
  /**
   * Custom domain name (optional)
   */
  customDomain?: string;
  
  /**
   * Email for CloudWatch alarms
   */
  alarmEmail?: string;
  
  /**
   * Environment variables for the Next.js application
   */
  environmentVariables?: { [key: string]: string };
  
  /**
   * Instance configuration
   */
  instanceConfig?: {
    cpu?: '0.25 vCPU' | '0.5 vCPU' | '1 vCPU' | '2 vCPU' | '4 vCPU';
    memory?: '0.5 GB' | '1 GB' | '2 GB' | '3 GB' | '4 GB' | '6 GB' | '8 GB' | '10 GB' | '12 GB';
  };
}

/**
 * Development environment configuration
 */
export const devConfig: AppConfig = {
  // customDomain: 'dev-admin.example.com',
  // alarmEmail: 'your-email@example.com', // Replace with your email
  alarmEmail: 'yuichiroyamaji@hotmail.com',
  instanceConfig: {
    cpu: '0.5 vCPU',
    memory: '1 GB',
  },
  environmentVariables: {
    // Add your environment variables here
    // DATABASE_URL: 'your-database-url',
    // API_KEY: 'your-api-key',
  },
};

/**
 * Production environment configuration
 */
export const prodConfig: AppConfig = {
  // customDomain: 'admin.example.com',
  // alarmEmail: 'your-email@example.com', // Replace with your email
  alarmEmail: 'yuichiroyamaji@hotmail.com',
  instanceConfig: {
    cpu: '1 vCPU',
    memory: '2 GB',
  },
  environmentVariables: {
    // Add your production environment variables here
  },
};

/**
 * Get configuration based on environment
 */
export const getConfig = (environment: 'dev' | 'prod' = 'dev'): AppConfig => {
  return environment === 'prod' ? prodConfig : devConfig;
};
