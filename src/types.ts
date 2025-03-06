// src/types.ts

export interface Task {
    _id: string;
    title: string;
    description: string;
    completed: boolean;
  }

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

// Declaración para js-cookie
declare module 'js-cookie' {
  export function get(name: string): string | undefined;
  export function set(name: string, value: string, options?: any): void;
  export function remove(name: string, options?: any): void;
}
  