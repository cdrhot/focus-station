/**
 * Note Model Definition
 * 
 * This file defines the structure of a Note in the database.
 * In a real implementation, this would use an ORM like Mongoose for MongoDB
 * or Sequelize for SQL databases.
 */

export interface INote {
  id: string;
  title: string;
  content: string | string[];
  type: 'list' | 'thought' | 'goal';
  x: number;
  y: number;
  createdAt: Date;
  updatedAt: Date;
}

// TODO: Define Mongoose schema or SQL table definition here
// Example:
// const NoteSchema = new Schema({ ... });
// export const Note = model('Note', NoteSchema);
