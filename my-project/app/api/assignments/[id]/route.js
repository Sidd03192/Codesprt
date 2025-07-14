import { NextResponse } from 'next/server';

// Dummy data for testing
const assignments = [
  {
    id: '1',
    title: 'Assignment 1',
    description: 'First assignment',
    language: 'JavaScript',
    status: 'active',
    due_at: '2025-07-20T00:00:00Z',
  },
  {
    id: '2',
    title: 'Assignment 2',
    description: 'Second assignment',
    language: 'Python',
    status: 'draft',
    due_at: '2025-07-21T00:00:00Z',
  },
];

export async function GET(request, { params }) {
  const { id } = params;

  // Make sure you're comparing strings
  const assignment = assignments.find(a => a.id === id);

  if (!assignment) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(assignment);
}
