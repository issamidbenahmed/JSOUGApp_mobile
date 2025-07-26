import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Chip,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

const API_URL = 'http://localhost:5000/api';

const AdminDashboard = () => {
  const [adminBalance, setAdminBalance] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      
      // Récupérer le token d'authentification
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token d\'authentification manquant');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Récupérer le solde admin
      const balanceRes = await fetch(`${API_URL}/admin/balance`, { headers });
      if (!balanceRes.ok) {
        throw new Error(`Erreur balance: ${balanceRes.status}`);
      }
      const balanceData = await balanceRes.json();
      console.log('Balance data:', balanceData);
      setAdminBalance(parseFloat(balanceData.balance) || 0);

      // Récupérer toutes les réservations
      const bookingsRes = await fetch(`${API_URL}/admin/bookings`, { headers });
      if (!bookingsRes.ok) {
        throw new Error(`Erreur bookings: ${bookingsRes.status}`);
      }
      const bookingsData = await bookingsRes.json();
      console.log('Bookings data:', bookingsData);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);

      // Récupérer toutes les transactions
      const transactionsRes = await fetch(`${API_URL}/admin/transactions`, { headers });
      if (!transactionsRes.ok) {
        throw new Error(`Erreur transactions: ${transactionsRes.status}`);
      }
      const transactionsData = await transactionsRes.json();
      console.log('Transactions data:', transactionsData);
      setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
      
    } catch (error) {
      setError(`Impossible de charger les données: ${error.message}`);
      console.error('Erreur fetchData:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'local': return 'Local';
      case 'stripe': return 'Stripe';
      default: return 'Non payé';
    }
  };

  const getTransactionTypeText = (type) => {
    switch (type) {
      case 'recharge': return 'Recharge';
      case 'commission': return 'Commission';
      default: return type;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Vérification que les données sont des tableaux
  const safeBookings = Array.isArray(bookings) ? bookings : [];
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Solde Administrateur */}
      <Card sx={{ mb: 3, bgcolor: '#4CAF50', color: 'white' }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Solde Administrateur
          </Typography>
          <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
            {(typeof adminBalance === 'number' ? adminBalance : 0).toFixed(2)} MAD
          </Typography>
        </CardContent>
      </Card>

      {/* Réservations */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" component="h3">
              Réservations ({safeBookings.length})
            </Typography>
          </Box>
          {safeBookings.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              Aucune réservation trouvée
            </Typography>
          ) : (
            safeBookings.map((booking) => (
              <Box key={booking.id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Réservation #{booking.id}
                  </Typography>
                  <Chip 
                    label={booking.status?.toUpperCase() || 'UNKNOWN'} 
                    color={getStatusColor(booking.status)}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Date: {booking.date} à {booking.hour}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Élève: {booking.eleve_name || `ID: ${booking.eleve_id}`} | Moniteur: {booking.moniteur_name || `ID: ${booking.moniteur_id}`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Commission: {booking.commission} MAD
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Paiement: {getPaymentMethodText(booking.payment_method)} | Statut: {booking.payment_status}
                </Typography>
              </Box>
            ))
          )}
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Transactions ({safeTransactions.length})
          </Typography>
          {safeTransactions.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              Aucune transaction trouvée
            </Typography>
          ) : (
            safeTransactions.map((transaction) => (
              <Box key={transaction.id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {getTransactionTypeText(transaction.type)}
                  </Typography>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: transaction.amount > 0 ? '#4CAF50' : '#F44336'
                    }}
                  >
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount} MAD
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Moniteur: {transaction.moniteur_name || `ID: ${transaction.moniteur_id}`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Description: {transaction.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Date: {new Date(transaction.date).toLocaleString()}
                </Typography>
              </Box>
            ))
          )}
        </CardContent>
      </Card>

      {/* Bouton Actualiser */}
      <Button
        variant="contained"
        startIcon={<RefreshIcon />}
        onClick={fetchData}
        sx={{ mt: 2 }}
      >
        Actualiser
      </Button>
    </Box>
  );
};

export default AdminDashboard; 