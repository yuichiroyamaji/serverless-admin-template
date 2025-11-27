# Product Overview

This is a full-stack admin dashboard application built with Next.js and AWS infrastructure. The project consists of three main components:

## Frontend
A feature-rich admin dashboard template based on TailAdmin, providing UI components for data visualization, user management, forms, tables, charts, and authentication. Built with Next.js 15 App Router and React Server Components.

## Backend
AWS Lambda functions for serverless backend processing.

## Infrastructure
AWS CDK-based infrastructure as code (IaC) for deploying the application on AWS AppRunner with supporting services including Cognito for authentication, CloudWatch for logging, and potential Redis for caching.

## Target Deployment
The application is designed to be hosted on AWS AppRunner (container-based) rather than Amplify or ECS Fargate, chosen for its balance of cost-effectiveness (~$3-5 USD/month), full Next.js feature support (SSR, ISR, caching), and CDK-based infrastructure management.
