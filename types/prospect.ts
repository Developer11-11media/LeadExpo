// Types and interfaces for the prospect management system
export interface Prospect {
  id: string;
  firstname: string;
  lastname: string; // Antes name
  company: string;
  position: string; // Antes jobTitle  
  email: string;
  phone?: string;
  industry?: string;
  website?: string;
  address?: string;
  priority?: 'Alta' | 'Media' | 'Baja';
  leadSource?: string;
  notes?: string;
  createdAt?: string; // ISO date string
  qrData?: string; // Original QR code data
  isStarred?: boolean;
  tags?: string[];
  // Mantener campos anteriores para compatibilidad
  fullName?: string;
  jobTitle?: string;
  registrationType?: RegistrationType;
  scannedAt?: string;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  author?: string; // User who created the note
}

export type RegistrationType = 'VIP' | 'General' | 'Speaker' | 'Press' | 'Staff' | 'Sponsor' | 'Other';

export interface ProspectFilter {
  searchTerm?: string;
  registrationType?: RegistrationType[];
  company?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  isStarred?: boolean;
  tags?: string[];
}

export interface ExportOptions {
  format: 'CSV' | 'JSON' | 'EXCEL';
  includeNotes: boolean;
  prospects: Prospect[];
  fileName?: string;
}

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

export const validateProspect = (prospect: Partial<Prospect>): string[] => {
  const errors: string[] = [];
  
  if (!prospect.fullName?.trim()) {
    errors.push('Full name is required');
  }
  
  if (!prospect.company?.trim()) {
    errors.push('Company is required');
  }
  
  if (!prospect.jobTitle?.trim()) {
    errors.push('Job title is required');
  }
  
  if (!prospect.email?.trim()) {
    errors.push('Email is required');
  } else if (!validateEmail(prospect.email)) {
    errors.push('Invalid email format');
  }
  
  if (prospect.phone && !validatePhone(prospect.phone)) {
    errors.push('Invalid phone format');
  }
  
  if (!prospect.registrationType) {
    errors.push('Registration type is required');
  }
  
  return errors;
};

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Create empty prospect
export const createEmptyProspect = (): Partial<Prospect> => ({
  firstname: '',
  lastname: '',
  company: '',
  position: '',
  email: '',
  phone: '',
  industry: '',
  website: '',
  address: '',
  priority: 'Media',
  leadSource: '',
  notes: '',
  isStarred: false,
  tags: []
});

// Parse QR code data (support for different formats)
export const parseQRData = (qrData: string): Partial<Prospect> => {
  try {
    //En QrData Llamos al api 


    // Try to parse as JSON first (GlueUp format or custom format)
    const parsed = JSON.parse(qrData);
    
    if (parsed.name || parsed.fullName || parsed.firstName) {
      return {
        firstname: parsed.firstName,
        lastname: parsed.last_name,
        company: parsed.company || parsed.organization || '',
        position: parsed.position || parsed.jobTitle || parsed.title || '',
        email: parsed.email || '',
        phone: parsed.phone || parsed.phoneNumber || '',
        industry: parsed.industry || '',
        website: parsed.website || '',
        address: parsed.address || '',
        priority: parsed.priority || 'Media',
        leadSource: parsed.leadSource || '',
        notes: parsed.notes || '',
        qrData: qrData
      };
    }
  } catch (error) {
    // If not JSON, try to parse as delimited string (e.g., "Name|Company|Email|Phone")
    const parts = qrData.split('|');
    if (parts.length >= 2) {
      return {
        firstname: parts[0] || '',
        lastname: parts[0] || '',
        company: parts[1] || '',
        email: parts[2] || '',
        phone: parts[3] || '',
        position: parts[4] || '',
        industry: parts[5] || '',
        qrData: qrData
      };
    }
    
    // For simple QR codes with just contact info or URLs
    if (qrData.includes('@')) {
      return {
        email: qrData,
        qrData: qrData
      };
    }
  }
  
  // Return minimal prospect with QR data for manual completion
  return {
    firstname: '',
    lastname: '',
    company: '',
    position: '',
    email: '',
    phone: '',
    industry: '',
    qrData: qrData
  };
};

