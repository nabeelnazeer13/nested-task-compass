import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, prepareDatesForSupabase, processSupabaseData, getCurrentUserId } from './serviceUtils';
import { Project } from '@/context/TaskTypes';

/**
 * Fetch all projects for the current user
 */
export async function getProjects(): Promise<Project[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    // Convert the Supabase projects to our Project type
    return data.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description || undefined,
      isExpanded: project.is_expanded || false,
    }));
  } catch (error) {
    return handleSupabaseError(error, 'Failed to fetch projects');
  }
}

/**
 * Create a new project
 */
export async function createProject(project: Omit<Project, 'id'>): Promise<Project> {
  try {
    const userId = await getCurrentUserId();
    
    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: project.name,
        description: project.description,
        is_expanded: project.isExpanded,
        user_id: userId
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || undefined,
      isExpanded: data.is_expanded || false,
    };
  } catch (error) {
    return handleSupabaseError(error, 'Failed to create project');
  }
}

/**
 * Update an existing project
 */
export async function updateProject(project: Project): Promise<void> {
  try {
    const { error } = await supabase
      .from('projects')
      .update({
        name: project.name,
        description: project.description,
        is_expanded: project.isExpanded
      })
      .eq('id', project.id);
    
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, 'Failed to update project');
  }
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
    
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, 'Failed to delete project');
  }
}

/**
 * Toggle project expanded state
 */
export async function toggleProjectExpanded(projectId: string, isExpanded: boolean): Promise<void> {
  try {
    const { error } = await supabase
      .from('projects')
      .update({ is_expanded: isExpanded })
      .eq('id', projectId);
    
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, 'Failed to update project state');
  }
}
