/**
 * Google Tasks API Client
 * Interacts with https://tasks.googleapis.com using OAuth bearer token
 */

export interface GoogleTaskList {
  id: string;
  title: string;
  updated?: string;
}

export interface GoogleTaskItem {
  id: string;
  title: string;
  status: 'needsAction' | 'completed';
  due?: string;
  notes?: string;
  updated?: string;
}

export async function fetchTaskLists(accessToken: string): Promise<GoogleTaskList[]> {
  const response = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch task lists (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.items || [];
}

export async function fetchTasks(accessToken: string, listId: string = '@default'): Promise<GoogleTaskItem[]> {
  const response = await fetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(listId)}/tasks?showCompleted=true&showHidden=true`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch tasks (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.items || [];
}

export async function createGoogleTask(
  accessToken: string,
  listId: string = '@default',
  task: { title: string; notes?: string; due?: string }
): Promise<GoogleTaskItem> {
  const response = await fetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(listId)}/tasks`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create task (${response.status}): ${errorText}`);
  }

  return response.json();
}

export async function updateGoogleTaskStatus(
  accessToken: string,
  listId: string = '@default',
  taskId: string,
  status: 'needsAction' | 'completed'
): Promise<GoogleTaskItem> {
  const response = await fetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(listId)}/tasks/${encodeURIComponent(taskId)}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update task (${response.status}): ${errorText}`);
  }

  return response.json();
}

export async function deleteGoogleTask(
  accessToken: string,
  listId: string = '@default',
  taskId: string
): Promise<void> {
  const response = await fetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(listId)}/tasks/${encodeURIComponent(taskId)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok && response.status !== 204) {
    const errorText = await response.text();
    throw new Error(`Failed to delete task (${response.status}): ${errorText}`);
  }
}
