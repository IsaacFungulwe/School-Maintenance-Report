import api from '../utils/api'

// Predefined school locations
export const PREDEFINED_LOCATIONS = [
  'Thin Client Lab',
  'ICE 1 Lab',
  'ICE 2 Lab',
  'Classroom Block',
  'Male Hostel',
  'Female Hostel',
  'Main Hall',
  'Bag Store',
  'Electrical Lab',
  'Lecture Theater A',
  'Lecture Theater B',
  'Library',
  'Cafeteria',
  'Sports Complex',
]

// Hierarchical building structure with offices
export const BUILDING_STRUCTURE = {
  'Administration Block': [
    'Principal Office',
    'Accounts Office',
    'Human Resources',
    'Reception',
  ],
  'ICE Block': [
    'HOD Office',
    'Department Office',
    'Lab 1',
    'Lab 2',
  ],
  'Engineering Block': [
    'Lecturer Office 1',
    'Lecturer Office 2',
    'Seminar Hall',
    'Project Lab',
  ],
  'Science Block': [
    'Physics Lab',
    'Chemistry Lab',
    'Biology Lab',
  ],
  'Maintenance Wing': [
    'Maintenance Office',
    'Tool Store',
    'Equipment Store',
  ],
}

export const locationApi = {
  // Get all locations
  getAll: () =>
    api.get('/locations'),

  // Create new location
  create: (locationData) =>
    api.post('/locations', locationData),

  // Delete location
  delete: (id) =>
    api.delete(`/locations/${id}`),

  // Get predefined locations
  getPredefined: () => Promise.resolve({ data: PREDEFINED_LOCATIONS }),

  // Get building structure
  getBuildingStructure: () => Promise.resolve({ data: BUILDING_STRUCTURE }),

  // Get offices for a specific building
  getOfficesByBuilding: (building) =>
    Promise.resolve({ data: BUILDING_STRUCTURE[building] || [] }),
}
