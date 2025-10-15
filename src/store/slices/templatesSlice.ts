import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Template } from '../../types/template.types';
import { CATEGORIES } from '../../constants/categories';

export interface TemplatesState {
  templates: Template[];
  starterTemplates: Template[];
}

const initialState: TemplatesState = {
  templates: [],
  starterTemplates: [
    {
      id: 'starter-1',
      name: 'Course Outline Template',
      content: 'Create a comprehensive course outline for [topic] covering beginner to advanced concepts',
      tags: ['education', 'course', 'outline'],
      category: CATEGORIES[0], // Education & Learning
      tone: 'professional',
      language: 'en',
      isStarter: true,
      isProOnly: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'starter-2',
      name: 'Daily Planning Template',
      content: 'Help me plan my day with prioritized tasks, time blocks, and energy management',
      tags: ['productivity', 'planning', 'schedule'],
      category: CATEGORIES[1], // Productivity & Time Management
      tone: 'neutral',
      language: 'en',
      isStarter: true,
      isProOnly: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'starter-3',
      name: 'Business Plan Outline',
      content: 'Generate a detailed business plan for [business idea] including market analysis, financial projections, and growth strategy',
      tags: ['business', 'startup', 'planning'],
      category: CATEGORIES[2], // Business & Entrepreneurship
      tone: 'professional',
      language: 'en',
      isStarter: true,
      isProOnly: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'starter-4',
      name: 'Content Calendar Template',
      content: 'Create a 30-day content calendar for [platform] focusing on [topic] with post ideas and optimal posting times',
      tags: ['marketing', 'content', 'social-media'],
      category: CATEGORIES[3], // Marketing & Content
      tone: 'friendly',
      language: 'en',
      isStarter: true,
      isProOnly: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'starter-5',
      name: 'Wellness Plan Template',
      content: 'Design a personalized wellness plan covering nutrition, exercise, sleep, and stress management',
      tags: ['health', 'wellness', 'lifestyle'],
      category: CATEGORIES[4], // Health & Wellness
      tone: 'friendly',
      language: 'en',
      isStarter: true,
      isProOnly: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'starter-6',
      name: 'Tech Stack Evaluation',
      content: 'Evaluate and recommend the best technology stack for [project type] considering scalability, cost, and development speed',
      tags: ['technology', 'development', 'evaluation'],
      category: CATEGORIES[5], // Technology & Innovation
      tone: 'professional',
      language: 'en',
      isStarter: true,
      isProOnly: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

const templatesSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    addTemplate: (state, action: PayloadAction<Template>) => {
      // Check for duplicate names
      const existingNames = state.templates.map(t => t.name);
      let finalName = action.payload.name;
      let counter = 2;
      while (existingNames.includes(finalName)) {
        finalName = `${action.payload.name} (${counter})`;
        counter++;
      }
      state.templates.unshift({ ...action.payload, name: finalName });
    },
    updateTemplate: (state, action: PayloadAction<{ id: string; updates: Partial<Template> }>) => {
      const index = state.templates.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.templates[index] = {
          ...state.templates[index],
          ...action.payload.updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    deleteTemplate: (state, action: PayloadAction<string>) => {
      state.templates = state.templates.filter(t => t.id !== action.payload);
    },
  },
});

export const { addTemplate, updateTemplate, deleteTemplate } = templatesSlice.actions;
export default templatesSlice.reducer;
