const API_URL = 'http://localhost:5000/api/auth'; // Remplace par l'IP de ton backend si besoin

export async function register(data: any) {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function sendOtp(phone: string) {
  const res = await fetch(`${API_URL}/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  return res.json();
}

export async function verifyOtp(phone: string, code: string) {
  const res = await fetch(`${API_URL}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code }),
  });
  return res.json();
}

export async function resetPassword(email: string, password: string) {
  const res = await fetch(`${API_URL}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function requestPasswordReset(email: string) {
  const res = await fetch(`${API_URL}/request-password-reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

export async function resetPasswordWithToken(token: string, password: string) {
  const res = await fetch(`${API_URL}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });
  return res.json();
}

export async function changePassword(currentPassword: string, newPassword: string, token: string) {
  const res = await fetch('http://localhost:5000/api/moniteur/change-password', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return res.json();
}

// Récupérer tous les détails du moniteur
export async function getMoniteurDetails(token: string) {
  const res = await fetch('http://localhost:5000/api/moniteur/details', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return res.json();
}

// Sauvegarder tous les détails du moniteur
type CarPhoto = { photo_url: string };
type Car = { model: string, transmission: string, fuel_type: string, price: number, photos: CarPhoto[] };
export async function updateMoniteurDetails(data: {
  licenses: { type: string }[],
  locations: { place: string }[],
  cars: Car[],
  certificates: { photo_url: string }[],
}, token: string) {
  const res = await fetch('http://localhost:5000/api/moniteur/details', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

// Upload d'une photo de voiture
export async function uploadCarPhoto(carId: number, file: any, token: string) {
  const formData = new FormData();
  formData.append('carId', carId.toString());
  
  // Handle both base64 and file URI
  if (file.uri.startsWith('data:')) {
    // Base64 data - create a blob from base64
    const base64Data = file.uri.split(',')[1];
    const blob = await fetch(file.uri).then(r => r.blob());
    formData.append('photo', {
      uri: file.uri,
      name: file.fileName || 'car.jpg',
      type: file.type || 'image/jpeg',
    } as any);
  } else {
    // File URI
    formData.append('photo', {
      uri: file.uri,
      name: file.fileName || 'car.jpg',
      type: file.type || 'image/jpeg',
    } as any);
  }
  
  console.log('Uploading car photo with FormData:', {
    carId,
    fileName: file.fileName,
    type: file.type,
    uriStartsWith: file.uri.substring(0, 20) + '...'
  });
  
  const res = await fetch('http://localhost:5000/api/moniteur/car-photo', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
    body: formData,
  });
  
  const result = await res.json();
  console.log('Car photo upload response:', result);
  return result;
}

// Supprimer une photo de voiture
export async function deleteCarPhoto(id: number, token: string) {
  const res = await fetch(`http://localhost:5000/api/moniteur/car-photo/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return res.json();
}

// Upload d'un certificat
export async function uploadCertificate(file: any, token: string) {
  const formData = new FormData();
  
  // Handle both base64 and file URI
  if (file.uri.startsWith('data:')) {
    // Base64 data
    formData.append('photo', {
      uri: file.uri,
      name: file.fileName || 'certificate.jpg',
      type: file.type || 'image/jpeg',
    } as any);
  } else {
    // File URI
    formData.append('photo', {
      uri: file.uri,
      name: file.fileName || 'certificate.jpg',
      type: file.type || 'image/jpeg',
    } as any);
  }
  
  const res = await fetch('http://localhost:5000/api/moniteur/certificate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
    body: formData,
  });
  return res.json();
}

// Supprimer un certificat
export async function deleteCertificate(id: number, token: string) {
  const res = await fetch(`http://localhost:5000/api/moniteur/certificate/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return res.json();
} 

export async function updateRole(userId: string, role: 'eleve' | 'moniteur') {
  const res = await fetch(`${API_URL}/update-role`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, role }),
  });
  return res.json();
} 

const NOTIF_URL = 'http://localhost:5000/api/notifications';

export async function getNotifications(token: string) {
  const res = await fetch(NOTIF_URL, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return res.json();
}

export async function markNotificationAsRead(id: number, token: string) {
  const res = await fetch(`${NOTIF_URL}/${id}/read`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return res.json();
}

export async function markAllNotificationsAsRead(token: string) {
  const res = await fetch(`${NOTIF_URL}/read-all`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return res.json();
} 